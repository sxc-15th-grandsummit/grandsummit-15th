import { createClient, getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { uploadFile, updateFile, setPublicReader, getDriveViewUrl } from '@/lib/google/drive'

const ALLOWED_PAYMENT = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const ALLOWED_FOLLOW = ['image/jpeg', 'image/png', 'image/webp']
const MAX_PAYMENT_BYTES = 10 * 1024 * 1024  // 10MB
const MAX_FOLLOW_BYTES = 5 * 1024 * 1024    // 5MB

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const field = formData.get('field') as string | null  // 'bukti_pembayaran' or 'bukti_follow'
  const competition = formData.get('competition') as string | null

  if (!file || !field || !competition) {
    return NextResponse.json({ error: 'Missing file, field, or competition' }, { status: 400 })
  }

  if (!['bukti_pembayaran', 'bukti_follow'].includes(field)) {
    return NextResponse.json({ error: 'Invalid field name' }, { status: 400 })
  }

  // Validate file type and size
  const isPembayaran = field === 'bukti_pembayaran'
  const allowedTypes = isPembayaran ? ALLOWED_PAYMENT : ALLOWED_FOLLOW
  const maxBytes = isPembayaran ? MAX_PAYMENT_BYTES : MAX_FOLLOW_BYTES

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` }, { status: 400 })
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'File is empty' }, { status: 400 })
  }
  if (file.size > maxBytes) {
    return NextResponse.json({ error: `File too large. Max: ${maxBytes / 1024 / 1024}MB` }, { status: 400 })
  }

  const supabase = await createClient()

  // Resolve team from session (never from body)
  // NOTE: Use .filter() for nested relation columns
  const { data: membership } = await supabase
    .from('team_members')
    .select('team_id, teams!inner(id, competition, drive_folder_id, bukti_pembayaran_drive_id, bukti_follow_drive_id)')
    .eq('profile_id', user.id)
    .filter('teams.competition', 'eq', competition)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'You are not in a team for this competition' }, { status: 403 })
  }

  // Cast required: Supabase client can't infer types for nested relations filtered with .filter()
  // Fields relied upon: id, competition, drive_folder_id, bukti_pembayaran_drive_id, bukti_follow_drive_id
  const team = (membership as any).teams
  if (!team.drive_folder_id) {
    return NextResponse.json({ error: 'Team Drive folder not set up yet' }, { status: 500 })
  }

  // Upload to Supabase Storage (upsert: true)
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const storagePath = `${team.id}/${field}`

  const { error: storageError } = await supabase.storage
    .from('uploads')
    .upload(storagePath, buffer, { contentType: file.type, upsert: true })

  if (storageError) {
    return NextResponse.json({ error: 'Storage upload failed: ' + storageError.message }, { status: 500 })
  }

  // Upload to Google Drive
  const driveIdField = isPembayaran ? 'bukti_pembayaran_drive_id' : 'bukti_follow_drive_id'
  const existingDriveId: string | null = team[driveIdField]
  const fileName = `${field}_${team.id}`

  let driveFileId: string
  try {
    if (existingDriveId) {
      try {
        driveFileId = await updateFile(existingDriveId, file.type, buffer)
      } catch (err: any) {
        // Only fall back to create on 404
        if (err?.code === 404 || err?.status === 404) {
          driveFileId = await uploadFile(fileName, file.type, buffer, team.drive_folder_id)
        } else {
          throw err
        }
      }
    } else {
      driveFileId = await uploadFile(fileName, file.type, buffer, team.drive_folder_id)
    }
  } catch (err) {
    // Note: Supabase Storage was already written at this point (partial write).
    // Storage uses upsert:true, so a retry will overwrite correctly — eventual consistency is achievable.
    console.error('Drive upload failed:', err)
    return NextResponse.json({ error: 'Upload to Drive failed. Please try again.' }, { status: 500 })
  }

  // Save Drive file ID to DB
  const { error: updateError } = await supabase
    .from('teams')
    .update({ [driveIdField]: driveFileId })
    .eq('id', team.id)

  if (updateError) {
    console.error('DB update failed after Drive upload:', updateError, 'driveFileId:', driveFileId)
    return NextResponse.json({ error: 'Internal error saving upload reference' }, { status: 500 })
  }

  // Set public reader (non-fatal — log error but do not fail the upload)
  setPublicReader(driveFileId).catch((err) => console.error('setPublicReader failed:', err))

  return NextResponse.json({
    ok: true,
    url: getDriveViewUrl(driveFileId),
  })
}
