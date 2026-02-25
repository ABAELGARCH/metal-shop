import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAuthError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isAuthError(auth)) return auth

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalOrders,
    monthOrders,
    pendingOrders,
    totalRevenue,
    monthRevenue,
    recentOrders,
    productCount,
  ] = await prisma.$transaction([
    prisma.order.count({ where: { status: { not: 'PENDING_PAYMENT' } } }),
    prisma.order.count({
      where: { createdAt: { gte: monthStart }, status: { not: 'PENDING_PAYMENT' } },
    }),
    prisma.order.count({ where: { status: { in: ['PAID', 'PROCESSING', 'FILE_GENERATED'] } } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { notIn: ['PENDING_PAYMENT', 'PAYMENT_FAILED', 'CANCELLED', 'REFUNDED'] } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: monthStart },
        status: { notIn: ['PENDING_PAYMENT', 'PAYMENT_FAILED', 'CANCELLED', 'REFUNDED'] },
      },
    }),
    prisma.order.findMany({
      where: { status: { not: 'PENDING_PAYMENT' } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        status: true,
        total: true,
        createdAt: true,
      },
    }),
    prisma.product.count({ where: { published: true } }),
  ])

  return NextResponse.json({
    totalOrders,
    monthOrders,
    pendingOrders,
    totalRevenue: totalRevenue._sum.total ?? 0,
    monthRevenue: monthRevenue._sum.total ?? 0,
    recentOrders,
    productCount,
  })
}
