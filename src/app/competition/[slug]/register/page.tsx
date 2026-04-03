'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const SLUG_MAP: Record<string, string> = { bcc: 'BCC', mcc: 'MCC' }

type Member = { nama: string; asal_universitas: string }
type Team = {
  id: string; name: string; competition: string; join_code: string;
  bukti_pembayaran_drive_id: string | null; bukti_follow_drive_id: string | null;
  members: Member[]
}

// Supabase browser client is a singleton — create once at module level
const supabase = createClient()

export default function RegisterPage() {
  const { slug } = useParams<{ slug: string }>()
  const competition = SLUG_MAP[slug]  // may be undefined for unknown slugs

  // All hooks must be declared before any conditional early returns (Rules of Hooks)
  const [loading, setLoading] = useState(true)
  const [team, setTeam] = useState<Team | null>(null)
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')
  const [teamName, setTeamName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'idle' | 'uploading' | 'done' | 'error'>>({})
  const [copied, setCopied] = useState(false)

  const loadTeam = useCallback(async () => {
    if (!competition) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login?toast=auth'; return }

    const res = await fetch(`/api/teams/my?competition=${competition}`)
    if (res.ok) {
      const data = await res.json()
      setTeam(data.team)
    }
    setLoading(false)
  }, [competition])

  // Guard after all hooks — notFound() throws (returns never), narrowing competition to string
  if (!competition) notFound()

  useEffect(() => { loadTeam() }, [loadTeam])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true); setError('')
    const res = await fetch('/api/teams/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: teamName, competition }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSubmitting(false); return }
    await loadTeam()
    setSubmitting(false)
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true); setError('')
    const res = await fetch('/api/teams/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ join_code: joinCode, competition }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSubmitting(false); return }
    await loadTeam()
    setSubmitting(false)
  }

  async function handleUpload(field: string, file: File) {
    setUploadStatus(s => ({ ...s, [field]: 'uploading' }))
    const formData = new FormData()
    formData.append('file', file)
    formData.append('field', field)
    formData.append('competition', competition)

    const res = await fetch('/api/teams/upload', { method: 'POST', body: formData })
    if (res.ok) {
      setUploadStatus(s => ({ ...s, [field]: 'done' }))
      await loadTeam()
    } else {
      const data = await res.json()
      setError(data.error)
      setUploadStatus(s => ({ ...s, [field]: 'error' }))
    }
  }

  function copyCode() {
    if (team) {
      navigator.clipboard.writeText(team.join_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-white">Loading...</div>

  // Team dashboard
  if (team) return (
    <main className="min-h-screen bg-[#00243c] px-4 py-20">
      <div className="mx-auto max-w-lg">
        <div className="mb-2 text-xs font-bold uppercase tracking-widest text-teal-400">{team.competition}</div>
        <h1 className="mb-1 font-plus-jakarta text-3xl font-bold text-white">{team.name}</h1>
        <div className="mb-8 flex items-center gap-2">
          <span className="font-mono text-lg text-teal-300">{team.join_code}</span>
          <button onClick={copyCode} className="rounded px-2 py-0.5 text-xs text-teal-400 hover:bg-teal-500/20">
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Members */}
        <div className="mb-8 rounded-xl border border-teal-700/30 bg-white/5 p-5">
          <h2 className="mb-3 font-semibold text-white">Members ({team.members.length}/3)</h2>
          {team.members.map((m, i) => (
            <div key={i} className="mb-2 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                {i + 1}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{m.nama}</div>
                <div className="text-xs text-teal-300">{m.asal_universitas}</div>
              </div>
            </div>
          ))}
          {team.members.length < 3 && (
            <p className="mt-2 text-xs text-white/40">Share your code <span className="font-mono text-teal-400">{team.join_code}</span> to invite up to {3 - team.members.length} more member(s).</p>
          )}
        </div>

        {/* Uploads */}
        <div className="flex flex-col gap-4">
          {[
            {
              field: 'bukti_pembayaran',
              label: 'Bukti Pembayaran',
              hint: 'Payment proof (image or PDF, max 10MB)',
              accept: 'image/*,application/pdf',
              driveId: team.bukti_pembayaran_drive_id,
            },
            {
              field: 'bukti_follow',
              label: 'Bukti Follow Instagram',
              hint: 'Screenshot of following @sxcgrandsummit (image, max 5MB)',
              accept: 'image/*',
              driveId: team.bukti_follow_drive_id,
            },
          ].map(({ field, label, hint, accept, driveId }) => (
            <div key={field} className="rounded-xl border border-teal-700/30 bg-white/5 p-5">
              <h3 className="mb-1 font-semibold text-white">{label}</h3>
              <p className="mb-3 text-xs text-white/50">{hint}</p>
              {driveId && (
                <a
                  href={`https://drive.google.com/file/d/${driveId}/view`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-3 block text-xs text-teal-400 hover:underline"
                >
                  ✓ Uploaded — View file
                </a>
              )}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept={accept}
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleUpload(field, file)
                  }}
                />
                <span className="inline-block rounded-lg border border-teal-500/40 px-4 py-2 text-sm text-teal-200 hover:bg-teal-500/20">
                  {uploadStatus[field] === 'uploading' ? 'Uploading...' : driveId ? 'Re-upload' : 'Choose File'}
                </span>
              </label>
              {uploadStatus[field] === 'done' && <span className="ml-3 text-xs text-green-400">Uploaded ✓</span>}
              {uploadStatus[field] === 'error' && <span className="ml-3 text-xs text-red-400">Failed — try again</span>}
            </div>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    </main>
  )

  // Create/join team
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#00243c] px-4 py-20">
      <div className="w-full max-w-md">
        <div className="mb-2 text-xs font-bold uppercase tracking-widest text-teal-400">{competition} Registration</div>
        <h1 className="mb-8 font-plus-jakarta text-3xl font-bold text-white">
          {mode === 'create' ? 'Create a Team' : mode === 'join' ? 'Join a Team' : 'Register'}
        </h1>

        {mode === 'choose' && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setMode('create')}
              className="rounded-xl bg-teal-600 py-4 font-semibold text-white transition hover:bg-teal-500"
            >
              Create New Team
            </button>
            <button
              onClick={() => setMode('join')}
              className="rounded-xl border border-teal-500/40 py-4 font-semibold text-teal-200 transition hover:bg-teal-500/20"
            >
              Join Existing Team
            </button>
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <input
              type="text"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="Team name"
              required
              className="rounded-lg border border-teal-700/40 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:border-teal-400 focus:outline-none"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={submitting} className="rounded-xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-500 disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Team'}
            </button>
            <button type="button" onClick={() => { setMode('choose'); setError('') }} className="text-sm text-white/50 hover:text-white">← Back</button>
          </form>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <input
              type="text"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Join code (e.g. GS-AB2X)"
              required
              className="rounded-lg border border-teal-700/40 bg-white/10 px-4 py-3 font-mono text-white placeholder-white/40 focus:border-teal-400 focus:outline-none"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={submitting} className="rounded-xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-500 disabled:opacity-50">
              {submitting ? 'Joining...' : 'Join Team'}
            </button>
            <button type="button" onClick={() => { setMode('choose'); setError('') }} className="text-sm text-white/50 hover:text-white">← Back</button>
          </form>
        )}
      </div>
    </main>
  )
}
