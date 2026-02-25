import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAuthError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (isAuthError(auth)) return auth
  const { id } = await params

  const template = await prisma.dxfTemplate.findUnique({
    where: { id: parseInt(id) },
    include: { products: { select: { id: true, name: true, slug: true } } },
  })

  if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ template })
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (isAuthError(auth)) return auth
  const { id } = await params

  const body = await req.json()
  const template = await prisma.dxfTemplate.update({
    where: { id: parseInt(id) },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.zoneConfig && { zoneConfig: body.zoneConfig }),
    },
  })

  return NextResponse.json({ template })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (isAuthError(auth)) return auth
  const { id } = await params

  const linked = await prisma.product.count({ where: { dxfTemplateId: parseInt(id) } })
  if (linked > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${linked} product(s) still use this template` },
      { status: 409 }
    )
  }

  await prisma.dxfTemplate.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
