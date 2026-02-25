import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const email = req.nextUrl.searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const order = await prisma.order.findFirst({
    where: {
      id: parseInt(id),
      customerEmail: { equals: email, mode: 'insensitive' },
    },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json({ order })
}
