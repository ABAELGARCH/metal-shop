import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAuthError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (isAuthError(auth)) return auth
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) },
    include: {
      items: { include: { product: { select: { name: true, slug: true } } } },
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ order })
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (isAuthError(auth)) return auth
  const { id } = await params

  const body = await req.json() as {
    status?: OrderStatus
    notes?: string
    trackingNumber?: string
    trackingCarrier?: string
    trackingUrl?: string
    teelaunchStatus?: string
  }

  const order = await prisma.order.update({
    where: { id: parseInt(id) },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.trackingNumber && { trackingNumber: body.trackingNumber }),
      ...(body.trackingCarrier && { trackingCarrier: body.trackingCarrier }),
      ...(body.trackingUrl && { trackingUrl: body.trackingUrl }),
      ...(body.teelaunchStatus && { teelaunchStatus: body.teelaunchStatus }),
      ...(body.status === 'SHIPPED' && { shippedAt: new Date() }),
    },
  })

  if (body.status) {
    await prisma.orderStatusEvent.create({
      data: {
        orderId: parseInt(id),
        status: body.status,
        createdBy: auth.admin.email,
        note: `Status updated by admin`,
      },
    })
  }

  return NextResponse.json({ order })
}
