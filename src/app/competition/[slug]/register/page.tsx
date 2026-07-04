'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { notFound, useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Footer from '@/components/footer'
import Header from '@/components/header'
import PageBackground from '@/components/page-background'
import { ASSETS, NAV_ITEMS } from '@/constants'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah, getMccRegistrationFee } from '@/lib/referral-codes'
import { canAccessMccPitchDeckSubmission } from '@/lib/submissions'
import SubmissionRound from '../../bcc/register/submission-round'

const SLUG_MAP: Record<string, 'MCC'> = { mcc: 'MCC' }
const MCC_MIN_MEMBERS = 2
const MCC_MEMBER_LIMIT = 3

const REGISTER_REQUIREMENTS: Record<RegisterTab, { title: string; body: string }> = {
  create: {
    title: 'Team Creation Requirement',
    body: 'Create a team only if you are the team leader. MCC teams must contain 2-3 active undergraduate students, including the leader. After the team is created, share the team code with your teammates.',
  },
  join: {
    title: 'Join Team Requirement',
    body: 'Join only if you are an active undergraduate student and already received a valid MCC team code from your team leader. A team can contain 2-3 members, including the leader.',
  },
}

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: EASE, delay },
})

const inputClass =
  'w-full rounded-[10px] bg-white/10 px-4 py-2 text-sm font-poppins text-white placeholder-[rgba(184,222,218,0.75)] outline-none transition focus:bg-white/15 focus:ring-1 focus:ring-accent-teal/50'

type RegisterTab = 'create' | 'join'
type DashTab = 'myteam' | 'task' | 'pitchdeck'

type Member = {
  profile_id: string
  nama: string | null
  asal_universitas: string | null
}

