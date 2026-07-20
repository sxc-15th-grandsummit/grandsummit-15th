'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { getSubmissionRoundConfig } from '@/lib/submissions'

const SUBMISSION_UPLOAD_CHUNK_SIZE = 3 * 1024 * 1024

function formatCountdown(deadline: string | null | undefined, now: Date) {
  if (!deadline) return { days: '00', hours: '00', minutes: '00', seconds: '00', expired: true }

  const diff = new Date(deadline).getTime() - now.getTime()
  if (!Number.isFinite(diff) || diff <= 0) {
    return { days: '00', hours: '00', minutes: '00', seconds: '00', expired: true }
  }

  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    expired: false,
  }
}

function formatWibDateTime(value: string | null | undefined) {
  if (!value) return ''

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value)) + ' WIB'
}

function formatMaxFileSize(maxBytes: number) {
  return `${Math.round(maxBytes / 1024 / 1024)} MB`
}

type SubmissionItem = {
  requirement_key: string
  drive_file_id: string | null
  storage_path: string | null
  original_filename: string | null
  mime_type: string | null
  size_bytes: number | null
  url: string | null
  uploaded_at: string | null
  updated_at: string | null
}

type SubmissionRoundRequirement = {
  key: string
  label: string
  description: string
  expectedFileName: string
  accept: string
  maxBytes: number
}

type SubmissionRoundConfigView = {
  label: string
  deadline: string
  guidebookUrl: string
  caseLinkUrl?: string
  proposalGuidelineUrl?: string
  resourceLinks?: Array<{ label: string; url: string }>
  requirements: SubmissionRoundRequirement[]
  closeAt: string
}

type SubmissionRoundState = {
  config: SubmissionRoundConfigView
  items: SubmissionItem[]
  submitted_at: string | null
  deadline: string
  close_at: string
}

type SubmissionTeam = {
  submissions?: { preliminary?: SubmissionRoundState; semifinal?: SubmissionRoundState; final?: SubmissionRoundState } | null
}

type SubmissionRoundProps<T extends SubmissionTeam> = {
  competition?: 'BCC' | 'MCC'
  round: 'preliminary' | 'semifinal' | 'final'
  team: T
  onTeamUpdate: (updatedTeam: T) => void
}

