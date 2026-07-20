import { uploadFile, updateFile, setPublicReader, getDriveViewUrl } from '@/lib/google/drive'
import { canAccessBccFinalSubmission, getSubmissionRequirement, isSubmissionRoundExpired } from '@/lib/submissions'
import { createClient, getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type TeamRecord = {
  id: string
  competition: string
  is_finalist: boolean
  drive_folder_id: string | null
}

type ExistingSubmissionRecord = {
  drive_file_id: string | null
}

type SubmissionRoundRecord = {
  submitted_at: string | null
}

type SubmissionItemRecord = {
  requirement_key: string
  drive_file_id: string | null
  storage_path: string | null
  original_filename: string
  mime_type: string
  size_bytes: number
  uploaded_at: string
  updated_at: string
}

function hasPdfSignature(buffer: Buffer) {
  return buffer.subarray(0, 5).toString('ascii') === '%PDF-'
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file')
  const competition = formData.get('competition')
  const round = formData.get('round')
  const requirementKey = formData.get('requirement_key')

  if (!(file instanceof File) || typeof competition !== 'string' || typeof round !== 'string' || typeof requirementKey !== 'string') {
    return NextResponse.json({ error: 'Missing file, competition, round, or requirement_key' }, { status: 400 })
  }

  const requirement = getSubmissionRequirement(competition, round, requirementKey)
  if (!requirement) {
    return NextResponse.json({ error: 'Invalid submission requirement' }, { status: 400 })
  }

  if (isSubmissionRoundExpired(competition, round)) {
    return NextResponse.json({ error: 'Submission deadline has passed' }, { status: 400 })
  }

  if (!requirement.allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: `Invalid file type. Allowed: ${requirement.allowedTypes.join(', ')}` }, { status: 400 })
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'File is empty' }, { status: 400 })
  }
  if (file.size > requirement.maxBytes) {
    return NextResponse.json({ error: `File too large. Max: ${requirement.maxBytes / 1024 / 1024}MB` }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: membership } = await supabase
    .from('team_members')
    .select('team_id, teams!inner(id, competition, is_finalist, drive_folder_id)')
    .eq('profile_id', user.id)
    .filter('teams.competition', 'eq', competition)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'You are not in a team for this competition' }, { status: 403 })
  }

  const team = (membership as unknown as { teams: TeamRecord }).teams
  if (competition === 'BCC' && round === 'final' && !canAccessBccFinalSubmission(team)) {
    return NextResponse.json({ error: 'Only BCC finalists can access final submission' }, { status: 403 })
  }
  if (!team.drive_folder_id) {
    return NextResponse.json({ error: 'Team does not have a Drive folder. Please contact admin.' }, { status: 500 })
  }

  const { data: submissionRound } = await supabase
    .from('team_submission_rounds')
    .select('submitted_at')
    .eq('team_id', team.id)
    .eq('competition', competition)
    .eq('round', round)
    .maybeSingle()

  if ((submissionRound as SubmissionRoundRecord | null)?.submitted_at) {
    return NextResponse.json({ error: 'Submission has already been finalized' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  if (!hasPdfSignature(buffer)) {
    return NextResponse.json({ error: 'Invalid PDF file' }, { status: 400 })
  }

  const { data: existingSubmission } = await supabase
    .from('team_submissions')
    .select('drive_file_id')
    .eq('team_id', team.id)
    .eq('competition', competition)
    .eq('round', round)
    .eq('requirement_key', requirementKey)
    .maybeSingle()

  let driveFileId: string

  try {
    const existingDriveId = (existingSubmission as ExistingSubmissionRecord | null)?.drive_file_id
    const fileName = `${requirementKey}_${round}_${team.id}`

    if (existingDriveId && !existingDriveId.startsWith('supabase:')) {
      try {
        driveFileId = await updateFile(existingDriveId, file.type, buffer)
      } catch (err: unknown) {
        const e = err as { code?: number; status?: number }
        if (e?.code === 404 || e?.status === 404) {
          driveFileId = await uploadFile(fileName, file.type, buffer, team.drive_folder_id)
        } else {
          throw err
        }
      }
    } else {
      driveFileId = await uploadFile(fileName, file.type, buffer, team.drive_folder_id)
    }

    setPublicReader(driveFileId).catch((err) => console.error('setPublicReader failed:', err))
  } catch (err: unknown) {
    const detail = (err as Error)?.message ?? String(err)
    console.error('[Submission Upload] Drive upload failed:', detail)
    return NextResponse.json({ error: `Failed to upload to Google Drive: ${detail}` }, { status: 500 })
  }

  const now = new Date().toISOString()
  const upsertPayload = {
    team_id: team.id,
    competition,
    round,
    requirement_key: requirementKey,
    drive_file_id: driveFileId,
    storage_path: null,
    original_filename: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    uploaded_at: now,
    updated_at: now,
  }

  const { data: savedSubmission, error: upsertError } = await supabase
    .from('team_submissions')
    .upsert(upsertPayload, { onConflict: 'team_id,competition,round,requirement_key' })
    .select(`
      requirement_key,
      drive_file_id,
      storage_path,
      original_filename,
      mime_type,
      size_bytes,
      uploaded_at,
      updated_at
    `)
    .single()

  if (upsertError) {
    console.error('[Submission Upload] DB upsert failed:', upsertError)
    return NextResponse.json({ error: 'Internal error saving upload reference' }, { status: 500 })
  }

  const item = savedSubmission as SubmissionItemRecord

  return NextResponse.json({
    ok: true,
    item: {
      ...item,
      url: item.drive_file_id ? getDriveViewUrl(item.drive_file_id) : null,
    },
  })
}
