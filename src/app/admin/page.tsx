'use client'

import { useState, useEffect } from 'react'

type Stats = { bccTeams: number; mccTeams: number; totalMembers: number }
type RegistrationState = { bcc: boolean; mcc: boolean }

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({ bccTeams: 0, mccTeams: 0, totalMembers: 0 })
  const [regOpen, setRegOpen] = useState<RegistrationState>({ bcc: false, mcc: false })
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data.stats)
        setRegOpen(data.regOpen)
        setLoading(false)
      })
  }, [])

  async function toggleRegistration(competition: 'BCC' | 'MCC', open: boolean) {
    // Optimistic update: update UI immediately before the network call returns
    setRegOpen(r => ({ ...r, [competition.toLowerCase()]: open }))
    await fetch('/api/admin/toggle-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ competition, open }),
    })
  }

  async function syncSheets() {
    setSyncing(true); setSyncResult('')
    const res = await fetch('/api/admin/sync-sheets', { method: 'POST' })
    const data = await res.json()
    setSyncResult(res.ok ? `Synced: ${data.bccRows} BCC rows, ${data.mccRows} MCC rows` : `Error: ${data.error}`)
    setSyncing(false)
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-white">Loading...</div>

  return (
    <main className="min-h-screen bg-[#00243c] px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-plus-jakarta text-3xl font-bold text-white">Admin Dashboard</h1>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: 'BCC Teams', value: stats.bccTeams },
            { label: 'MCC Teams', value: stats.mccTeams },
            { label: 'Total Members', value: stats.totalMembers },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-teal-700/30 bg-white/5 p-5 text-center">
              <div className="text-3xl font-bold text-white">{value}</div>
              <div className="text-sm text-teal-300">{label}</div>
            </div>
          ))}
        </div>

        {/* Registration Toggles */}
        <div className="mb-8 rounded-xl border border-teal-700/30 bg-white/5 p-6">
          <h2 className="mb-4 font-semibold text-white">Registration Status</h2>
          <div className="flex flex-col gap-3">
            {(['BCC', 'MCC'] as const).map(comp => (
              <div key={comp} className="flex items-center justify-between">
                <span className="text-teal-200">{comp} Registration</span>
                <button
                  onClick={() => toggleRegistration(comp, !regOpen[comp.toLowerCase() as 'bcc' | 'mcc'])}
                  className={`rounded-full px-6 py-1.5 text-sm font-semibold transition ${
                    regOpen[comp.toLowerCase() as 'bcc' | 'mcc']
                      ? 'bg-green-600 text-white hover:bg-green-500'
                      : 'bg-red-900/50 text-red-300 hover:bg-red-900'
                  }`}
                >
                  {regOpen[comp.toLowerCase() as 'bcc' | 'mcc'] ? 'Open' : 'Closed'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex gap-4">
          <a
            href="/api/admin/export"
            className="rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-500"
          >
            Download CSV
          </a>
          <button
            onClick={syncSheets}
            disabled={syncing}
            className="rounded-xl border border-teal-500/40 px-6 py-3 font-semibold text-teal-200 transition hover:bg-teal-500/20 disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync to Google Sheets'}
          </button>
        </div>
        {syncResult && <p className="mt-3 text-sm text-teal-300">{syncResult}</p>}
      </div>
    </main>
  )
}
