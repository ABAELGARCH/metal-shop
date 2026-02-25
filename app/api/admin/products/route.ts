import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAuthError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProductAdminSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isAuthError(auth)) return auth

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20
  const search = searchParams.get('search') || ''

  const where = search
    ? { OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { slug: { contains: search, mode: 'insensitive' as const } },
      ]}
    : {}

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        category: true,
        _count: { select: { orderItems: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isAuthError(auth)) return auth

  const body = await req.json()
  const parsed = ProductAdminSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      customizationConfig: parsed.data.customizationConfig as object,
    },
  })

  return NextResponse.json({ product }, { status: 201 })
}
