import { getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function isAllowedDriveUploadUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' &&
      url.hostname === 'www.googleapis.com' &&
      url.pathname.startsWith('/upload/drive/v3/files')
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const uploadUrl = request.headers.get('x-upload-url')
  const range = request.headers.get('content-range')
  const mimeType = request.headers.get('x-upload-mime-type') ?? 'application/pdf'
  const rangeMatch = range?.match(/^bytes (\d+)-(\d+)\/(\d+)$/)
  if (!uploadUrl || !range || !isAllowedDriveUploadUrl(uploadUrl)) {
    return NextResponse.json({ error: 'Invalid upload chunk request' }, { status: 400 })
  }
  if (!rangeMatch) {
    return NextResponse.json({ error: 'Invalid upload chunk range' }, { status: 400 })
  }

  const chunk = Buffer.from(await request.arrayBuffer())
  if (chunk.byteLength === 0) {
    return NextResponse.json({ error: 'Upload chunk is empty' }, { status: 400 })
  }
  if (mimeType === 'application/pdf' && rangeMatch[1] === '0' && chunk.subarray(0, 5).toString('ascii') !== '%PDF-') {
    return NextResponse.json({ error: 'Invalid PDF file' }, { status: 400 })
  }

  const driveResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': mimeType,
      'Content-Length': String(chunk.byteLength),
      'Content-Range': range,
    },
    body: chunk,
  })

  if (driveResponse.status === 308) {
    return NextResponse.json({ done: false, range: driveResponse.headers.get('range') })
  }

  const text = await driveResponse.text()
  if (!driveResponse.ok) {
    return NextResponse.json({ error: text || driveResponse.statusText }, { status: 502 })
  }

  const file = text ? JSON.parse(text) as { id?: string } : {}
  if (!file.id) {
    return NextResponse.json({ error: 'Google Drive upload returned no file id' }, { status: 502 })
  }

  return NextResponse.json({ done: true, fileId: file.id })
}
