import path from 'path'
import fs from 'fs/promises'
import { prisma } from './prisma'
import { generateDxf, saveDxf } from './dxf-generator'
import { submitOrder } from './teelaunch'
import { OrderStatus } from '@prisma/client'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'

async function logStatus(orderId: number, status: OrderStatus, note?: string) {
  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status } }),
    prisma.orderStatusEvent.create({
      data: { orderId, status, note, createdBy: 'system' },
    }),
  ])
}

export async function processOrder(orderId: number) {
  let order
  try {
    order = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                dxfTemplate: true,
              },
            },
          },
        },
      },
    })
  } catch {
    console.error(`[order-processor] Order ${orderId} not found`)
    return
  }

  await logStatus(orderId, 'PROCESSING', 'Generating files...')

  const orderDir = path.join(UPLOAD_DIR, 'orders', order.orderNumber)
  await fs.mkdir(orderDir, { recursive: true })

  let dxfPath: string | null = null
  let pngPath: string | null = null

  try {
    // Process the first item (multi-item DXF can be extended later)
    const item = order.items[0]
    const customData = item.customizationData as { zones: { id: string; text: string }[] }
    const textMap: Record<string, string> = {}
    for (const z of customData.zones) textMap[z.id] = z.text

    // Generate DXF if template is configured
    if (item.product.dxfTemplate) {
      const dxfContent = await generateDxf(
        item.product.dxfTemplate.dxfFilePath,
        item.product.dxfTemplate.zoneConfig as { zones: Parameters<typeof generateDxf>[1]['zones'][0][] },
        textMap
      )
      dxfPath = await saveDxf(dxfContent, orderDir, `${order.orderNumber}.dxf`)
    }

    // Save preview PNG if present
    if (item.previewImageUrl?.startsWith('data:image/')) {
      const base64Data = item.previewImageUrl.split(',')[1]
      pngPath = path.join(orderDir, `${order.orderNumber}-preview.png`)
      await fs.writeFile(pngPath, Buffer.from(base64Data, 'base64'))
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        generatedDxfPath: dxfPath ?? undefined,
        generatedPngPath: pngPath ?? undefined,
      },
    })

    await logStatus(orderId, 'FILE_GENERATED', 'DXF and PNG proof generated.')
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await logStatus(orderId, 'PROCESSING', `File generation failed: ${msg}`)
    console.error(`[order-processor] File generation failed for order ${orderId}:`, err)
    return
  }

  // Submit to Teelaunch
  try {
    const items = order.items.map((item) => ({
      teelaunchProductId: item.product.teelaunchProductId || '',
      teelaunchVariantId: item.product.teelaunchVariantId || '',
      quantity: item.quantity,
      artworkUrl: pngPath
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/uploads/orders/${order.orderNumber}/${order.orderNumber}-preview.png`
        : undefined,
    }))

    // Only submit if teelaunch IDs are configured
    if (items.every((i) => i.teelaunchProductId && i.teelaunchVariantId)) {
      const result = await submitOrder(
        order.orderNumber,
        {
          name: order.shippingName,
          line1: order.shippingLine1,
          line2: order.shippingLine2 ?? undefined,
          city: order.shippingCity,
          state: order.shippingState,
          zip: order.shippingZip,
          country: order.shippingCountry,
        },
        items
      )

      await prisma.order.update({
        where: { id: orderId },
        data: {
          teelaunchOrderId: String(result.id),
          teelaunchSubmittedAt: new Date(),
          teelaunchStatus: result.status,
        },
      })

      await logStatus(orderId, 'SUBMITTED_TO_PRINT', `Teelaunch order #${result.id}`)
    } else {
      await logStatus(
        orderId,
        'FILE_GENERATED',
        'Teelaunch IDs not configured — manual submission required.'
      )
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await logStatus(orderId, 'FILE_GENERATED', `Teelaunch submission failed: ${msg}`)
    console.error(`[order-processor] Teelaunch submission failed for order ${orderId}:`, err)
  }
}
