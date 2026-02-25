import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } })
  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await signToken({
    sub: String(admin.id),
    email: admin.email,
    name: admin.name,
  })

  return NextResponse.json({
    token,
    admin: { id: admin.id, email: admin.email, name: admin.name },
  })
}
