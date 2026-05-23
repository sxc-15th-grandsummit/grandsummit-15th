'use client'

import { useEffect, useMemo, useState } from 'react'

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
  members: TeamMember[]
  taskStatuses: TaskStatus[]
}

type CompetitionFilter = 'ALL' | 'BCC' | 'MCC'
type StatusFilter = 'ALL' | 'PAID' | 'UNPAID' | 'COMPLETE' | 'INCOMPLETE'

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

function formatFee(value: number | null) {
  return value ? currency.format(value) : '-'
}

function pillClass(tone: 'green' | 'red' | 'yellow' | 'teal') {
  const map = {
    green: 'border-green-400/25 bg-green-500/10 text-green-200',
    red: 'border-red-400/25 bg-red-500/10 text-red-200',
    yellow: 'border-yellow-400/25 bg-yellow-500/10 text-yellow-200',
    teal: 'border-teal-400/25 bg-teal-500/10 text-teal-200',
  }
  return `rounded-full border px-3 py-1 text-xs font-bold ${map[tone]}`
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
  const [syncResult, setSyncResult] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [toggling, setToggling] = useState(false)
  const [competitionFilter, setCompetitionFilter] = useState<CompetitionFilter>('ALL')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [query, setQuery] = useState('')
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null)

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
      if (competitionFilter !== 'ALL' && team.competition !== competitionFilter) return false
      if (statusFilter === 'PAID' && !team.paid) return false
      if (statusFilter === 'UNPAID' && team.paid) return false
      if (statusFilter === 'COMPLETE' && !team.complete) return false
      if (statusFilter === 'INCOMPLETE' && team.complete) return false
      if (!normalizedQuery) return true

      return [
        team.name,
        team.join_code,
        team.referral_code ?? '',
        ...team.members.map(member => member.nama),
        ...team.members.map(member => member.email),
      ].some(value => value.toLowerCase().includes(normalizedQuery))
    })
  }, [competitionFilter, query, statusFilter, teams])

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

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#00243c] text-white">Loading...</div>
  if (loadError) return <div className="flex min-h-screen items-center justify-center bg-[#00243c] text-red-400">{loadError}</div>

  return (
    <main className="min-h-screen bg-[#00243c] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-teal-300">Grand Summit 15th</p>
            <h1 className="font-plus-jakarta text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/api/admin/export" className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-500">
              Download CSV
            </a>
            <button
              onClick={syncSheets}
              disabled={syncing}
              className="rounded-lg border border-teal-500/40 px-5 py-2.5 text-sm font-bold text-teal-100 transition hover:bg-teal-500/20 disabled:opacity-50"
            >
              {syncing ? 'Syncing...' : 'Sync Sheets'}
            </button>
          </div>
        </div>

        {syncResult && <p className="mb-4 text-sm text-teal-300">{syncResult}</p>}

        <div className="mb-4 grid gap-4 lg:grid-cols-[1.45fr_1fr]">
          <div className="rounded-lg border border-teal-400/25 bg-teal-500/[0.08] p-5">
            <div className="font-plus-jakarta text-3xl font-bold tracking-tight">{currency.format(teamStats.collectedAmount)}</div>
            <div className="mt-1 text-sm text-teal-200/80">Collected from paid teams</div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-white/10 bg-black/10 px-3 py-2">
                <p className="text-xs font-bold uppercase tracking-wider text-white/40">BCC</p>
                <p className="mt-1 font-plus-jakarta text-lg font-bold text-white">{currency.format(teamStats.bccCollectedAmount)}</p>
              </div>
              <div className="rounded-md border border-white/10 bg-black/10 px-3 py-2">
                <p className="text-xs font-bold uppercase tracking-wider text-white/40">MCC</p>
                <p className="mt-1 font-plus-jakarta text-lg font-bold text-white">{currency.format(teamStats.mccCollectedAmount)}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Total Teams', value: teamStats.totalTeams },
              { label: 'Paid Teams', value: teamStats.paidTeams },
              { label: 'Unpaid Teams', value: teamStats.unpaidTeams },
              { label: 'Complete Tasks', value: teamStats.completeTeams },
            ].map(card => (
              <div key={card.label} className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                <div className="font-plus-jakarta text-2xl font-bold">{card.value}</div>
                <div className="text-sm text-teal-200/80">{card.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'BCC Teams', value: stats.bccTeams },
            { label: 'MCC Teams', value: stats.mccTeams },
            { label: 'Total Members', value: stats.totalMembers },
          ].map(card => (
            <div key={card.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="font-plus-jakarta text-xl font-bold">{card.value}</div>
              <div className="text-sm text-white/55">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-lg border border-white/10 bg-white/[0.05] p-4">
          <div className="grid gap-4 xl:grid-cols-[auto_1fr] xl:items-center">
            <div className="flex flex-wrap gap-2">
              {(['BCC', 'MCC'] as const).map(comp => (
                <div key={comp} className="flex items-center gap-3 rounded-lg bg-black/10 px-3 py-2">
                  <span className="text-sm font-bold text-teal-100">{comp}</span>
                  <button
                    onClick={() => toggleRegistration(comp, !regOpen[comp.toLowerCase() as 'bcc' | 'mcc'])}
                    disabled={toggling}
                    className={regOpen[comp.toLowerCase() as 'bcc' | 'mcc'] ? pillClass('green') : pillClass('red')}
                  >
                    {regOpen[comp.toLowerCase() as 'bcc' | 'mcc'] ? 'Open' : 'Closed'}
                  </button>
                </div>
              ))}
            </div>
            <div className="grid gap-2 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search team, code, member..."
                className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-teal-400/60"
              />
              <select
                value={competitionFilter}
                onChange={e => setCompetitionFilter(e.target.value as CompetitionFilter)}
                className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-teal-400/60"
              >
                <option value="ALL">All competitions</option>
                <option value="BCC">BCC</option>
                <option value="MCC">MCC</option>
              </select>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-teal-400/60"
              >
                <option value="ALL">All statuses</option>
                <option value="PAID">Paid</option>
                <option value="UNPAID">Unpaid</option>
                <option value="COMPLETE">Complete tasks</option>
                <option value="INCOMPLETE">Incomplete tasks</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
          <div className="grid grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_0.9fr_0.8fr_44px] gap-3 border-b border-white/10 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white/45">
            <span>Team</span>
            <span>Competition</span>
            <span>Fee</span>
            <span>Payment</span>
            <span>Tasks</span>
            <span>Members</span>
            <span />
          </div>

          {filteredTeams.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-white/50">No teams match the current filters.</div>
          ) : filteredTeams.map(team => {
            const expanded = expandedTeamId === team.id
            return (
              <div key={team.id} className="border-b border-white/10 last:border-b-0">
                <button
                  type="button"
                  onClick={() => setExpandedTeamId(expanded ? null : team.id)}
                  className="grid w-full grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_0.9fr_0.8fr_44px] items-center gap-3 px-4 py-4 text-left transition hover:bg-white/[0.04]"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-plus-jakarta text-sm font-bold text-white">{team.name}</span>
                    <span className="mt-1 block text-xs text-white/45">
                      {team.join_code}{team.referral_code ? ` • ${team.referral_code}` : ''}
                    </span>
                  </span>
                  <span className={pillClass('teal')}>{team.competition}</span>
                  <span className="text-sm font-bold text-white">{formatFee(team.registration_fee)}</span>
                  <span className={team.paid ? pillClass('green') : pillClass('red')}>{team.paid ? 'Paid' : 'Unpaid'}</span>
                  <span className={team.complete ? pillClass('green') : pillClass('yellow')}>
                    {team.completedTaskCount}/{team.requiredTaskCount}
                  </span>
                  <span className="text-sm text-white/75">{team.members.length}</span>
                  <span className="text-center text-lg text-teal-200">{expanded ? '−' : '+'}</span>
                </button>

                {expanded && (
                  <div className="grid gap-4 bg-black/10 px-4 py-5 lg:grid-cols-[1.4fr_1fr]">
                    <div>
                      <h3 className="mb-3 text-sm font-bold text-white">Members</h3>
                      <div className="space-y-2">
                        {team.members.map(member => (
                          <div key={member.profile_id} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-plus-jakarta text-sm font-bold text-white">{member.nama || '-'}</p>
                              {member.is_leader && <span className={pillClass('teal')}>Leader</span>}
                            </div>
                            <div className="mt-2 grid gap-1 text-xs text-white/55 sm:grid-cols-2">
                              <span>NIM: {member.nim || '-'}</span>
                              <span>Email: {member.email || '-'}</span>
                              <span>University: {member.asal_universitas || '-'}</span>
                              <span>Major: {member.major_program || '-'}</span>
                              <span>IG: {member.instagram_username || '-'}</span>
                              <span>WA: {member.wa_no || '-'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-3 text-sm font-bold text-white">Task Status</h3>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                        {team.taskStatuses.map(task => (
                          <div key={task.key} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                            <span className="text-sm text-white/75">{task.label}</span>
                            <span className={task.complete ? pillClass('green') : pillClass('red')}>
                              {task.complete ? 'Done' : 'Missing'}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-xs text-white/55">
                        <p>Source: {team.source_of_information || '-'}</p>
                        <p className="mt-1">Created: {new Date(team.created_at).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
