'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { shouldShowTeamInAdminRegistry } from '@/lib/admin-team-filters'

type Stats = { bccTeams: number; mccTeams: number; totalMembers: number }
type RegistrationState = { bcc: boolean; mcc: boolean }
type AdminTeamStats = {
  totalTeams: number
  paidTeams: number
  unpaidTeams: number
  completeTeams: number
  collectedAmount: number
  bccCollectedAmount: number
  mccCollectedAmount: number
}

type TeamMember = {
  profile_id: string
  is_leader: boolean
  nama: string
  nim: string
  asal_universitas: string
  major_program: string
  instagram_username: string
  line_id: string
  wa_no: string
  email: string
}

type TaskStatus = {
  key: string
  label: string
  complete: boolean
}

type SubmissionFileStatus = TaskStatus & {
  url: string | null
  updated_at: string | null
}

type AdminTeam = {
  id: string
  name: string
  competition: 'BCC' | 'MCC'
  join_code: string
  referral_code: string | null
  registration_fee: number | null
  source_of_information: string | null
  created_at: string
  paid: boolean
  complete: boolean
  completedTaskCount: number
  requiredTaskCount: number
  is_semifinalist: boolean
  preliminarySubmitted: boolean
  preliminarySubmittedAt: string | null
  preliminaryLate: boolean
  preliminaryCompletedCount: number
  preliminaryRequiredCount: number
  semifinalSubmitted: boolean
  semifinalSubmittedAt: string | null
  semifinalLate: boolean
  semifinalCompletedCount: number
  semifinalRequiredCount: number
  members: TeamMember[]
  taskStatuses: TaskStatus[]
  preliminaryStatuses: SubmissionFileStatus[]
  semifinalStatuses: SubmissionFileStatus[]
}

type CompetitionFilter = 'ALL' | 'BCC' | 'MCC'
type StatusFilter =
  | 'ALL'
  | 'PAID'
  | 'UNPAID'
  | 'COMPLETE'
  | 'INCOMPLETE'
  | 'PRELIM_SUBMITTED'
  | 'PRELIM_NOT_SUBMITTED'
  | 'PRELIM_LATE'
  | 'PRELIM_READY'
  | 'MCC_PRELIM_SUBMITTED'
  | 'MCC_PRELIM_NOT_SUBMITTED'
  | 'MCC_PRELIM_LATE'
  | 'MCC_PRELIM_READY'
  | 'SEMIFINAL_SUBMITTED'
  | 'SEMIFINAL_NOT_SUBMITTED'
  | 'SEMIFINAL_LATE'
  | 'SEMIFINAL_READY'

type Tone = 'default' | 'teal' | 'green' | 'yellow' | 'red'

type MetricCard = {
  label: string
  value: string | number
  detail: string
  tone: Tone
}

type RoundSummary = {
  label: 'Prelim' | 'Semi'
  required: boolean
  submitted: boolean
  late: boolean
  completedCount: number
  requiredCount: number
  submittedAt: string | null
  statuses: SubmissionFileStatus[]
}

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: 'easeOut' as const },
}

const panelTone: Record<Tone, string> = {
  default: 'border-cyan-200/15 bg-[#09324f]',
  teal: 'border-cyan-200/35 bg-[#075a69]',
  green: 'border-emerald-200/35 bg-[#10624f]',
  yellow: 'border-amber-200/40 bg-[#735019]',
  red: 'border-rose-200/40 bg-[#742944]',
}

const pillTone = {
  green: 'border-emerald-200/45 bg-emerald-300/18 text-emerald-50',
  red: 'border-rose-200/45 bg-rose-300/18 text-rose-50',
  yellow: 'border-amber-100/50 bg-amber-300/20 text-amber-50',
  teal: 'border-cyan-100/45 bg-cyan-300/18 text-cyan-50',
}

function formatFee(value: number | null) {
  return value ? currency.format(value) : '-'
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString('id-ID') : '-'
}

function percent(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0
}

function pillClass(tone: keyof typeof pillTone) {
  return `inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-bold ${pillTone[tone]}`
}

function Panel({
  children,
  className = '',
  tone = 'default',
}: {
  children: React.ReactNode
  className?: string
  tone?: Tone
}) {
  return <div className={`rounded-xl border ${panelTone[tone]} ${className}`}>{children}</div>
}

function ProgressBar({
  value,
  tone = 'teal',
}: {
  value: number
  tone?: 'teal' | 'green' | 'yellow' | 'red'
}) {
  const map = {
    teal: 'bg-cyan-200',
    green: 'bg-emerald-200',
    yellow: 'bg-amber-200',
    red: 'bg-rose-200',
  }
  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/12" aria-hidden="true">
      <div
        className={`h-full rounded-full ${map[tone]}`}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  )
}

