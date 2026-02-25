import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAuthError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isAuthError(auth)) return auth

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20
  const status = searchParams.get('status')
  const search = searchParams.get('search') || ''

  const where = {
    ...(status && { status: status as never }),
    ...(search && {
      OR: [
        { orderNumber: { contains: search, mode: 'insensitive' as const } },
        { customerEmail: { contains: search, mode: 'insensitive' as const } },
        { customerName: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        customerName: true,
        customerEmail: true,
        total: true,
        createdAt: true,
        teelaunchOrderId: true,
        trackingNumber: true,
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
  ])

  return NextResponse.json({ orders, total, page, pages: Math.ceil(total / limit) })
}
