'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nama: '', nim: '', asal_universitas: '', major_program: '', instagram_username: '',
  })

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const res = await fetch('/api/profile/me')
      if (res.ok) {
        const data = await res.json()
        if (data.profile) {
          setForm({
            nama: data.profile.nama ?? '',
            nim: data.profile.nim ?? '',
            asal_universitas: data.profile.asal_universitas ?? '',
            major_program: data.profile.major_program ?? '',
            instagram_username: data.profile.instagram_username ?? '',
          })
        }
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSaving(false); return }
    router.push('/competition')
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-white">Loading...</div>

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#00243c] px-4 py-20">
      <div className="w-full max-w-md rounded-2xl border border-teal-700/30 bg-[#00243c]/80 p-8 backdrop-blur">
        <h1 className="mb-2 font-plus-jakarta text-2xl font-bold text-white">Complete Your Profile</h1>
        <p className="mb-6 text-sm text-teal-300">Fill in your details to continue with registration.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[
            { label: 'Full Name (Nama)', key: 'nama', placeholder: 'Your full name' },
            { label: 'Student ID (NIM)', key: 'nim', placeholder: 'Your NIM' },
            { label: 'University (Asal Universitas)', key: 'asal_universitas', placeholder: 'Your university' },
            { label: 'Major Program', key: 'major_program', placeholder: 'Your major' },
            { label: 'Instagram Username', key: 'instagram_username', placeholder: '@username' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-medium text-teal-200">{label}</label>
              <input
                type="text"
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                required
                className="w-full rounded-lg border border-teal-700/40 bg-white/10 px-4 py-2 text-white placeholder-white/40 focus:border-teal-400 focus:outline-none"
              />
            </div>
          ))}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-2 rounded-xl bg-teal-600 py-3 font-semibold text-white transition hover:bg-teal-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </main>
  )
}
