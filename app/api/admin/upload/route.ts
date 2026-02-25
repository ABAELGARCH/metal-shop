import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAuthError } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (isAuthError(auth)) return auth

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const type = (formData.get('type') as string) || 'products'

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
  }

  const ext = path.extname(file.name).toLowerCase()
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.dxf']
  if (!allowed.includes(ext)) {
    return NextResponse.json({ error: `File type ${ext} not allowed` }, { status: 400 })
  }

  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase()
  const filename = `${timestamp}-${safeName}`
  const dir = path.join(UPLOAD_DIR, type)

  await mkdir(dir, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(dir, filename), buffer)

  const url = `/uploads/${type}/${filename}`
  return NextResponse.json({ url, filename })
}
