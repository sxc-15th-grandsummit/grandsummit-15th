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
  task_ktm:               { dbColumn: 'task_ktm_drive_id',             allowedTypes: PDF_ONLY,     maxBytes: MAX_5MB },
  task_cv:                { dbColumn: 'task_cv_drive_id',              allowedTypes: PDF_ONLY,     maxBytes: MAX_5MB },
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
    .select('team_id, teams!inner(id, competition, drive_folder_id, bukti_pembayaran_drive_id, bukti_follow_drive_id, task_ktm_drive_id, task_repost_drive_id, task_broadcast_drive_id, task_twibbon_drive_id, task_follow_ig_drive_id, task_follow_li_drive_id)')
    .eq('profile_id', user.id)
    .filter('teams.competition', 'eq', competition)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'You are not in a team for this competition' }, { status: 403 })
  }

  // Supabase returns teams as an object (not array) when using .single()
  const team = membership.teams as unknown as Record<string, unknown>
  console.log(`[Upload] Team=${team.id}, field=${field}, drive_folder_id=${team.drive_folder_id}`)

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const storagePath = `${team.id}/${field}`

  // Step 1: Supabase Storage (backup — always required)
  const { error: storageError } = await supabase.storage
    .from('uploads')
    .upload(storagePath, buffer, { contentType: file.type, upsert: true })

  if (storageError) {
    return NextResponse.json({ error: 'Storage upload failed: ' + storageError.message }, { status: 500 })
  }
  console.log(`[Upload] Supabase Storage OK: ${storagePath}`)

  // Step 2: Google Drive (blocking — must succeed so the file is in the team folder)
  let driveFileId: string | null = null
  if (!team.drive_folder_id) {
    console.error(`[Upload] Team ${team.id} has no drive_folder_id!`)
    return NextResponse.json({ error: 'Team does not have a Drive folder. Please contact admin.' }, { status: 500 })
  }

  try {
    const existingDriveId: string | null = team[config.dbColumn] as string | null
    console.log(`[Upload] existingDriveId for ${config.dbColumn}:`, existingDriveId)
    const fileName = `${field}_${team.id}`
    if (existingDriveId && !existingDriveId.startsWith('supabase:')) {
      try {
        driveFileId = await updateFile(existingDriveId, file.type, buffer)
        console.log(`[Upload] Drive update OK:`, driveFileId)
      } catch (err: unknown) {
        const e = err as { code?: number; status?: number }
        if (e?.code === 404 || e?.status === 404) {
          driveFileId = await uploadFile(fileName, file.type, buffer, team.drive_folder_id as string)
          console.log(`[Upload] Drive create (after 404) OK:`, driveFileId)
        } else {
          throw err
        }
      }
    } else {
      driveFileId = await uploadFile(fileName, file.type, buffer, team.drive_folder_id as string)
      console.log(`[Upload] Drive create OK:`, driveFileId)
    }
    if (driveFileId) {
      setPublicReader(driveFileId).catch((err) => console.error('setPublicReader failed:', err))
    }
  } catch (err: unknown) {
    const detail = (err as Error)?.message ?? String(err)
    console.error('[Upload] Drive upload failed:', detail)
    return NextResponse.json({ error: `Failed to upload to Google Drive: ${detail}` }, { status: 500 })
  }

  // Step 3: Mark as uploaded in DB
  const dbValue = driveFileId
  console.log(`[Upload] Saving to DB: ${config.dbColumn} =`, dbValue)
  const { error: updateError } = await supabase
    .from('teams')
    .update({ [config.dbColumn]: dbValue })
    .eq('id', team.id)

  if (updateError) {
    console.error('[Upload] DB update failed:', updateError)
    return NextResponse.json({ error: 'Internal error saving upload reference' }, { status: 500 })
  }

  syncTeamsToSheets().catch(() => {})
  const url = driveFileId ? getDriveViewUrl(driveFileId) : null
  console.log(`[Upload] DONE — url:`, url)
  return NextResponse.json({ ok: true, url, driveFileId, storagePath })
}
