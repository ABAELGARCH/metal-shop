import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAuthError } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const result = await requireAdmin(req)
  if (isAuthError(result)) return result
  return NextResponse.json({ admin: result.admin })
}
