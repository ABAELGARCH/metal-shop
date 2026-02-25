import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { CheckoutFormSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = CheckoutFormSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const form = parsed.data
  const { paymentIntentId } = body as { paymentIntentId: string }

  if (!paymentIntentId) {
    return NextResponse.json({ error: 'Missing paymentIntentId' }, { status: 400 })
  }

  // Verify payment with Stripe
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
  if (pi.status !== 'succeeded') {
    return NextResponse.json({ error: 'Payment not confirmed' }, { status: 400 })
  }

  // Check if order already exists for this payment intent
  const existing = await prisma.order.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
  })
  if (existing) {
    return NextResponse.json({ orderId: existing.id, orderNumber: existing.orderNumber })
  }

  // Generate order number
  const count = await prisma.order.count()
  const orderNumber = `MTL-${String(count + 1).padStart(4, '0')}`

  // Server-side price re-calculation
  let subtotal = 0
  const itemsWithPrices = []
  for (const item of form.items) {
    const product = await prisma.product.findUniqueOrThrow({
      where: { id: item.productId },
      select: { id: true, name: true, slug: true, price: true },
    })
    subtotal += product.price * item.quantity
    itemsWithPrices.push({ ...item, serverPrice: product.price, product })
  }

  const shippingSetting = await prisma.setting.findUnique({ where: { key: 'shipping_cost' } })
  const shippingCost = shippingSetting ? parseInt(shippingSetting.value) : 999
  const total = subtotal + shippingCost

  const order = await prisma.order.create({
    data: {
      orderNumber,
      status: 'PAID',
      customerEmail: form.customerEmail,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      shippingName: form.shippingName,
      shippingLine1: form.shippingLine1,
      shippingLine2: form.shippingLine2,
      shippingCity: form.shippingCity,
      shippingState: form.shippingState,
      shippingZip: form.shippingZip,
      shippingCountry: form.shippingCountry,
      subtotal,
      shippingCost,
      total,
      stripePaymentIntentId: paymentIntentId,
      stripePaidAt: new Date(),
      statusHistory: {
        create: { status: 'PAID', createdBy: 'checkout-confirm' },
      },
      items: {
        create: itemsWithPrices.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          productSlug: item.product.slug,
          quantity: item.quantity,
          unitPrice: item.serverPrice,
          customizationData: item.customizationData,
          previewImageUrl: item.previewBase64 ?? null,
        })),
      },
    },
  })

  return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber })
}