export default function SubmissionRound<T extends SubmissionTeam>({ competition = 'BCC', round, team, onTeamUpdate }: SubmissionRoundProps<T>) {
  const [uploadingTask, setUploadingTask] = useState<string | null>(null)
  const [uploadMsg, setUploadMsg] = useState<Record<string, string>>({})
  const [countdownNow, setCountdownNow] = useState(() => new Date())
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const configFromLib = getSubmissionRoundConfig(competition, round)
  const roundState = team.submissions?.[round] ?? null
  const config = roundState?.config ?? configFromLib
  const items = roundState?.items ?? []
  const submittedAt = roundState?.submitted_at ?? null
  const deadline = roundState?.deadline ?? config?.deadline ?? ''
  const closeAt = roundState?.close_at ?? config?.closeAt ?? ''
  const countdown = formatCountdown(closeAt, countdownNow)
  const expired = countdown.expired
  const locked = Boolean(submittedAt) || expired
  const uploadedKeys = new Set(items.filter(item => item.drive_file_id).map(item => item.requirement_key))
  const complete = Boolean(
    config?.requirements.every(requirement => uploadedKeys.has(requirement.key)),
  )
  const guidebookUrl = config?.guidebookUrl ?? 'https://drive.google.com/drive/folders/1LhbLaP1W1x-wecUtsq-lCrDsGOrIRoR_'

  useEffect(() => {
    const timer = window.setInterval(() => setCountdownNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  async function handleSubmissionUpload(requirementKey: string, file: File) {
    if (locked || !config) return

    const requirement = config.requirements.find(req => req.key === requirementKey)
    if (!requirement) return

    const messageKey = `submission:${requirementKey}`
    if (file.size > requirement.maxBytes) {
      setUploadMsg(m => ({
        ...m,
        [messageKey]: `File too large. Max: ${formatMaxFileSize(requirement.maxBytes)}`,
      }))
      return
    }

    setUploadingTask(messageKey)
    setUploadMsg(m => ({ ...m, [messageKey]: '' }))

    try {
      const sessionRes = await fetch('/api/teams/submissions/upload-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competition,
          round,
          requirement_key: requirementKey,
          filename: file.name,
          mime_type: file.type,
          size_bytes: file.size,
        }),
      })
      const sessionData = await sessionRes.json().catch(() => ({ error: 'Upload failed' }))
      if (!sessionRes.ok || typeof sessionData.uploadUrl !== 'string') {
        throw new Error(sessionData.error ?? 'Upload failed')
      }

      let driveFileId: string | null = null
      for (let start = 0; start < file.size; start += SUBMISSION_UPLOAD_CHUNK_SIZE) {
        const end = Math.min(start + SUBMISSION_UPLOAD_CHUNK_SIZE, file.size) - 1
        const chunk = file.slice(start, end + 1)
        const chunkRes = await fetch('/api/teams/submissions/upload-chunk', {
          method: 'POST',
          headers: {
            'x-upload-url': sessionData.uploadUrl,
            'x-upload-mime-type': file.type,
            'Content-Range': `bytes ${start}-${end}/${file.size}`,
          },
          body: chunk,
        })
        const chunkData = await chunkRes.json().catch(() => ({ error: 'Upload failed' }))
        if (!chunkRes.ok) throw new Error(chunkData.error ?? 'Upload failed')
        if (chunkData.done === true && typeof chunkData.fileId === 'string') {
          driveFileId = chunkData.fileId
        }
      }

      if (!driveFileId) throw new Error('Upload failed')

      const completeRes = await fetch('/api/teams/submissions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competition,
          round,
          requirement_key: requirementKey,
          drive_file_id: driveFileId,
          original_filename: file.name,
          mime_type: file.type,
          size_bytes: file.size,
        }),
      })
      const completeData = await completeRes.json().catch(() => ({ error: 'Upload failed' }))
      if (!completeRes.ok) throw new Error(completeData.error ?? 'Upload failed')

      setUploadMsg(m => ({ ...m, [messageKey]: 'Uploaded!' }))

      const existingItems = items.filter(item => item.requirement_key !== requirementKey)
      const newItem = completeData.item as SubmissionItem
      const newRoundState = roundState
        ? { ...roundState, items: [...existingItems, newItem] }
        : {
            config: config!,
            items: [newItem],
            submitted_at: null,
            deadline,
            close_at: closeAt,
          }

      onTeamUpdate({
        ...team,
        submissions: {
          ...(team.submissions ?? { preliminary: undefined }),
          [round]: newRoundState,
        } as T['submissions'],
      })
    } catch (err) {
      setUploadMsg(m => ({ ...m, [messageKey]: (err as Error)?.message ?? 'Upload failed' }))
    } finally {
      setUploadingTask(null)
    }
  }

  async function handleFinalSubmission() {
    if (!complete || locked) return
    if (!confirm(`After submitting, your ${round} submission will be locked and cannot be changed. Continue?`)) return

    setUploadMsg(m => ({ ...m, [`${round}_submit`]: '' }))

    const res = await fetch('/api/teams/submissions/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ competition, round }),
    })
    const data = await res.json()

    if (res.ok) {
      const newRoundState = roundState
        ? { ...roundState, submitted_at: data.submitted_at }
        : {
            config: config!,
            items: [],
            submitted_at: data.submitted_at,
            deadline,
            close_at: closeAt,
          }

      onTeamUpdate({
        ...team,
        submissions: {
          ...(team.submissions ?? { preliminary: undefined }),
          [round]: newRoundState,
        } as T['submissions'],
      })
      setUploadMsg(m => ({
        ...m,
        [`${round}_submit`]: `Your ${round} submission has been received. The committee will review your submission. Please check your email regularly for updates.`,
      }))
    } else {
      setUploadMsg(m => ({ ...m, [`${round}_submit`]: data.error ?? 'Submit failed' }))
    }
  }

  if (!config) {
    return (
      <div className="rounded-[14px] px-5 py-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <p className="font-poppins text-sm text-white/60">Submission data is not available yet.</p>
      </div>
    )
  }

  return (
    <motion.div
      key={round}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-plus-jakarta text-xl font-bold text-white">{config.label} Submission</h2>
          {submittedAt && (
            <p className="mt-1 font-poppins text-xs text-accent-teal/80">
              Submitted at {formatWibDateTime(submittedAt)}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {(config.resourceLinks?.length ? config.resourceLinks : null)?.map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold font-plus-jakarta text-white transition hover:brightness-110"
              style={{ background: 'rgba(87,174,165,0.35)', border: '1px solid rgba(87,174,165,0.4)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              {link.label}
            </a>
          ))}
          {!config.resourceLinks?.length && config.caseLinkUrl && (
            <a
              href={config.caseLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold font-plus-jakarta text-white transition hover:brightness-110"
              style={{ background: 'rgba(87,174,165,0.35)', border: '1px solid rgba(87,174,165,0.4)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Case Link
            </a>
          )}
          {!config.resourceLinks?.length && (config.proposalGuidelineUrl ? (
            <a
              href={config.proposalGuidelineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold font-plus-jakarta text-white transition hover:brightness-110"
              style={{ background: 'rgba(87,174,165,0.35)', border: '1px solid rgba(87,174,165,0.4)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Proposal Guideline
            </a>
          ) : (
            <a
              href={guidebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold font-plus-jakarta text-white transition hover:brightness-110"
              style={{ background: 'rgba(87,174,165,0.35)', border: '1px solid rgba(87,174,165,0.4)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Guidebook
            </a>
          ))}
        </div>
      </div>

      <div
        className="mb-5 rounded-[14px] px-5 py-4"
        style={{ background: expired ? 'rgba(248,113,113,0.1)' : 'rgba(87,174,165,0.12)', border: expired ? '1px solid rgba(248,113,113,0.25)' : '1px solid rgba(87,174,165,0.25)' }}
      >
        <p className="mb-2 text-xs font-bold font-plus-jakarta text-white/60 uppercase tracking-wider">Submission Lock</p>
        {expired ? (
          <p className="font-plus-jakarta text-sm font-bold text-red-300">The submission period for {config.label} has ended.</p>
        ) : (
          <p className="break-words font-plus-jakarta text-base font-extrabold text-white sm:text-lg">
            {countdown.days} Days | {countdown.hours} Hours | {countdown.minutes} Minutes | {countdown.seconds} Seconds
          </p>
        )}
        {deadline && (
          <p className="mt-2 font-poppins text-xs text-white/45">
            Deadline: {formatWibDateTime(deadline)}. Upload closes: {formatWibDateTime(closeAt)}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {config.requirements.map((requirement) => {
          const item = items.find(uploadedItem => uploadedItem.requirement_key === requirement.key)
          const messageKey = `submission:${requirement.key}`
          const isUploading = uploadingTask === messageKey
          const msg = uploadMsg[messageKey]
          const updatedAt = item?.updated_at ?? item?.uploaded_at

          return (
            <div
              key={requirement.key}
              className="flex flex-col items-stretch gap-3 rounded-[14px] px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <div className="min-w-0 flex-1">
                <p className="font-plus-jakarta text-sm font-bold text-white leading-snug">{requirement.label}</p>
                <p className="mt-0.5 font-poppins text-xs text-white/40 leading-relaxed">{requirement.description}</p>
                <p className="mt-1 break-words font-poppins text-xs text-white/45">
                  PDF only, max {formatMaxFileSize(requirement.maxBytes)}. Expected filename: {requirement.expectedFileName}
                </p>
                {msg && (
                  <p className={`mt-1 text-xs font-poppins ${msg === 'Uploaded!' || msg.startsWith('Your ') ? 'text-accent-teal' : 'text-red-400'}`}>{msg}</p>
                )}
                {!msg && item && (
                  <p className="mt-1 text-xs font-poppins text-accent-teal/70">
                    Uploaded{updatedAt ? ` at ${formatWibDateTime(updatedAt)}` : ''}
                  </p>
                )}
              </div>
              <div className="w-full shrink-0 sm:w-auto">
                <input
                  type="file"
                  accept={requirement.accept}
                  className="hidden"
                  ref={el => { fileInputRefs.current[messageKey] = el }}
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleSubmissionUpload(requirement.key, file)
                    e.target.value = ''
                  }}
                />
                <button
                  onClick={() => {
                    if (item && !confirm('Are you sure you want to replace your previous submission? This action cannot be undone.')) return
                    fileInputRefs.current[messageKey]?.click()
                  }}
                  disabled={locked || isUploading}
                  className="w-full rounded-full px-4 py-1.5 text-xs font-bold font-plus-jakarta text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  style={{ background: 'rgba(87,174,165,0.5)' }}
                >
                  {isUploading ? 'Uploading...' : item ? 'Re-upload' : 'Upload'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 rounded-[14px] px-5 py-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-plus-jakarta text-lg font-bold text-white">Submit Submission</p>
            <p className="mt-0.5 font-poppins  text-red-500 text-lg font-bold leading-relaxed">
              Submit only after {config.requirements.length === 1 ? 'the file is' : `all ${config.requirements.length} files are`} final. This action locks your submission.
            </p>
          </div>
          <button
            onClick={handleFinalSubmission}
            disabled={!complete || locked}
            className="shrink-0 rounded-full px-5 py-2 text-sm font-bold font-plus-jakarta text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: 'rgba(87,174,165,0.5)' }}
          >
            {submittedAt ? 'Submitted' : 'Submit Submission'}
          </button>
        </div>
        {uploadMsg[`${round}_submit`] && (
          <p className={`mt-2 text-xs font-poppins ${uploadMsg[`${round}_submit`].startsWith('Your ') ? 'text-accent-teal' : 'text-red-400'}`}>
            {uploadMsg[`${round}_submit`]}
          </p>
        )}
      </div>
    </motion.div>
  )
}
