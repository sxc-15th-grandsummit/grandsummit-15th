import { createClient, getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { uploadFile, updateFile, setPublicReader, getDriveViewUrl } from '@/lib/google/drive'
import { syncTeamsToSheets } from '@/lib/sync-sheets'

const PDF_ONLY = ['application/pdf']
const IMAGE_OR_PDF = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_5MB  = 5 * 1024 * 1024

// Map field name → { dbColumn, allowedTypes, maxBytes }
const FIELD_CONFIG: Record<string, { dbColumn: string; allowedTypes: string[]; maxBytes: number }> = {
  bukti_pembayaran:       { dbColumn: 'bukti_pembayaran_drive_id',     allowedTypes: IMAGE_OR_PDF, maxBytes: MAX_5MB },
  bukti_follow:           { dbColumn: 'bukti_follow_drive_id',         allowedTypes: IMAGE_OR_PDF, maxBytes: MAX_5MB },
  task_repost:            { dbColumn: 'task_repost_drive_id',          allowedTypes: PDF_ONLY,     maxBytes: MAX_5MB },
  task_broadcast:         { dbColumn: 'task_broadcast_drive_id',       allowedTypes: PDF_ONLY,     maxBytes: MAX_5MB },
  task_twibbon:           { dbColumn: 'task_twibbon_drive_id',         allowedTypes: PDF_ONLY,     maxBytes: MAX_5MB },
  task_follow_ig:         { dbColumn: 'task_follow_ig_drive_id',       allowedTypes: PDF_ONLY,     maxBytes: MAX_5MB },
  task_follow_li:         { dbColumn: 'task_follow_li_drive_id',       allowedTypes: PDF_ONLY,     maxBytes: MAX_5MB },
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const field = formData.get('field') as string | null
  const competition = formData.get('competition') as string | null

  if (!file || !field || !competition) {
    return NextResponse.json({ error: 'Missing file, field, or competition' }, { status: 400 })
  }

  const config = FIELD_CONFIG[field]
  if (!config) {
    return NextResponse.json({ error: 'Invalid field name' }, { status: 400 })
  }

  if (!config.allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: `Invalid file type. Allowed: ${config.allowedTypes.join(', ')}` }, { status: 400 })
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'File is empty' }, { status: 400 })
  }
  if (file.size > config.maxBytes) {
    return NextResponse.json({ error: `File too large. Max: ${config.maxBytes / 1024 / 1024}MB` }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: membership } = await supabase
    .from('team_members')
    .select('team_id, teams!inner(id, competition, drive_folder_id, bukti_pembayaran_drive_id, bukti_follow_drive_id, task_repost_drive_id, task_broadcast_drive_id, task_twibbon_drive_id, task_follow_ig_drive_id, task_follow_li_drive_id)')
    .eq('profile_id', user.id)
    .filter('teams.competition', 'eq', competition)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'You are not in a team for this competition' }, { status: 403 })
  }

  const team = (membership as any).teams

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const storagePath = `${team.id}/${field}`

  // Step 1: Supabase Storage (primary — always required)
  const { error: storageError } = await supabase.storage
    .from('uploads')
    .upload(storagePath, buffer, { contentType: file.type, upsert: true })

  if (storageError) {
    return NextResponse.json({ error: 'Storage upload failed: ' + storageError.message }, { status: 500 })
  }

  // Step 2: Google Drive (secondary — best-effort, never blocks the upload)
  let driveFileId: string | null = null
  if (team.drive_folder_id) {
    try {
      const existingDriveId: string | null = team[config.dbColumn]
      const fileName = `${field}_${team.id}`
      if (existingDriveId) {
        try {
          driveFileId = await updateFile(existingDriveId, file.type, buffer)
        } catch (err: any) {
          if (err?.code === 404 || err?.status === 404) {
            driveFileId = await uploadFile(fileName, file.type, buffer, team.drive_folder_id)
          } else {
            throw err
          }
        }
      } else {
        driveFileId = await uploadFile(fileName, file.type, buffer, team.drive_folder_id)
      }
      if (driveFileId) {
        setPublicReader(driveFileId).catch((err) => console.error('setPublicReader failed:', err))
      }
    } catch (err) {
      // Non-fatal: file is safe in Supabase Storage
      console.error('Drive upload failed (non-fatal):', err)
    }
  }

  // Step 3: Mark as uploaded in DB (use drive ID if available, else storage path as marker)
  const dbValue = driveFileId ?? `supabase:${storagePath}`
  const { error: updateError } = await supabase
    .from('teams')
    .update({ [config.dbColumn]: dbValue })
    .eq('id', team.id)

  if (updateError) {
    console.error('DB update failed:', updateError)
    return NextResponse.json({ error: 'Internal error saving upload reference' }, { status: 500 })
  }

  syncTeamsToSheets().catch(() => {})
  const url = driveFileId ? getDriveViewUrl(driveFileId) : null
  return NextResponse.json({ ok: true, url })
}
