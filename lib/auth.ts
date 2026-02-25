import { SignJWT, jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './prisma'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-in-production-min-32-chars'
)

export type AdminPayload = {
  sub: string  // admin user id as string
  email: string
  name: string
}

export async function signToken(payload: AdminPayload): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as AdminPayload
  } catch {
    return null
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  return req.cookies.get('admin_token')?.value ?? null
}

export async function requireAdmin(req: NextRequest): Promise<
  { admin: { id: number; email: string; name: string } } | NextResponse
> {
  const token = getTokenFromRequest(req)
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: parseInt(payload.sub) },
    select: { id: true, email: true, name: true },
  })

  if (!admin) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 })
  }

  return { admin }
}

export function isAuthError(result: unknown): result is NextResponse {
  return result instanceof NextResponse
}
