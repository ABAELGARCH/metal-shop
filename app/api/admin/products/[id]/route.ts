import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAuthError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProductAdminSchema } from '@/lib/validations'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (isAuthError(auth)) return auth
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      category: true,
      dxfTemplate: true,
    },
  })

  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ product })
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (isAuthError(auth)) return auth
  const { id } = await params

  const body = await req.json()
  const parsed = ProductAdminSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const product = await prisma.product.update({
    where: { id: parseInt(id) },
    data: {
      ...parsed.data,
      ...(parsed.data.customizationConfig && {
        customizationConfig: parsed.data.customizationConfig as object,
      }),
    },
  })

  return NextResponse.json({ product })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (isAuthError(auth)) return auth
  const { id } = await params

  await prisma.product.update({
    where: { id: parseInt(id) },
    data: { published: false },
  })

  return NextResponse.json({ ok: true })
}