function MetricTile({ metric }: { metric: MetricCard }) {
  return (
    <Panel tone={metric.tone} className="p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-white/70">{metric.label}</p>
        <span className="mt-1 h-2 w-2 rounded-full bg-cyan-200/90" />
      </div>
      <p className="mt-3 font-plus-jakarta text-3xl font-bold tracking-tight text-white">{metric.value}</p>
      <p className="mt-1 text-sm text-white/65">{metric.detail}</p>
    </Panel>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-white/45">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-white/80">{value || '-'}</p>
    </div>
  )
}

function getRoundLabel(round: RoundSummary) {
  if (!round.required) return 'N/A'
  if (round.late) return 'Late'
  if (round.submitted) return 'Submitted'
  if (round.requiredCount > 0 && round.completedCount === round.requiredCount) return 'Ready'
  return `${round.completedCount}/${round.requiredCount}`
}

function getRoundTone(round: RoundSummary): keyof typeof pillTone {
  if (!round.required) return 'teal'
  if (round.late) return 'yellow'
  if (round.submitted) return 'green'
  return 'red'
}

function SubmissionRoundCard({ round }: { round: RoundSummary }) {
  return (
    <div className="rounded-lg border border-cyan-100/15 bg-cyan-50/[0.06] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-white">{round.label === 'Prelim' ? 'Preliminary' : 'Semifinal'} Submission</h4>
          <p className="mt-1 text-xs text-white/55">Submitted at: {formatDateTime(round.submittedAt)}</p>
        </div>
        <span className={pillClass(getRoundTone(round))}>{getRoundLabel(round)}</span>
      </div>
      {!round.required ? (
        <p className="mt-3 rounded-md bg-black/20 px-3 py-2 text-sm text-white/58">Not required for this team.</p>
      ) : (
        <div className="mt-3 grid gap-2">
          {round.statuses.map(status => (
            <div key={status.key} className="rounded-md bg-black/20 px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-white/76">{status.label}</span>
                <span className={pillClass(status.complete ? 'green' : 'red')}>
                  {status.complete ? 'Done' : 'Missing'}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/50">
                <span>Updated: {formatDateTime(status.updated_at)}</span>
                {status.url && (
                  <a href={status.url} target="_blank" rel="noopener noreferrer" className="font-bold text-cyan-50 underline-offset-2 hover:underline">
                    Open file
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({ bccTeams: 0, mccTeams: 0, totalMembers: 0 })
  const [teamStats, setTeamStats] = useState<AdminTeamStats>({
    totalTeams: 0,
    paidTeams: 0,
    unpaidTeams: 0,
    completeTeams: 0,
    collectedAmount: 0,
    bccCollectedAmount: 0,
    mccCollectedAmount: 0,
  })
  const [teams, setTeams] = useState<AdminTeam[]>([])
  const [regOpen, setRegOpen] = useState<RegistrationState>({ bcc: false, mcc: false })
  const [syncing, setSyncing] = useState(false)
  const [exportingSemifinalists, setExportingSemifinalists] = useState(false)
  const [syncResult, setSyncResult] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [toggling, setToggling] = useState(false)
  const [competitionFilter, setCompetitionFilter] = useState<CompetitionFilter>('ALL')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [semifinalistsOnly, setSemifinalistsOnly] = useState(false)
  const [query, setQuery] = useState('')
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null)
  const [lastLoadedAt, setLastLoadedAt] = useState<Date | null>(null)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsRes, teamsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/teams'),
        ])

        if ([statsRes.status, teamsRes.status].includes(401) || [statsRes.status, teamsRes.status].includes(403)) {
          window.location.href = '/'
          return
        }

        if (!statsRes.ok) throw new Error(`Stats fetch failed: ${statsRes.status}`)
        if (!teamsRes.ok) throw new Error(`Teams fetch failed: ${teamsRes.status}`)

        const statsData = await statsRes.json()
        const teamsData = await teamsRes.json()
        setStats(statsData.stats)
        setRegOpen(statsData.regOpen)
        setTeams(teamsData.teams)
        setTeamStats(teamsData.stats)
        setLastLoadedAt(new Date())
      } catch (err) {
        console.error(err)
        setLoadError('Failed to load dashboard. Please refresh.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const filteredTeams = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return teams.filter(team => {
      if (!shouldShowTeamInAdminRegistry(team, { semifinalistsOnly })) return false
      if (competitionFilter !== 'ALL' && team.competition !== competitionFilter) return false
      if (statusFilter === 'PAID' && !team.paid) return false
      if (statusFilter === 'UNPAID' && team.paid) return false
      if (statusFilter === 'COMPLETE' && !team.complete) return false
      if (statusFilter === 'INCOMPLETE' && team.complete) return false
      if (statusFilter === 'PRELIM_SUBMITTED' && (team.competition !== 'BCC' || !team.preliminarySubmitted)) return false
      if (statusFilter === 'PRELIM_NOT_SUBMITTED' && (
        team.competition !== 'BCC'
        || team.preliminaryRequiredCount === 0
        || team.preliminarySubmitted
      )) return false
      if (statusFilter === 'PRELIM_LATE' && (team.competition !== 'BCC' || !team.preliminaryLate)) return false
      if (statusFilter === 'PRELIM_READY' && (
        team.competition !== 'BCC'
        || team.preliminarySubmitted
        || team.preliminaryRequiredCount === 0
        || team.preliminaryCompletedCount !== team.preliminaryRequiredCount
      )) return false
      if (statusFilter === 'MCC_PRELIM_SUBMITTED' && (team.competition !== 'MCC' || !team.preliminarySubmitted)) return false
      if (statusFilter === 'MCC_PRELIM_NOT_SUBMITTED' && (
        team.competition !== 'MCC'
        || team.preliminaryRequiredCount === 0
        || team.preliminarySubmitted
      )) return false
      if (statusFilter === 'MCC_PRELIM_LATE' && (team.competition !== 'MCC' || !team.preliminaryLate)) return false
      if (statusFilter === 'MCC_PRELIM_READY' && (
        team.competition !== 'MCC'
        || team.preliminarySubmitted
        || team.preliminaryRequiredCount === 0
        || team.preliminaryCompletedCount !== team.preliminaryRequiredCount
      )) return false
      if (statusFilter === 'SEMIFINAL_SUBMITTED' && !team.semifinalSubmitted) return false
      if (statusFilter === 'SEMIFINAL_NOT_SUBMITTED' && (
        team.competition !== 'BCC'
        || !team.is_semifinalist
        || team.semifinalSubmitted
      )) return false
      if (statusFilter === 'SEMIFINAL_LATE' && !team.semifinalLate) return false
      if (statusFilter === 'SEMIFINAL_READY' && (
        team.competition !== 'BCC'
        || !team.is_semifinalist
        || team.semifinalSubmitted
        || team.semifinalRequiredCount === 0
        || team.semifinalCompletedCount !== team.semifinalRequiredCount
      )) return false
      if (!normalizedQuery) return true

      return [
        team.name,
        team.join_code,
        team.referral_code ?? '',
        ...team.members.map(member => member.nama),
        ...team.members.map(member => member.email),
      ].some(value => value.toLowerCase().includes(normalizedQuery))
    })
  }, [competitionFilter, query, semifinalistsOnly, statusFilter, teams])

  const dashboard = useMemo(() => {
    const bccTeams = teams.filter(team => team.competition === 'BCC')
    const mccTeams = teams.filter(team => team.competition === 'MCC')
    const bccSubmitted = bccTeams.filter(team => team.preliminarySubmitted).length
    const bccLate = bccTeams.filter(team => team.preliminaryLate).length
    const bccOnTime = bccTeams.filter(team => team.preliminarySubmitted && !team.preliminaryLate).length
    const bccSemifinalSubmitted = bccTeams.filter(team => team.semifinalSubmitted).length
    const bccSemifinalLate = bccTeams.filter(team => team.semifinalLate).length
    const mccSubmitted = mccTeams.filter(team => team.preliminarySubmitted).length
    const mccLate = mccTeams.filter(team => team.preliminaryLate).length
    const mccReady = mccTeams.filter(team =>
      !team.preliminarySubmitted
      && team.preliminaryRequiredCount > 0
      && team.preliminaryCompletedCount === team.preliminaryRequiredCount
    ).length
    const bccSemifinalReady = bccTeams.filter(team =>
      team.is_semifinalist
      && !team.semifinalSubmitted
      && team.semifinalRequiredCount > 0
      && team.semifinalCompletedCount === team.semifinalRequiredCount
    ).length
    const bccReady = bccTeams.filter(team =>
      !team.preliminarySubmitted
      && team.preliminaryRequiredCount > 0
      && team.preliminaryCompletedCount === team.preliminaryRequiredCount
    ).length
    const bccMissing = bccTeams.length - bccSubmitted
    const mccMissing = mccTeams.length - mccSubmitted
    const bccSemifinalists = bccTeams.filter(team => team.is_semifinalist).length
    const bccIncompleteFiles = bccTeams.filter(team =>
      !team.preliminarySubmitted
      && team.preliminaryRequiredCount > 0
      && team.preliminaryCompletedCount < team.preliminaryRequiredCount
    ).length
    const paidPercent = percent(teamStats.paidTeams, teamStats.totalTeams)
    const completePercent = percent(teamStats.completeTeams, teamStats.totalTeams)
    const bccPrelimPercent = percent(bccSubmitted, bccTeams.length)
    const mccPrelimPercent = percent(mccSubmitted, mccTeams.length)

    return {
      bccTeams,
      mccTeams,
      bccSubmitted,
      bccLate,
      bccOnTime,
      bccSemifinalSubmitted,
      bccSemifinalLate,
      mccSubmitted,
      mccLate,
      mccReady,
      bccSemifinalReady,
      bccReady,
      bccMissing,
      mccMissing,
      bccSemifinalists,
      bccIncompleteFiles,
      paidPercent,
      completePercent,
      bccPrelimPercent,
      mccPrelimPercent,
      averageMembers: teamStats.totalTeams > 0 ? (stats.totalMembers / teamStats.totalTeams).toFixed(1) : '0.0',
    }
  }, [stats.totalMembers, teamStats.completeTeams, teamStats.paidTeams, teamStats.totalTeams, teams])

  const topMetrics: MetricCard[] = [
    {
      label: 'Total Teams',
      value: teamStats.totalTeams,
      detail: `${dashboard.bccTeams.length} BCC, ${dashboard.mccTeams.length} MCC`,
      tone: 'default',
    },
    {
      label: 'Paid Teams',
      value: teamStats.paidTeams,
      detail: `${dashboard.paidPercent}% payment completion`,
      tone: teamStats.unpaidTeams > 0 ? 'yellow' : 'green',
    },
    {
      label: 'BCC Preliminary',
      value: `${dashboard.bccSubmitted}/${dashboard.bccTeams.length}`,
      detail: `${dashboard.bccLate} late, ${dashboard.bccReady} ready`,
      tone: dashboard.bccMissing > 0 ? 'yellow' : 'green',
    },
    {
      label: 'BCC Semifinal',
      value: `${dashboard.bccSemifinalSubmitted}/${dashboard.bccSemifinalists}`,
      detail: `${dashboard.bccSemifinalLate} late, ${dashboard.bccSemifinalReady} ready`,
      tone: dashboard.bccSemifinalLate > 0 ? 'red' : 'teal',
    },
    {
      label: 'MCC Pitch Deck',
      value: `${dashboard.mccSubmitted}/${dashboard.mccTeams.length}`,
      detail: `${dashboard.mccLate} late, ${dashboard.mccReady} ready`,
      tone: dashboard.mccMissing > 0 ? 'yellow' : 'green',
    },
  ]

  const urgentItems = [
    { label: 'Unpaid teams', value: teamStats.unpaidTeams, tone: teamStats.unpaidTeams > 0 ? 'yellow' : 'green' as Tone },
    { label: 'BCC prelim missing', value: dashboard.bccMissing, tone: dashboard.bccMissing > 0 ? 'yellow' : 'green' as Tone },
    { label: 'MCC pitch missing', value: dashboard.mccMissing, tone: dashboard.mccMissing > 0 ? 'yellow' : 'green' as Tone },
    { label: 'Incomplete prelim files', value: dashboard.bccIncompleteFiles, tone: dashboard.bccIncompleteFiles > 0 ? 'red' : 'green' as Tone },
    { label: 'BCC semifinal late', value: dashboard.bccSemifinalLate, tone: dashboard.bccSemifinalLate > 0 ? 'red' : 'green' as Tone },
  ]

  async function toggleRegistration(competition: 'BCC' | 'MCC', open: boolean) {
    if (toggling) return
    setToggling(true)
    setRegOpen(r => ({ ...r, [competition.toLowerCase()]: open }))
    const res = await fetch('/api/admin/toggle-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ competition, open }),
    })
    if (!res.ok) {
      setRegOpen(r => ({ ...r, [competition.toLowerCase()]: !open }))
    }
    setToggling(false)
  }

  async function syncSheets() {
    setSyncing(true)
    setSyncResult('')
    const res = await fetch('/api/admin/sync-sheets', { method: 'POST' })
    const data = await res.json()
    setSyncResult(res.ok ? `Synced: ${data.bccRows} BCC rows, ${data.mccRows} MCC rows` : `Error: ${data.error}`)
    setSyncing(false)
  }

  async function exportBccSemifinalists() {
    setExportingSemifinalists(true)
    setSyncResult('')
    try {
      const res = await fetch('/api/admin/export-bcc-semifinalists', { method: 'POST' })
      const data = await res.json()
      setSyncResult(res.ok
        ? `Exported ${data.rows} BCC semifinalist teams to the BCC Semifinalists tab`
        : `Error: ${data.error ?? 'Failed to export BCC semifinalists'}`)
    } catch (err) {
      console.error(err)
      setSyncResult('Error: Failed to export BCC semifinalists')
    } finally {
      setExportingSemifinalists(false)
    }
  }

  async function toggleSemifinalist(team: AdminTeam) {
    const next = !team.is_semifinalist
    setTeams(prev => prev.map(t => t.id === team.id ? { ...t, is_semifinalist: next } : t))

    const res = await fetch('/api/admin/team-semifinalist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId: team.id, isSemifinalist: next }),
    })

    if (!res.ok) {
      setTeams(prev => prev.map(t => t.id === team.id ? { ...t, is_semifinalist: !next } : t))
      const data = await res.json().catch(() => ({ error: 'Failed to update' }))
      alert(data.error ?? 'Failed to update semifinalist status')
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#061e33] px-6 text-white">
        <Panel className="w-full max-w-sm p-5 text-center" tone="teal">
          <p className="font-plus-jakarta text-lg font-bold">Loading admin data</p>
          <p className="mt-2 text-sm text-white/65">Fetching teams, registration state, and submission metrics.</p>
        </Panel>
      </main>
    )
  }

  if (loadError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#061e33] px-6 text-white">
        <Panel className="w-full max-w-sm p-5 text-center" tone="red">
          <p className="font-plus-jakarta text-lg font-bold">Dashboard failed to load</p>
          <p className="mt-2 text-sm text-white/70">{loadError}</p>
        </Panel>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_85%_12%,rgba(244,114,182,0.12),transparent_28%),linear-gradient(180deg,#061e33_0%,#082a45_48%,#05233a_100%)] text-white">
      <div className="border-b border-cyan-200/15 bg-[#06243d]/95">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold text-cyan-100">Grand Summit 15th Operations</p>
            <h1 className="mt-1 font-plus-jakarta text-3xl font-bold tracking-tight text-white">Admin Command Center</h1>
            <p className="mt-2 max-w-3xl text-sm text-white/68">
              Monitor registration health, payments, task completion, and BCC preliminary or semifinal submission status.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {lastLoadedAt && <span className="rounded-full border border-cyan-100/15 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-50/75">Loaded {lastLoadedAt.toLocaleString('id-ID')}</span>}
            <a
              href="/api/admin/export"
              className="rounded-lg bg-cyan-200 px-4 py-2.5 text-sm font-bold text-[#05233a] transition hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:ring-offset-2 focus:ring-offset-[#06243d]"
            >
              Download CSV
            </a>
            <button
              onClick={syncSheets}
              disabled={syncing}
              className="rounded-lg border border-cyan-200/45 px-4 py-2.5 text-sm font-bold text-cyan-50 transition hover:bg-cyan-300/16 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:ring-offset-2 focus:ring-offset-[#06243d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {syncing ? 'Syncing Sheets' : 'Sync Sheets'}
            </button>
            <button
              onClick={exportBccSemifinalists}
              disabled={exportingSemifinalists}
              className="rounded-lg border border-emerald-200/50 px-4 py-2.5 text-sm font-bold text-emerald-50 transition hover:bg-emerald-300/16 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:ring-offset-2 focus:ring-offset-[#06243d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exportingSemifinalists ? 'Exporting BCC Semifinalists' : 'Export BCC Semifinalists'}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6">
        {syncResult && (
          <motion.p
            {...fadeUp}
            className="mb-4 rounded-lg border border-cyan-200/35 bg-cyan-300/14 px-4 py-3 text-sm font-semibold text-cyan-50"
          >
            {syncResult}
          </motion.p>
        )}

        <motion.section {...fadeUp} className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {topMetrics.map(metric => <MetricTile key={metric.label} metric={metric} />)}
          </div>

          <Panel className="p-4" tone="teal">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-cyan-50">Registration Gates</p>
                <p className="mt-1 text-xs text-white/55">Toggle availability for participant registration.</p>
              </div>
              <span className={pillClass(regOpen.bcc || regOpen.mcc ? 'green' : 'red')}>
                {regOpen.bcc || regOpen.mcc ? 'Active' : 'Closed'}
              </span>
            </div>
            <div className="mt-4 grid gap-2">
              {(['BCC', 'MCC'] as const).map(comp => {
                const key = comp.toLowerCase() as 'bcc' | 'mcc'
                const open = regOpen[key]
                return (
                  <button
                    key={comp}
                    type="button"
                    onClick={() => toggleRegistration(comp, !open)}
                    disabled={toggling}
                    className="flex items-center justify-between rounded-lg border border-cyan-100/15 bg-cyan-950/18 px-3 py-3 text-left transition hover:bg-cyan-100/10 focus:outline-none focus:ring-2 focus:ring-cyan-100/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>
                      <span className="block text-sm font-bold text-white">{comp}</span>
                      <span className="text-xs text-white/55">{open ? 'Registration is open' : 'Registration is closed'}</span>
                    </span>
                    <span className={pillClass(open ? 'green' : 'red')}>{open ? 'Open' : 'Closed'}</span>
                  </button>
                )
              })}
            </div>
          </Panel>
        </motion.section>

        <motion.section {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.04 }} className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.1fr_0.9fr]">
          <Panel className="p-5" tone="default">
            <p className="text-sm font-semibold text-white/70">Revenue Collected</p>
            <p className="mt-2 font-plus-jakarta text-3xl font-bold tracking-tight">{currency.format(teamStats.collectedAmount)}</p>
            <div className="mt-5 space-y-3">
              {[
                ['BCC', teamStats.bccCollectedAmount, percent(teamStats.bccCollectedAmount, teamStats.collectedAmount)],
                ['MCC', teamStats.mccCollectedAmount, percent(teamStats.mccCollectedAmount, teamStats.collectedAmount)],
              ].map(([label, amount, value]) => (
                <div key={label}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-white/70">{label}</span>
                    <span className="font-bold text-white">{currency.format(amount as number)}</span>
                  </div>
                  <ProgressBar value={value as number} tone="teal" />
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-5" tone={dashboard.bccMissing > 0 ? 'yellow' : 'green'}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white/72">BCC Preliminary Submission</p>
                <p className="mt-2 font-plus-jakarta text-4xl font-bold tracking-tight">
                  {dashboard.bccSubmitted}/{dashboard.bccTeams.length}
                </p>
              </div>
              <span className={pillClass(dashboard.bccMissing > 0 ? 'yellow' : 'green')}>{dashboard.bccPrelimPercent}% submitted</span>
            </div>
            <ProgressBar value={dashboard.bccPrelimPercent} tone={dashboard.bccMissing > 0 ? 'yellow' : 'green'} />
            <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
              {[
                ['On time', dashboard.bccOnTime],
                ['Late', dashboard.bccLate],
                ['Ready', dashboard.bccReady],
                ['Missing', dashboard.bccMissing],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-black/20 px-3 py-3">
                  <p className="text-xs text-white/55">{label}</p>
                  <p className="mt-1 font-plus-jakarta text-xl font-bold text-white">{value}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-5" tone="default">
            <p className="text-sm font-semibold text-white/72">Attention Queue</p>
            <div className="mt-4 space-y-2">
              {urgentItems.map(item => (
                <div key={item.label} className="flex items-center justify-between rounded-lg bg-cyan-50/[0.07] px-3 py-3">
                  <span className="text-sm text-white/70">{item.label}</span>
                  <span className={pillClass(item.tone === 'red' ? 'red' : item.tone === 'yellow' ? 'yellow' : 'green')}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-cyan-50/[0.07] px-3 py-3">
                <p className="text-xs text-white/50">Task complete</p>
                <p className="mt-1 text-lg font-bold text-white">{dashboard.completePercent}%</p>
                <ProgressBar value={dashboard.completePercent} tone={dashboard.completePercent === 100 ? 'green' : 'teal'} />
              </div>
              <div className="rounded-lg bg-cyan-50/[0.07] px-3 py-3">
                <p className="text-xs text-white/50">Avg members</p>
                <p className="mt-1 text-lg font-bold text-white">{dashboard.averageMembers}</p>
              </div>
            </div>
          </Panel>
        </motion.section>

        <motion.section {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }} className="mt-4">
          <Panel className="overflow-hidden" tone="default">
            <div className="border-b border-cyan-200/15 bg-[#07506c] px-4 py-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <h2 className="font-plus-jakarta text-xl font-bold text-white">Team Registry</h2>
                  <p className="mt-1 text-sm text-white/60">
                    Showing {filteredTeams.length} of {teams.length} teams. {dashboard.bccIncompleteFiles} BCC teams still have incomplete preliminary files, {dashboard.mccMissing} MCC teams still need pitch deck submission.
                  </p>
                </div>
                <div className="grid gap-2 md:grid-cols-[minmax(220px,1fr)_170px_220px] xl:min-w-[720px]">
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search team, code, member..."
                    className="rounded-lg border border-cyan-100/20 bg-white/[0.09] px-3 py-2.5 text-sm text-white outline-none placeholder:text-cyan-50/55 focus:border-cyan-100 focus:ring-2 focus:ring-cyan-100/25"
                  />
                  <select
                    value={competitionFilter}
                    onChange={e => setCompetitionFilter(e.target.value as CompetitionFilter)}
                    className="rounded-lg border border-cyan-100/20 bg-white/[0.09] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-100 focus:ring-2 focus:ring-cyan-100/25 [&_option]:bg-[#07506c]"
                  >
                    <option value="ALL">All competitions</option>
                    <option value="BCC">BCC</option>
                    <option value="MCC">MCC</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                    className="rounded-lg border border-cyan-100/20 bg-white/[0.09] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-100 focus:ring-2 focus:ring-cyan-100/25 [&_option]:bg-[#07506c]"
                  >
                    <option value="ALL">All statuses</option>
                    <option value="PAID">Paid</option>
                    <option value="UNPAID">Unpaid</option>
                    <option value="COMPLETE">Complete tasks</option>
                    <option value="INCOMPLETE">Incomplete tasks</option>
                    <option value="PRELIM_SUBMITTED">BCC prelim submitted</option>
                    <option value="PRELIM_NOT_SUBMITTED">BCC prelim not submitted</option>
                    <option value="PRELIM_LATE">BCC prelim late</option>
                    <option value="PRELIM_READY">BCC prelim ready</option>
                    <option value="SEMIFINAL_SUBMITTED">BCC semifinal submitted</option>
                    <option value="SEMIFINAL_NOT_SUBMITTED">BCC semifinal not submitted</option>
                    <option value="SEMIFINAL_LATE">BCC semifinal late</option>
                    <option value="SEMIFINAL_READY">BCC semifinal ready</option>
                    <option value="MCC_PRELIM_SUBMITTED">MCC pitch deck submitted</option>
                    <option value="MCC_PRELIM_NOT_SUBMITTED">MCC pitch deck not submitted</option>
                    <option value="MCC_PRELIM_LATE">MCC pitch deck late</option>
                    <option value="MCC_PRELIM_READY">MCC pitch deck ready</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setSemifinalistsOnly(value => !value)}
                    aria-pressed={semifinalistsOnly}
                    className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm font-bold transition md:col-span-3 ${
                      semifinalistsOnly
                        ? 'border-cyan-100/50 bg-cyan-200/20 text-cyan-50'
                        : 'border-cyan-100/20 bg-white/[0.09] text-white/70 hover:border-cyan-100/35 hover:bg-white/[0.13]'
                    }`}
                  >
                    <span>BCC semifinalists only</span>
                    <span className="inline-flex min-w-8 justify-center rounded-full bg-black/20 px-2 py-0.5 text-xs text-white">
                      {dashboard.bccSemifinalists}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[980px]">
                <div className="grid grid-cols-[1.45fr_0.7fr_0.9fr_0.75fr_0.9fr_0.75fr_0.65fr_44px] gap-3 border-b border-white/10 px-4 py-3 text-xs font-bold text-white/55">
                  <span>Team</span>
                  <span>Competition</span>
                  <span>Fee</span>
                  <span>Payment</span>
                  <span>Submissions</span>
                  <span>Tasks</span>
                  <span>Members</span>
                  <span />
                </div>

                {filteredTeams.length === 0 ? (
                  <div className="px-4 py-12 text-center">
                    <p className="font-plus-jakarta text-lg font-bold text-white">No matching teams</p>
                    <p className="mt-2 text-sm text-white/55">Adjust the search term or status filter to widen the result.</p>
                  </div>
                ) : filteredTeams.map((team, index) => {
                  const expanded = expandedTeamId === team.id
                  const preliminaryRound: RoundSummary = {
                    label: 'Prelim',
                    required: team.preliminaryRequiredCount > 0,
                    submitted: team.preliminarySubmitted,
                    late: team.preliminaryLate,
                    completedCount: team.preliminaryCompletedCount,
                    requiredCount: team.preliminaryRequiredCount,
                    submittedAt: team.preliminarySubmittedAt,
                    statuses: team.preliminaryStatuses,
                  }
                  const semifinalRound: RoundSummary = {
                    label: 'Semi',
                    required: team.competition === 'BCC' && team.is_semifinalist,
                    submitted: team.semifinalSubmitted,
                    late: team.semifinalLate,
                    completedCount: team.semifinalCompletedCount,
                    requiredCount: team.semifinalRequiredCount,
                    submittedAt: team.semifinalSubmittedAt,
                    statuses: team.semifinalStatuses,
                  }
                  const visibleRounds = team.competition === 'MCC'
                    ? [preliminaryRound]
                    : [preliminaryRound, semifinalRound]

                  return (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(index * 0.01, 0.14) }}
                      className="border-b border-white/10 last:border-b-0"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedTeamId(expanded ? null : team.id)}
                        className="grid w-full grid-cols-[1.45fr_0.7fr_0.9fr_0.75fr_0.9fr_0.75fr_0.65fr_44px] items-center gap-3 px-4 py-4 text-left transition hover:bg-cyan-100/[0.055] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-100/45"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-plus-jakarta text-sm font-bold text-white">{team.name}</span>
                          <span className="mt-1 block truncate text-xs text-white/45">
                            {team.join_code}{team.referral_code ? ` | ${team.referral_code}` : ''}
                          </span>
                        </span>
                        <span className={pillClass('teal')}>{team.competition}</span>
                        <span className="whitespace-nowrap text-sm font-bold text-white">{formatFee(team.registration_fee)}</span>
                        <span className={pillClass(team.paid ? 'green' : 'red')}>{team.paid ? 'Paid' : 'Unpaid'}</span>
                        <span className="grid gap-1">
                          {visibleRounds.map(round => (
                            <span key={round.label} className="flex items-center gap-2">
                              <span className="w-10 text-xs font-bold text-white/52">{round.label}</span>
                              <span className={pillClass(getRoundTone(round))}>{getRoundLabel(round)}</span>
                            </span>
                          ))}
                        </span>
                        <span className={pillClass(team.complete ? 'green' : 'yellow')}>
                          {team.completedTaskCount}/{team.requiredTaskCount}
                        </span>
                        <span className="text-sm font-semibold text-white/75">{team.members.length}</span>
                        <span className="text-center text-lg text-cyan-50">{expanded ? '-' : '+'}</span>
                      </button>

                      <AnimatePresence initial={false}>
                        {expanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            <div className="grid gap-4 bg-[#06243d] px-4 py-5 xl:grid-cols-[1.25fr_0.95fr_1fr]">
                              <div>
                                <div className="mb-3 flex items-center justify-between gap-3">
                                  <h3 className="text-sm font-bold text-white">Members</h3>
                                  <span className={pillClass('teal')}>{team.members.length} people</span>
                                </div>
                                <div className="grid gap-2">
                                  {team.members.map(member => (
                                    <div key={member.profile_id} className="rounded-lg border border-cyan-100/15 bg-cyan-50/[0.06] p-3">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-plus-jakarta text-sm font-bold text-white">{member.nama || '-'}</p>
                                        {member.is_leader && <span className={pillClass('teal')}>Leader</span>}
                                      </div>
                                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                        <Field label="NIM" value={member.nim} />
                                        <Field label="Email" value={member.email} />
                                        <Field label="University" value={member.asal_universitas} />
                                        <Field label="Major" value={member.major_program} />
                                        <Field label="Instagram" value={member.instagram_username} />
                                        <Field label="WhatsApp" value={member.wa_no} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h3 className="mb-3 text-sm font-bold text-white">Registration Tasks</h3>
                                <div className="grid gap-2">
                                  {team.taskStatuses.map(task => (
                                    <div key={task.key} className="flex items-center justify-between rounded-lg border border-cyan-100/15 bg-cyan-50/[0.06] px-3 py-2">
                                      <span className="text-sm text-white/76">{task.label}</span>
                                      <span className={pillClass(task.complete ? 'green' : 'red')}>
                                        {task.complete ? 'Done' : 'Missing'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-4 rounded-lg border border-cyan-100/15 bg-cyan-50/[0.06] p-3 text-xs text-white/58">
                                  <p>Source: {team.source_of_information || '-'}</p>
                                  <p className="mt-1">Created: {new Date(team.created_at).toLocaleString('id-ID')}</p>
                                </div>
                              </div>

                              <div>
                                <div className="mb-3 flex items-center justify-between gap-3">
                                  <h3 className="text-sm font-bold text-white">{team.competition === 'MCC' ? 'MCC Pitch Deck' : 'BCC Submissions'}</h3>
                                  {team.competition === 'BCC' && (
                                    <button
                                      type="button"
                                      onClick={() => toggleSemifinalist(team)}
                                      className="flex items-center gap-2 text-left"
                                      title={team.is_semifinalist ? 'Semifinalist' : 'Not semifinalist'}
                                    >
                                      <span className={`text-xs font-bold ${team.is_semifinalist ? 'text-cyan-200' : 'text-white/55'}`}>
                                        {team.is_semifinalist ? 'Semifinalist' : 'Not semifinalist'}
                                      </span>
                                      <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-cyan-100/50 ${team.is_semifinalist ? 'bg-cyan-200' : 'bg-white/20'}`}>
                                        <span
                                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${team.is_semifinalist ? 'translate-x-6' : 'translate-x-1'}`}
                                        />
                                      </span>
                                    </button>
                                  )}
                                </div>
                                <div className="grid gap-3">
                                  {visibleRounds.map(round => <SubmissionRoundCard key={round.label} round={round} />)}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </Panel>
        </motion.section>
      </div>
    </main>
  )
}
