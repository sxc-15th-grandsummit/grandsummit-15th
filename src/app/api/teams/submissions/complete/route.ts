import { getDriveFileMetadata, getDriveViewUrl, setPublicReader } from '@/lib/google/drive'
import { canAccessBccFinalSubmission, canAccessMccPitchDeckSubmission, getSubmissionRequirement, isSubmissionRoundExpired } from '@/lib/submissions'
import { createClient, getSessionUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type CompleteBody = {
  competition?: unknown
  round?: unknown
  requirement_key?: unknown
  drive_file_id?: unknown
  original_filename?: unknown
  mime_type?: unknown
  size_bytes?: unknown
}

type TeamRecord = {
  id: string
  competition: string
  is_finalist: boolean
  join_code: string
  drive_folder_id: string | null
  bukti_pembayaran_drive_id: string | null
  task_ktm_drive_id: string | null
  task_cv_drive_id: string | null
  task_repost_drive_id: string | null
  task_broadcast_drive_id: string | null
  task_twibbon_drive_id: string | null
  task_follow_ig_drive_id: string | null
  task_follow_li_drive_id: string | null
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

function parseBody(value: CompleteBody | null) {
  if (!value) return null
  const {
    competition,
    round,
    requirement_key: requirementKey,
    drive_file_id: driveFileId,
    original_filename: originalFilename,
    mime_type: mimeType,
    size_bytes: sizeBytes,
  } = value

  if (
    typeof competition !== 'string' ||
    typeof round !== 'string' ||
    typeof requirementKey !== 'string' ||
    typeof driveFileId !== 'string' ||
    typeof originalFilename !== 'string' ||
    typeof mimeType !== 'string' ||
    typeof sizeBytes !== 'number'
  ) {
    return null
  }

  return { competition, round, requirementKey, driveFileId, originalFilename, mimeType, sizeBytes }
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = parseBody(await request.json().catch(() => null))
  if (!body) return NextResponse.json({ error: 'Invalid upload completion request' }, { status: 400 })

  const requirement = getSubmissionRequirement(body.competition, body.round, body.requirementKey)
  if (!requirement) return NextResponse.json({ error: 'Invalid submission requirement' }, { status: 400 })

  if (isSubmissionRoundExpired(body.competition, body.round)) {
    return NextResponse.json({ error: 'Submission deadline has passed' }, { status: 400 })
  }

  if (!requirement.allowedTypes.includes(body.mimeType)) {
    return NextResponse.json({ error: `Invalid file type. Allowed: ${requirement.allowedTypes.join(', ')}` }, { status: 400 })
  }
  if (body.sizeBytes <= 0) return NextResponse.json({ error: 'File is empty' }, { status: 400 })
  if (body.sizeBytes > requirement.maxBytes) {
    return NextResponse.json({ error: `File too large. Max: ${requirement.maxBytes / 1024 / 1024}MB` }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: membership } = await supabase
    .from('team_members')
    .select(`
      team_id,
      teams!inner(
        id, competition, join_code, is_finalist, drive_folder_id, bukti_pembayaran_drive_id,
        task_ktm_drive_id, task_cv_drive_id, task_repost_drive_id, task_broadcast_drive_id,
        task_twibbon_drive_id, task_follow_ig_drive_id, task_follow_li_drive_id
      )
    `)
    .eq('profile_id', user.id)
    .filter('teams.competition', 'eq', body.competition)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'You are not in a team for this competition' }, { status: 403 })
  }

  const team = (membership as unknown as { teams: TeamRecord }).teams
  if (body.competition === 'BCC' && body.round === 'final' && !canAccessBccFinalSubmission(team)) {
    return NextResponse.json({ error: 'Only BCC finalists can access final submission' }, { status: 403 })
  }
  if (!team.drive_folder_id) {
    return NextResponse.json({ error: 'Team does not have a Drive folder. Please contact admin.' }, { status: 500 })
  }
  if (body.competition === 'MCC' && body.round === 'preliminary' && !canAccessMccPitchDeckSubmission(team)) {
    return NextResponse.json({ error: 'Complete all MCC registration tasks before uploading the pitch deck' }, { status: 403 })
  }

  const { data: submissionRound } = await supabase
    .from('team_submission_rounds')
    .select('submitted_at')
    .eq('team_id', team.id)
    .eq('competition', body.competition)
    .eq('round', body.round)
    .maybeSingle()

  if ((submissionRound as SubmissionRoundRecord | null)?.submitted_at) {
    return NextResponse.json({ error: 'Submission has already been finalized' }, { status: 400 })
  }

  const metadata = await getDriveFileMetadata(body.driveFileId)
  if (metadata.mimeType !== body.mimeType || Number(metadata.size) !== body.sizeBytes) {
    return NextResponse.json({ error: 'Uploaded Drive file metadata does not match the selected file' }, { status: 400 })
  }

  if (metadata.parents && !metadata.parents.includes(team.drive_folder_id)) {
    return NextResponse.json({ error: 'Uploaded Drive file is not in the team folder' }, { status: 400 })
  }

  setPublicReader(body.driveFileId).catch((err) => console.error('setPublicReader failed:', err))

  const now = new Date().toISOString()
  const { data: savedSubmission, error: upsertError } = await supabase
    .from('team_submissions')
    .upsert({
      team_id: team.id,
      competition: body.competition,
      round: body.round,
      requirement_key: body.requirementKey,
      drive_file_id: body.driveFileId,
      storage_path: null,
      original_filename: body.originalFilename,
      mime_type: body.mimeType,
      size_bytes: body.sizeBytes,
      uploaded_at: now,
      updated_at: now,
    }, { onConflict: 'team_id,competition,round,requirement_key' })
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
    console.error('[Submission Complete] DB upsert failed:', upsertError)
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