type SubmissionRequirement = {
  key: string
  label: string
  description: string
  expectedFileName: string
  accept: string
  maxBytes: number
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

type SubmissionRoundState = {
  config: {
    label: string
    deadline: string
    guidebookUrl: string
    caseLinkUrl?: string
    proposalGuidelineUrl?: string
    resourceLinks?: Array<{ label: string; url: string }>
    requirements: SubmissionRequirement[]
    closeAt: string
  }
  items: SubmissionItem[]
  submitted_at: string | null
  deadline: string
  close_at: string
}

type MyTeam = {
  id: string
  name: string
  competition: string
  join_code: string
  leader_id: string
  source_of_information: string | null
  registration_fee: number | null
  bukti_pembayaran_drive_id: string | null
  bukti_follow_drive_id: string | null
  task_ktm_drive_id: string | null
  task_cv_drive_id: string | null
  task_repost_drive_id: string | null
  task_broadcast_drive_id: string | null
  task_twibbon_drive_id: string | null
  task_follow_ig_drive_id: string | null
  task_follow_li_drive_id: string | null
  submissions: { preliminary?: SubmissionRoundState } | null
  members: Member[]
}

const MCC_TASKS = [
  {
    id: 'source_of_information',
    label: 'Source of Information',
    desc: 'How did you hear about MCC Grand Summit? (optional)',
    accept: null as string | null,
    driveKey: 'source_of_information' as const,
  },
  {
    id: 'task_ktm',
    label: 'i. Student ID Card (KTM) / Active Undergraduate Proof',
    desc: 'Compile into one (1) PDF file containing each participant\'s Student ID Card (KTM) or proof of active undergraduate student status. (max 5MB)',
    accept: '.pdf',
    driveKey: 'task_ktm_drive_id' as const,
  },
  {
    id: 'task_cv',
    label: 'ii. Curriculum Vitae (CV)',
    desc: 'Compile into one (1) PDF file containing each participant\'s CV. (max 5MB)',
    accept: '.pdf',
    driveKey: 'task_cv_drive_id' as const,
  },
  {
    id: 'task_repost',
    label: 'iii. Repost Official Poster via Instagram Story',
    desc: 'Compile into one (1) PDF file containing proof that all participants have reposted the official poster. (max 5MB)',
    accept: '.pdf',
    driveKey: 'task_repost_drive_id' as const,
  },
  {
    id: 'task_broadcast',
    label: 'iv. Share Poster & Broadcast to minimum 5 Group Chats',
    desc: 'Compile into one (1) PDF file containing proof that all participants have shared the poster and broadcast to the required number of group chats. (max 5MB)',
    accept: '.pdf',
    driveKey: 'task_broadcast_drive_id' as const,
  },
  {
    id: 'task_twibbon',
    label: 'v. Upload Twibbon, Tag 3 Friends & @sxcgrandsummit',
    desc: 'Compile into one (1) PDF file containing proof that all participants have uploaded the twibbon and followed the tagging requirements. (max 5MB)',
    accept: '.pdf',
    driveKey: 'task_twibbon_drive_id' as const,
  },
  {
    id: 'task_follow_ig',
    label: 'vi. Follow Instagram @studentsxceosbdg & @sxcgrandsummit',
    desc: 'Compile into one (1) PDF file containing proof that all participants have followed both official Instagram accounts. (max 5MB)',
    accept: '.pdf',
    driveKey: 'task_follow_ig_drive_id' as const,
  },
  {
    id: 'task_follow_li',
    label: 'vii. Follow LinkedIn StudentsxCEOs Grand Summit',
    desc: 'Compile into one (1) PDF file containing proof that all participants have followed the official LinkedIn account. (max 5MB)',
    accept: '.pdf',
    driveKey: 'task_follow_li_drive_id' as const,
  },
] as const

const supabase = createClient()

export default function RegisterPage() {
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()
  const competition = SLUG_MAP[slug]

  const [loading, setLoading] = useState(true)
  const [profileComplete, setProfileComplete] = useState(false)
  const [tab, setTab] = useState<RegisterTab>('create')
  const [value, setValue] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [myTeam, setMyTeam] = useState<MyTeam | null>(null)
  const [currentUserId, setCurrentUserId] = useState('')

  const [dashTab, setDashTab] = useState<DashTab>('myteam')
  const [teamName, setTeamName] = useState('')
  const [sourceInfoValue, setSourceInfoValue] = useState('')
  const [sourceInfoSaving, setSourceInfoSaving] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [copied, setCopied] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [uploadingTask, setUploadingTask] = useState<string | null>(null)
  const [uploadMsg, setUploadMsg] = useState<Record<string, string>>({})
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  if (!competition) notFound()

  const registrationFee = myTeam?.registration_fee ?? getMccRegistrationFee()
  const formattedRegistrationFee = formatRupiah(registrationFee)
  const isLeader = myTeam?.leader_id === currentUserId
  const guidebookUrl = process.env.NEXT_PUBLIC_MCC_GUIDEBOOK_URL ?? process.env.NEXT_PUBLIC_GUIDEBOOK_MCC_URL ?? 'https://bit.ly/GuidebookMCCGS15'
  const completedTaskCount = myTeam
    ? MCC_TASKS.filter(task => task.id !== 'source_of_information').filter(task => Boolean(myTeam[task.driveKey])).length
    : 0
  const taskRequiredCount = MCC_TASKS.filter(task => task.id !== 'source_of_information').length
  const hasValidMemberCount = Boolean(myTeam && myTeam.members.length >= MCC_MIN_MEMBERS && myTeam.members.length <= MCC_MEMBER_LIMIT)
  const taskComplete = hasValidMemberCount && Boolean(myTeam?.bukti_pembayaran_drive_id) && completedTaskCount === taskRequiredCount
  const canAccessPitchDeck = Boolean(myTeam && canAccessMccPitchDeckSubmission(myTeam))
  const registerRequirement = REGISTER_REQUIREMENTS[tab]

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?toast=auth')
        return
      }

      setCurrentUserId(user.id)

      const [profileRes, teamRes] = await Promise.all([
        fetch('/api/profile/me'),
        fetch('/api/teams/my?competition=MCC'),
      ])

      if (profileRes.ok) {
        const { profile: loadedProfile } = await profileRes.json()
        setProfileComplete(loadedProfile?.is_complete === true)
      }

      if (teamRes.ok) {
        const data = await teamRes.json()
        if (data.team) {
          setMyTeam({ members: [], ...data.team })
          setTeamName(data.team.name)
          setSourceInfoValue(data.team.source_of_information ?? '')
          setCurrentUserId(data.current_user_id ?? user.id)
        }
      }

      setLoading(false)
    }

    void init()
  }, [router])

  async function refreshTeam() {
    const teamRes = await fetch('/api/teams/my?competition=MCC')
    if (!teamRes.ok) return

    const teamData = await teamRes.json()
    if (teamData.team) {
      setMyTeam(teamData.team)
      setTeamName(teamData.team.name)
      setSourceInfoValue(teamData.team.source_of_information ?? '')
      setCurrentUserId(teamData.current_user_id ?? currentUserId)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const endpoint = tab === 'join' ? '/api/teams/join' : '/api/teams/create'
    const body = tab === 'join'
      ? { join_code: joinCode.trim(), competition: 'MCC' }
      : {
        name: value.trim(),
        competition: 'MCC',
        registration_type: 'team',
      }

    if (tab === 'join' && !joinCode.trim()) {
      setSubmitting(false)
      return
    }

    if (tab === 'create' && !value.trim()) {
      setSubmitting(false)
      return
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) {
      if (data.error?.toLowerCase().includes('already in a team')) {
        await refreshTeam()
        return
      }

      setError(data.error ?? 'Something went wrong')
      return
    }

    await refreshTeam()
    setValue('')
    setJoinCode('')
  }

  async function handleRename(e: React.FormEvent) {
    e.preventDefault()
    if (!teamName.trim() || teamName.trim() === myTeam?.name) return

    setRenaming(true)
    const res = await fetch('/api/teams/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: teamName.trim(), competition: 'MCC' }),
    })
    setRenaming(false)

    if (res.ok) {
      setMyTeam(team => team ? { ...team, name: teamName.trim() } : team)
    }
  }

  async function handleCopyCode() {
    if (!myTeam) return
    await navigator.clipboard.writeText(myTeam.join_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleLeave() {
    if (!confirm('Are you sure you want to leave this MCC registration?')) return

    setLeaving(true)
    const res = await fetch('/api/teams/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ competition: 'MCC' }),
    })
    setLeaving(false)

    if (res.ok) {
      setMyTeam(null)
      setDashTab('myteam')
    } else {
      const data = await res.json()
      alert(data.error)
    }
  }

  async function handleSetLeader(profileId: string) {
    const res = await fetch('/api/teams/leader', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_leader_id: profileId, competition: 'MCC' }),
    })

    if (res.ok) {
      setMyTeam(team => team ? { ...team, leader_id: profileId } : team)
    }
  }

  async function handleUpload(taskId: string, file: File) {
    setUploadingTask(taskId)
    setUploadMsg(message => ({ ...message, [taskId]: '' }))

    const fd = new FormData()
    fd.append('file', file)
    fd.append('field', taskId)
    fd.append('competition', 'MCC')

    const res = await fetch('/api/teams/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploadingTask(null)

    if (res.ok) {
      setUploadMsg(message => ({ ...message, [taskId]: 'Uploaded!' }))

      if (taskId === 'bukti_pembayaran') {
        setMyTeam(team => team ? { ...team, bukti_pembayaran_drive_id: data.driveFileId } : team)
        return
      }

      const task = MCC_TASKS.find(item => item.id === taskId)
      if (task && task.id !== 'source_of_information') {
        setMyTeam(team => team ? { ...team, [task.driveKey]: data.driveFileId } : team)
      }
    } else {
      setUploadMsg(message => ({ ...message, [taskId]: data.error ?? 'Upload failed' }))
    }
  }

  async function handleSaveSource() {
    if (!myTeam) return

    setSourceInfoSaving(true)
    const res = await fetch('/api/teams/source', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_of_information: sourceInfoValue, competition: 'MCC' }),
    })
    setSourceInfoSaving(false)

    if (res.ok) {
      setMyTeam(team => team ? { ...team, source_of_information: sourceInfoValue.trim() || null } : team)
      setUploadMsg(message => ({ ...message, source_of_information: 'Saved!' }))
    } else {
      const data = await res.json()
      setUploadMsg(message => ({ ...message, source_of_information: data.error ?? 'Failed to save' }))
    }
  }

  function handleFinalSubmit() {
    if (!taskComplete) return
    window.alert('Your registration has been submitted. The committee will verify your registration shortly. Please check your email regularly for the confirmation message.')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(180deg, #011f33 30%, #03263e 62%, #063250 100%)' }}>
        <span className="font-plus-jakarta text-white/60">Loading...</span>
      </div>
    )
  }

  return (
    <div
      className="relative flex min-h-screen w-full flex-col overflow-hidden text-white"
      style={{ background: 'linear-gradient(180deg, #011f33 30%, #03263e 62%, #063250 100%)' }}
    >
      <PageBackground />

      <div className="relative z-10 flex flex-1 flex-col">
        <Header navItems={NAV_ITEMS} assets={{ summitLogo: ASSETS.heroLogo, sxcLogo: ASSETS.sxcLogo }} />

        <main className="flex flex-1 flex-col items-center px-4 pb-12 pt-12 sm:px-6">
          <motion.img
            {...fadeUp(0)}
            src="/mcc-regist-team.png"
            alt="MCC Registration"
            className="mb-8 h-auto w-full max-w-[560px] object-contain md:max-w-[760px]"
            draggable={false}
          />

          {myTeam ? (
            <motion.div {...fadeUp(0.2)} className="w-full max-w-4xl overflow-hidden rounded-[20px]" style={{ background: 'rgba(6,50,80,0.3)' }}>
              <div className="flex min-h-105 flex-col md:flex-row">
                <div className="flex w-full flex-row gap-2 overflow-x-auto p-3 md:w-44 md:flex-col md:p-4" style={{ background: 'rgba(0,0,0,0.15)' }}>
                  <button
                    onClick={() => setDashTab('myteam')}
                    className="shrink-0 rounded-[10px] px-3 py-2.5 text-left font-plus-jakarta text-sm font-bold text-white transition md:shrink"
                    style={dashTab === 'myteam' ? { background: 'rgba(87,174,165,0.5)' } : { background: 'rgba(255,255,255,0.08)' }}
                  >
                    My Team
                  </button>
                  <button
                    onClick={() => setDashTab('task')}
                    className="shrink-0 rounded-[10px] px-3 py-2.5 text-left font-plus-jakarta text-sm font-bold text-white transition md:shrink"
                    style={dashTab === 'task' ? { background: 'rgba(87,174,165,0.5)' } : { background: 'rgba(255,255,255,0.08)' }}
                  >
                    Task
                  </button>
                  {canAccessPitchDeck && (
                    <button
                      onClick={() => setDashTab('pitchdeck')}
                      className="shrink-0 rounded-[10px] px-3 py-2.5 text-left font-plus-jakarta text-sm font-bold text-white transition md:shrink"
                      style={dashTab === 'pitchdeck' ? { background: 'rgba(87,174,165,0.5)' } : { background: 'rgba(255,255,255,0.08)' }}
                    >
                      Pitch Deck
                    </button>
                  )}

                  <div className="ml-auto shrink-0 md:mt-auto md:ml-0 md:shrink">
                    <button
                      onClick={handleLeave}
                      disabled={leaving}
                      className="w-full rounded-[10px] px-3 py-2.5 text-left font-plus-jakarta text-xs font-bold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {leaving ? 'Leaving...' : 'Leave Team'}
                    </button>
                  </div>
                </div>

                <div className="min-w-0 flex-1 p-4 sm:p-6 md:p-8">
                  <AnimatePresence mode="wait">
                    {dashTab === 'myteam' ? (
                      <motion.div
                        key="myteam"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      >
                        <h2 className="mb-6 font-plus-jakarta text-xl font-bold text-white">My Team</h2>

                        <div className="mb-6">
                          <p className="mb-1.5 font-plus-jakarta text-xs font-bold uppercase tracking-wider text-white/60">Team Code</p>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 rounded-full px-4 py-1.5" style={{ background: 'rgba(87,174,165,0.2)', border: '1px solid rgba(87,174,165,0.35)' }}>
                              <span className="font-poppins text-sm font-bold tracking-widest text-accent-teal">{myTeam.join_code}</span>
                            </div>
                            <button
                              onClick={handleCopyCode}
                              className="rounded-full px-3 py-1.5 font-plus-jakarta text-xs font-bold text-white transition hover:brightness-110"
                              style={{ background: 'rgba(87,174,165,0.3)' }}
                            >
                              {copied ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        </div>

                        <div className="mb-6 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />

                        <div className="mb-6">
                          <p className="mb-1.5 font-plus-jakarta text-xs font-bold uppercase tracking-wider text-white/60">Registration Fee</p>
                          <span className="font-plus-jakarta text-lg font-bold text-white">{formattedRegistrationFee}</span>
                        </div>

                        <form onSubmit={handleRename} className="mb-6">
                          <p className="mb-1.5 font-plus-jakarta text-xs font-bold uppercase tracking-wider text-white/60">Team Name</p>
                          <div className="flex gap-3">
                            <input
                              value={teamName}
                              onChange={event => setTeamName(event.target.value)}
                              disabled={!isLeader}
                              className={inputClass + (!isLeader ? ' cursor-not-allowed opacity-50' : '')}
                              placeholder="Team name"
                            />
                            {isLeader && (
                              <button
                                type="submit"
                                disabled={renaming || teamName.trim() === myTeam.name}
                                className="shrink-0 rounded-full px-5 py-2 font-plus-jakarta text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-40"
                                style={{ background: 'rgba(87,174,165,0.4)' }}
                              >
                                {renaming ? 'Saving...' : 'Save'}
                              </button>
                            )}
                          </div>
                        </form>

                        <div className="mb-6 rounded-[10px] px-4 py-3" style={{ background: 'rgba(87,174,165,0.12)', border: '1px solid rgba(87,174,165,0.28)' }}>
                          <p className="font-plus-jakarta text-sm font-bold text-white">Undergraduate Students Only</p>
                          <p className="mt-1 font-poppins text-xs leading-relaxed text-white/55">
                            MCC registration is only open for teams of 2-3 active undergraduate students. Upload KTM or active student proof in the Task tab.
                          </p>
                        </div>

                        <div>
                          <p className="mb-3 font-plus-jakarta text-xs font-bold uppercase tracking-wider text-white/60">
                            Members ({myTeam.members.length}/{MCC_MEMBER_LIMIT})
                          </p>

                          <div className="flex flex-col gap-2">
                            {myTeam.members.map(member => (
                              <div
                                key={member.profile_id}
                                className="flex items-center justify-between rounded-[10px] px-4 py-3"
                                style={{ background: 'rgba(255,255,255,0.05)' }}
                              >
                                <div>
                                  <p className="font-plus-jakarta text-sm font-bold text-white">{member.nama}</p>
                                  <p className="font-poppins text-xs text-white/50">{member.asal_universitas}</p>
                                </div>
                                {member.profile_id === myTeam.leader_id ? (
                                  <span
                                    className="rounded-full px-3 py-1 font-plus-jakarta text-xs font-bold text-white"
                                    style={{ background: 'rgba(87,174,165,0.5)' }}
                                  >
                                    Leader
                                  </span>
                                ) : isLeader ? (
                                  <button
                                    className="rounded-full px-3 py-1 font-plus-jakarta text-xs font-bold text-white transition hover:bg-white/15"
                                    style={{ background: 'rgba(255,255,255,0.1)' }}
                                    onClick={() => handleSetLeader(member.profile_id)}
                                  >
                                    Set as Leader
                                  </button>
                                ) : null}
                              </div>
                            ))}
                          </div>

                          {myTeam.members.length < MCC_MIN_MEMBERS && (
                            <div className="mt-3 rounded-[10px] px-4 py-3" style={{ background: 'rgba(255,190,120,0.1)', border: '1px solid rgba(255,190,120,0.22)' }}>
                              <p className="font-plus-jakarta text-xs font-bold text-[#ffd19a]">Minimum team size not met</p>
                              <p className="mt-1 font-poppins text-xs leading-relaxed text-white/50">
                                MCC teams need at least {MCC_MIN_MEMBERS} members before registration can be submitted.
                              </p>
                            </div>
                          )}

                          {myTeam.members.length < MCC_MEMBER_LIMIT && (
                            <p className="mt-3 font-poppins text-xs text-white/45">
                              Share your team code with your teammates. MCC teams can contain 2-3 participants, including the leader.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ) : dashTab === 'task' ? (
                      <motion.div
                        key="task"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      >
                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <h2 className="font-plus-jakarta text-xl font-bold text-white">Task</h2>
                          {guidebookUrl && (
                            <a
                              href={guidebookUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-1.5 font-plus-jakarta text-xs font-bold text-white transition hover:brightness-110"
                              style={{ background: 'rgba(87,174,165,0.35)', border: '1px solid rgba(87,174,165,0.4)' }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                              Guidebook
                            </a>
                          )}
                        </div>

                        <div className="flex flex-col gap-3">
                          {MCC_TASKS.map(task => {
                            const driveId = myTeam[task.driveKey]
                            const isUploading = uploadingTask === task.id
                            const msg = uploadMsg[task.id]
                            const isSourceInfo = task.id === 'source_of_information'

                            return (
                              <div
                                key={task.id}
                                className="flex flex-col items-stretch gap-3 rounded-[14px] px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
                                style={{ background: 'rgba(255,255,255,0.05)' }}
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="font-plus-jakarta text-sm font-bold leading-snug text-white">{task.label}</p>
                                  <p className="mt-0.5 font-poppins text-xs leading-relaxed text-white/40">{task.desc}</p>
                                  {msg && (
                                    <p className={`mt-1 font-poppins text-xs ${msg === 'Uploaded!' || msg === 'Saved!' ? 'text-accent-teal' : 'text-red-400'}`}>{msg}</p>
                                  )}
                                  {!msg && driveId && !isSourceInfo && (
                                    <p className="mt-1 font-poppins text-xs text-accent-teal/70">Already uploaded</p>
                                  )}
                                  {!msg && driveId && isSourceInfo && (
                                    <p className="mt-1 font-poppins text-xs text-accent-teal/70">Saved</p>
                                  )}
                                </div>
                                <div className="w-full shrink-0 sm:w-auto">
                                  {isSourceInfo ? (
                                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                                      <input
                                        type="text"
                                        value={sourceInfoValue}
                                        onChange={event => setSourceInfoValue(event.target.value)}
                                        placeholder="e.g. Instagram, Friend..."
                                        className="w-full rounded-full bg-white/10 px-3 py-1.5 text-xs text-white outline-none placeholder-white/40 focus:bg-white/15 sm:w-40"
                                      />
                                      <button
                                        onClick={handleSaveSource}
                                        disabled={sourceInfoSaving}
                                        className="rounded-full px-4 py-1.5 font-plus-jakarta text-xs font-bold text-white transition hover:brightness-110 disabled:opacity-50"
                                        style={{ background: 'rgba(87,174,165,0.5)' }}
                                      >
                                        {sourceInfoSaving ? 'Saving...' : 'Save'}
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <input
                                        type="file"
                                        accept={task.accept ?? ''}
                                        className="hidden"
                                        ref={element => { fileInputRefs.current[task.id] = element }}
                                        onChange={event => {
                                          const file = event.target.files?.[0]
                                          if (file) handleUpload(task.id, file)
                                          event.target.value = ''
                                        }}
                                      />
                                      <button
                                        onClick={() => fileInputRefs.current[task.id]?.click()}
                                        disabled={isUploading}
                                        className="w-full rounded-full px-4 py-1.5 font-plus-jakarta text-xs font-bold text-white transition hover:brightness-110 disabled:opacity-50 sm:w-auto"
                                        style={{ background: 'rgba(87,174,165,0.5)' }}
                                      >
                                        {isUploading ? 'Uploading...' : driveId ? 'Re-upload' : 'Upload'}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )
                          })}

                          <div
                            className="flex flex-col items-stretch gap-3 rounded-[14px] px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
                            style={{ background: 'rgba(255,255,255,0.05)' }}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-plus-jakarta text-sm font-bold leading-snug text-white">Proof of Payment</p>
                              <p className="mt-1 font-plus-jakarta text-sm font-bold text-accent-teal">{formattedRegistrationFee}</p>
                              <p className="mt-0.5 font-poppins text-xs leading-relaxed text-white/40">
                                Complete the payment by transferring the registration fee to the designated bank account, as stated in the guidebook. Upload the proof of payment below. (Max 5 MB)
                              </p>
                              {uploadMsg.bukti_pembayaran && (
                                <p className={`mt-1 font-poppins text-xs ${uploadMsg.bukti_pembayaran === 'Uploaded!' ? 'text-accent-teal' : 'text-red-400'}`}>
                                  {uploadMsg.bukti_pembayaran}
                                </p>
                              )}
                              {!uploadMsg.bukti_pembayaran && myTeam.bukti_pembayaran_drive_id && (
                                <p className="mt-1 font-poppins text-xs text-accent-teal/70">Already uploaded</p>
                              )}
                            </div>
                            <div className="w-full shrink-0 sm:w-auto">
                              <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp,.pdf"
                                className="hidden"
                                ref={element => { fileInputRefs.current.bukti_pembayaran = element }}
                                onChange={event => {
                                  const file = event.target.files?.[0]
                                  if (file) handleUpload('bukti_pembayaran', file)
                                  event.target.value = ''
                                }}
                              />
                              <button
                                onClick={() => fileInputRefs.current.bukti_pembayaran?.click()}
                                disabled={uploadingTask === 'bukti_pembayaran'}
                                className="w-full rounded-full px-4 py-1.5 font-plus-jakarta text-xs font-bold text-white transition hover:brightness-110 disabled:opacity-50 sm:w-auto"
                                style={{ background: 'rgba(87,174,165,0.5)' }}
                              >
                                {uploadingTask === 'bukti_pembayaran' ? 'Uploading...' : myTeam.bukti_pembayaran_drive_id ? 'Re-upload' : 'Upload'}
                              </button>
                            </div>
                          </div>

                          <div className="rounded-[14px] px-5 py-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-plus-jakarta text-sm font-bold text-white">Submit Registration</p>
                                <p className="mt-0.5 font-poppins text-xs leading-relaxed text-white/40">
                                  Submit after your team has 2-3 members and all MCC requirements and payment proof are uploaded. The committee will verify your registration shortly.
                                </p>
                              </div>
                              <button
                                onClick={handleFinalSubmit}
                                disabled={!taskComplete}
                                className="shrink-0 rounded-full px-5 py-2 font-plus-jakarta text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                style={{ background: 'rgba(87,174,165,0.5)' }}
                              >
                                Submit Registration
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <SubmissionRound competition="MCC" round="preliminary" team={myTeam} onTeamUpdate={setMyTeam} />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div {...fadeUp(0.2)} className="w-full max-w-lg">
              <div className="overflow-hidden rounded-[20px]" style={{ background: 'rgba(6,50,80,0.3)' }}>
                <div className="grid grid-cols-2">
                  {([
                    ['create', 'Create Team'],
                    ['join', 'Join Team'],
                  ] as const).map(([nextTab, label], index) => (
                    <button
                      key={nextTab}
                      type="button"
                      onClick={() => { setTab(nextTab); setValue(''); setJoinCode(''); setError('') }}
                      className={[
                        'py-3 font-plus-jakarta text-xs font-bold transition sm:text-sm',
                        index === 0 ? 'rounded-tl-[20px]' : '',
                        index === 1 ? 'rounded-tr-[20px]' : '',
                      ].join(' ')}
                      style={tab === nextTab
                        ? { background: 'rgba(87,174,165,0.4)', color: 'white' }
                        : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-7">
                  <div className="mb-5">
                    <label className="mb-1 block font-plus-jakarta text-xs font-bold text-white">
                      {tab === 'create' ? 'Team Name' : 'Enter Team Code'}
                    </label>
                    <input
                      value={tab === 'join' ? joinCode : value}
                      onChange={event => tab === 'join' ? setJoinCode(event.target.value.toUpperCase()) : setValue(event.target.value)}
                      placeholder={tab === 'create' ? 'Enter Team Name' : 'e.g. GS-AB12'}
                      disabled={!profileComplete}
                      className={inputClass + (!profileComplete ? ' cursor-not-allowed opacity-50' : '')}
                    />
                  </div>

                  <div className="mb-5 rounded-[10px] px-4 py-3" style={{ background: 'rgba(87,174,165,0.1)', border: '1px solid rgba(87,174,165,0.22)' }}>
                    <p className="font-plus-jakarta text-xs font-bold uppercase tracking-wider text-white/60">{registerRequirement.title}</p>
                    <p className="mt-1 font-poppins text-xs leading-relaxed text-white/55">
                      {registerRequirement.body}
                    </p>
                    <p className="mt-2 font-poppins text-xs text-white/50">Current fee: <span className="font-bold text-white">{formatRupiah(getMccRegistrationFee())}</span></p>
                  </div>

                  {error && <p className="mb-4 text-xs text-red-400">{error}</p>}

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={submitting || !profileComplete}
                      className="rounded-full px-10 py-2 font-plus-jakarta text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ background: 'rgba(87,174,165,0.4)' }}
                    >
                      {submitting ? 'Processing...' : tab === 'create' ? 'Create' : 'Join'}
                    </button>
                  </div>
                </form>
              </div>

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
            </motion.div>
          )}
        </main>

        <Footer navItems={NAV_ITEMS} assets={{ summitLogo: ASSETS.heroLogo, sxcLogo: ASSETS.sxcLogo, instagram: ASSETS.instagram }} />
      </div>
    </div>
  )
}
