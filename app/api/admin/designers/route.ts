import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAuthError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isAuthError(auth)) return auth

  const templates = await prisma.dxfTemplate.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { products: true } } },
  })

  return NextResponse.json({ templates })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isAuthError(auth)) return auth

  const body = await req.json()

  if (!body.name || !body.dxfFilePath || !body.zoneConfig) {
    return NextResponse.json({ error: 'name, dxfFilePath, zoneConfig required' }, { status: 400 })
  }

  const template = await prisma.dxfTemplate.create({
    data: {
      name: body.name,
      description: body.description,
      dxfFilePath: body.dxfFilePath,
      zoneConfig: body.zoneConfig,
    },
  })

  return NextResponse.json({ template }, { status: 201 })
}
