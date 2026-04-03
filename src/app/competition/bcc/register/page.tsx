'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/header'
import Footer from '@/components/footer'
import PageBackground from '@/components/page-background'
import { NAV_ITEMS, ASSETS } from '@/constants'

const supabase = createClient()

const inputClass =
  'w-full rounded-[10px] bg-white/10 px-4 py-2 text-sm font-poppins text-white placeholder-[rgba(184,222,218,0.75)] outline-none transition focus:bg-white/15 focus:ring-1 focus:ring-accent-teal/50'

type Tab = 'create' | 'join'
type DashTab = 'myteam' | 'task'

type Member = { profile_id: string; nama: string; asal_universitas: string }

type MyTeam = {
  id: string
  name: string
  join_code: string
  competition: string
  leader_id: string
  bukti_pembayaran_drive_id: string | null
  bukti_follow_drive_id: string | null
  members: Member[]
}

const BCC_TASKS = [
  { id: 'bukti_pembayaran', label: 'Bukti Pembayaran', accept: '.jpg,.jpeg,.png,.webp,.pdf' },
  { id: 'bukti_follow', label: 'Bukti Follow Instagram', accept: '.jpg,.jpeg,.png,.webp' },
]

export default function BccRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileComplete, setProfileComplete] = useState(false)
  const [tab, setTab] = useState<Tab>('create')
  const [value, setValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [myTeam, setMyTeam] = useState<MyTeam | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>('')

  // Dashboard state
  const [dashTab, setDashTab] = useState<DashTab>('myteam')
  const [teamName, setTeamName] = useState('')
  const [renaming, setRenaming] = useState(false)
  const [copied, setCopied] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [uploadingTask, setUploadingTask] = useState<string | null>(null)
  const [uploadMsg, setUploadMsg] = useState<Record<string, string>>({})
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setCurrentUserId(user.id)

      const [profileRes, teamRes] = await Promise.all([
        fetch('/api/profile/me'),
        fetch('/api/teams/my?competition=BCC'),
      ])

      if (profileRes.ok) {
        const { profile } = await profileRes.json()
        setProfileComplete(profile?.is_complete === true)
      }

      if (teamRes.ok) {
        const data = await teamRes.json()
        if (data.team) {
          setMyTeam(data.team)
          setTeamName(data.team.name)
          setCurrentUserId(data.current_user_id ?? user.id)
        }
      }

      setLoading(false)
    }
    init()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    setSubmitting(true)
    setError('')

    const endpoint = tab === 'create' ? '/api/teams/create' : '/api/teams/join'
    const body = tab === 'create'
      ? { name: value.trim(), competition: 'BCC' }
      : { join_code: value.trim(), competition: 'BCC' }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      return
    }

    setMyTeam(data.team)
    setTeamName(data.team.name)
    setValue('')
  }

  async function handleRename(e: React.FormEvent) {
    e.preventDefault()
    if (!teamName.trim() || teamName.trim() === myTeam?.name) return
    setRenaming(true)
    const res = await fetch('/api/teams/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: teamName.trim(), competition: 'BCC' }),
    })
    setRenaming(false)
    if (res.ok) {
      setMyTeam(t => t ? { ...t, name: teamName.trim() } : t)
    }
  }

  async function handleCopyCode() {
    if (!myTeam) return
    await navigator.clipboard.writeText(myTeam.join_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleLeave() {
    if (!confirm('Are you sure you want to leave this team?')) return
    setLeaving(true)
    const res = await fetch('/api/teams/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ competition: 'BCC' }),
    })
    setLeaving(false)
    if (res.ok) {
      setMyTeam(null)
    } else {
      const d = await res.json()
      alert(d.error)
    }
  }

  async function handleUpload(taskId: string, file: File) {
    setUploadingTask(taskId)
    setUploadMsg(m => ({ ...m, [taskId]: '' }))
    const fd = new FormData()
    fd.append('file', file)
    fd.append('field', taskId)
    fd.append('competition', 'BCC')
    const res = await fetch('/api/teams/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploadingTask(null)
    if (res.ok) {
      setUploadMsg(m => ({ ...m, [taskId]: 'Uploaded!' }))
      // Update drive ID in local state
      const driveField = taskId === 'bukti_pembayaran' ? 'bukti_pembayaran_drive_id' : 'bukti_follow_drive_id'
      setMyTeam(t => t ? { ...t, [driveField]: data.url } : t)
    } else {
      setUploadMsg(m => ({ ...m, [taskId]: data.error ?? 'Upload failed' }))
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(180deg, #011f33 30%, #03263e 62%, #063250 100%)' }}>
        <span className="font-plus-jakarta text-white/60">Loading…</span>
      </div>
    )
  }

  const isLeader = myTeam?.leader_id === currentUserId

  return (
    <div
      className="relative flex min-h-screen w-full flex-col overflow-hidden text-white"
      style={{ background: 'linear-gradient(180deg, #011f33 30%, #03263e 62%, #063250 100%)' }}
    >
      <PageBackground />

      <div className="relative z-10 flex flex-1 flex-col">
        <Header navItems={NAV_ITEMS} assets={{ summitLogo: ASSETS.heroLogo, sxcLogo: ASSETS.sxcLogo }} />

        <main className="flex flex-1 flex-col items-center px-4 pt-12 pb-12 sm:px-6">
          {/* Title image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/regist-profile/registration.png" alt="Registration" className="mb-4 h-16 object-contain md:h-20" draggable={false} />
          <p className="mb-10 font-plus-jakarta text-xl font-bold text-white md:text-2xl">Business Case Competition</p>

          {/* Team dashboard */}
          {myTeam ? (
            <div className="w-full max-w-4xl rounded-[20px] overflow-hidden" style={{ background: 'rgba(6,50,80,0.3)' }}>
              <div className="flex min-h-105">
                {/* Sidebar */}
                <div className="flex w-36 flex-col gap-2 p-4 sm:w-44" style={{ background: 'rgba(0,0,0,0.15)' }}>
                  <button
                    onClick={() => setDashTab('myteam')}
                    className="rounded-[10px] px-3 py-2.5 text-left text-sm font-bold font-plus-jakarta text-white transition"
                    style={dashTab === 'myteam' ? { background: 'rgba(87,174,165,0.5)' } : { background: 'rgba(255,255,255,0.08)' }}
                  >
                    My Team
                  </button>
                  <button
                    onClick={() => setDashTab('task')}
                    className="rounded-[10px] px-3 py-2.5 text-left text-sm font-bold font-plus-jakarta text-white transition"
                    style={dashTab === 'task' ? { background: 'rgba(87,174,165,0.5)' } : { background: 'rgba(255,255,255,0.08)' }}
                  >
                    Task
                  </button>

                  {/* Leave Team */}
                  <div className="mt-auto">
                    <button
                      onClick={handleLeave}
                      disabled={leaving}
                      className="w-full rounded-[10px] px-3 py-2.5 text-left text-xs font-bold font-plus-jakarta text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {leaving ? 'Leaving…' : 'Leave Team'}
                    </button>
                  </div>
                </div>

                {/* Main panel */}
                <div className="flex-1 p-6 sm:p-8">
                  {dashTab === 'myteam' ? (
                    <div>
                      <h2 className="mb-6 font-plus-jakarta text-xl font-bold text-white">My Team</h2>

                      {/* Team Code */}
                      <div className="mb-6">
                        <p className="mb-1.5 text-xs font-bold font-plus-jakarta text-white/60 uppercase tracking-wider">Team Code</p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 rounded-full px-4 py-1.5" style={{ background: 'rgba(87,174,165,0.2)', border: '1px solid rgba(87,174,165,0.35)' }}>
                            <span className="font-poppins text-sm font-bold tracking-widest text-accent-teal">{myTeam.join_code}</span>
                          </div>
                          <button
                            onClick={handleCopyCode}
                            className="rounded-full px-3 py-1.5 text-xs font-bold font-plus-jakarta text-white transition hover:brightness-110"
                            style={{ background: 'rgba(87,174,165,0.3)' }}
                          >
                            {copied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      <div className="mb-6 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />

                      {/* Team Name */}
                      <form onSubmit={handleRename} className="mb-6">
                        <p className="mb-1.5 text-xs font-bold font-plus-jakarta text-white/60 uppercase tracking-wider">Team Name</p>
                        <div className="flex gap-3">
                          <input
                            value={teamName}
                            onChange={e => setTeamName(e.target.value)}
                            disabled={!isLeader}
                            className={inputClass + (!isLeader ? ' cursor-not-allowed opacity-50' : '')}
                            placeholder="Team name"
                          />
                          {isLeader && (
                            <button
                              type="submit"
                              disabled={renaming || teamName.trim() === myTeam.name}
                              className="shrink-0 rounded-full px-5 py-2 text-sm font-bold font-plus-jakarta text-white transition hover:brightness-110 disabled:opacity-40"
                              style={{ background: 'rgba(87,174,165,0.4)' }}
                            >
                              {renaming ? 'Saving…' : 'Save'}
                            </button>
                          )}
                        </div>
                      </form>

                      {/* Members */}
                      <div>
                        <p className="mb-3 text-xs font-bold font-plus-jakarta text-white/60 uppercase tracking-wider">Members</p>
                        <div className="flex flex-col gap-2">
                          {myTeam.members.map((member) => (
                            <div
                              key={member.profile_id}
                              className="flex items-center justify-between rounded-[10px] px-4 py-3"
                              style={{ background: 'rgba(255,255,255,0.05)' }}
                            >
                              <div>
                                <p className="text-sm font-bold font-plus-jakarta text-white">{member.nama}</p>
                                <p className="text-xs font-poppins text-white/50">{member.asal_universitas}</p>
                              </div>
                              {member.profile_id === myTeam.leader_id ? (
                                <span
                                  className="rounded-full px-3 py-1 text-xs font-bold font-plus-jakarta text-white"
                                  style={{ background: 'rgba(87,174,165,0.5)' }}
                                >
                                  Leader
                                </span>
                              ) : isLeader ? (
                                <button
                                  className="rounded-full px-3 py-1 text-xs font-bold font-plus-jakarta text-white transition hover:bg-white/15"
                                  style={{ background: 'rgba(255,255,255,0.1)' }}
                                  onClick={async () => {
                                    const res = await fetch('/api/teams/leader', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ new_leader_id: member.profile_id, competition: 'BCC' }),
                                    })
                                    if (res.ok) {
                                      setMyTeam(t => t ? { ...t, leader_id: member.profile_id } : t)
                                    }
                                  }}
                                >
                                  Set as Leader
                                </button>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="mb-6 font-plus-jakarta text-xl font-bold text-white">Task</h2>
                      <div className="flex flex-col gap-3">
                        {BCC_TASKS.map((task) => {
                          const driveId = task.id === 'bukti_pembayaran'
                            ? myTeam.bukti_pembayaran_drive_id
                            : myTeam.bukti_follow_drive_id
                          const isUploading = uploadingTask === task.id
                          const msg = uploadMsg[task.id]

                          return (
                            <div
                              key={task.id}
                              className="flex items-center justify-between rounded-[14px] px-5 py-4"
                              style={{ background: 'rgba(255,255,255,0.05)' }}
                            >
                              <div>
                                <p className="font-plus-jakarta text-sm font-bold text-white">{task.label}</p>
                                <p className="mt-0.5 font-poppins text-xs text-white/50">
                                  {msg
                                    ? <span className={msg === 'Uploaded!' ? 'text-accent-teal' : 'text-red-400'}>{msg}</span>
                                    : driveId ? 'Uploaded' : 'Not uploaded yet'}
                                </p>
                              </div>
                              <div>
                                <input
                                  type="file"
                                  accept={task.accept}
                                  className="hidden"
                                  ref={el => { fileInputRefs.current[task.id] = el }}
                                  onChange={e => {
                                    const file = e.target.files?.[0]
                                    if (file) handleUpload(task.id, file)
                                    e.target.value = ''
                                  }}
                                />
                                <button
                                  onClick={() => fileInputRefs.current[task.id]?.click()}
                                  disabled={isUploading}
                                  className="rounded-full px-5 py-1.5 text-xs font-bold font-plus-jakarta text-white transition hover:brightness-110 disabled:opacity-50"
                                  style={{ background: 'rgba(87,174,165,0.5)' }}
                                >
                                  {isUploading ? 'Uploading…' : driveId ? 'Re-upload' : 'Upload'}
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-lg">
              {/* Tab card */}
              <div className="rounded-[20px] overflow-hidden" style={{ background: 'rgba(6,50,80,0.3)' }}>
                {/* Tabs */}
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => { setTab('create'); setValue(''); setError('') }}
                    className="flex-1 rounded-tl-[20px] py-3 text-sm font-bold font-plus-jakarta transition"
                    style={tab === 'create'
                      ? { background: 'rgba(87,174,165,0.4)', color: 'white' }
                      : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    Create Team
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTab('join'); setValue(''); setError('') }}
                    className="flex-1 rounded-tr-[20px] py-3 text-sm font-bold font-plus-jakarta transition"
                    style={tab === 'join'
                      ? { background: 'rgba(87,174,165,0.4)', color: 'white' }
                      : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    Join Team
                  </button>
                </div>

                {/* Form body */}
                <form onSubmit={handleSubmit} className="px-8 py-7">
                  <div className="mb-5">
                    <label className="mb-1 block text-xs font-bold font-plus-jakarta text-white">
                      {tab === 'create' ? 'Team Name' : 'Enter Team Code'}
                    </label>
                    <input
                      value={value}
                      onChange={e => setValue(e.target.value)}
                      placeholder={tab === 'create' ? 'Enter Team Name' : 'e.g. GS-AB12'}
                      disabled={!profileComplete}
                      className={inputClass + (!profileComplete ? ' cursor-not-allowed opacity-50' : '')}
                    />
                  </div>

                  {error && <p className="mb-4 text-xs text-red-400">{error}</p>}

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={submitting || !profileComplete}
                      className="rounded-full px-10 py-2 text-sm font-bold font-plus-jakarta text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ background: 'rgba(87,174,165,0.4)' }}
                    >
                      {submitting ? 'Processing…' : tab === 'create' ? 'Create' : 'Join'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Profile incomplete warning */}
              {!profileComplete && (
                <div className="mt-5 flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-accent-teal">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="font-plus-jakarta text-sm font-bold text-white">
                    Please{' '}
                    <a href="/profile" className="text-accent-teal underline hover:brightness-125">complete your profile</a>
                    {' '}to proceed with registration!
                  </p>
                </div>
              )}
            </div>
          )}
        </main>

        <Footer navItems={NAV_ITEMS} assets={{ summitLogo: ASSETS.heroLogo, sxcLogo: ASSETS.sxcLogo, instagram: ASSETS.instagram }} />
      </div>
    </div>
  )
}
