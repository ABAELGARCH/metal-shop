import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAuthError } from '@/lib/auth'
import { processOrder } from '@/lib/order-processor'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req)
  if (isAuthError(auth)) return auth
  const { id } = await params

  setImmediate(() => processOrder(parseInt(id)))

  return NextResponse.json({ ok: true, message: 'Processing started' })
}
