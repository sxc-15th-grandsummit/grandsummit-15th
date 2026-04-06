'use client'

import { Fragment, Suspense, useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'
import PageBackground from '@/components/page-background'
import { NAV_ITEMS, ASSETS } from '@/constants'

const supabase = createClient()

const inputClass =
  'w-full rounded-[10px] bg-white/10 px-3 py-2 text-xs font-poppins text-white placeholder-[rgba(184,222,218,0.75)] outline-none transition focus:bg-white/15 focus:ring-1 focus:ring-accent-teal/50'

const labelClass = 'mb-1 block text-xs font-bold font-plus-jakarta text-white'

function ProfileLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(180deg, #011f33 30%, #03263e 62%, #063250 100%)' }}>
      <span className="font-plus-jakarta text-white/60">Loading…</span>
    </div>
  )
}

function ProfilePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [email, setEmail] = useState('')
  const [dismissedPrompt, setDismissedPrompt] = useState(false)
  const [form, setForm] = useState({
    nama: '', nim: '', asal_universitas: '', major_program: '', instagram_username: '', line_id: '', wa_no: '',
  })

  const shouldPromptCompletion =
    searchParams.get('toast') === 'complete-profile' && !dismissedPrompt
  const nextPath = searchParams.get('next')
  const safeNextPath = nextPath?.startsWith('/') ? nextPath : null

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setEmail(user.email ?? '')

      const res = await fetch('/api/profile/me')
      if (res.ok) {
        const { profile } = await res.json()
        if (profile) {
          setForm({
            nama: profile.nama ?? '',
            nim: profile.nim ?? '',
            asal_universitas: profile.asal_universitas ?? '',
            major_program: profile.major_program ?? '',
            instagram_username: profile.instagram_username ?? '',
            line_id: profile.line_id ?? '',
            wa_no: profile.wa_no ?? '',
          })
        }
      }
      setLoading(false)
    }
    load()
  }, [router])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (!res.ok) {
      const d = await res.json()
      alert(d.error)
      return
    }

    if (safeNextPath) {
      // Hard redirect so middleware re-evaluates with fresh profile data
      window.location.href = safeNextPath
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return <ProfileLoadingScreen />
  }

  return (
    <div
      className="relative flex min-h-screen w-full flex-col overflow-hidden text-white"
      style={{ background: 'linear-gradient(180deg, #011f33 30%, #03263e 62%, #063250 100%)' }}
    >
      <PageBackground />

      <AnimatePresence>
        {shouldPromptCompletion && (
          <Fragment key="complete-prompt">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed inset-x-4 top-24 z-50 mx-auto max-w-md"
            >
              <div
                className="rounded-[22px] border px-6 py-5 text-white shadow-2xl"
                style={{ background: 'rgba(6,50,80,0.96)', borderColor: 'rgba(87,174,165,0.4)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-plus-jakarta text-lg font-bold">Complete Your Profile to Register!</p>
                    <p className="mt-2 text-sm font-poppins leading-relaxed text-white/75">
                      Please fill in all profile fields first. Once saved, you will be taken directly to the team registration page.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDismissedPrompt(true)}
                    className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/10"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </Fragment>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {saved && (
          <motion.div
            key="save-toast"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-full border border-accent-teal/40 bg-[rgba(6,50,80,0.95)] px-5 py-2.5 text-sm font-semibold font-plus-jakarta text-white shadow-xl"
          >
            ✓ Profile saved successfully
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-1 flex-col">
        <Header navItems={NAV_ITEMS} assets={{ summitLogo: ASSETS.heroLogo, sxcLogo: ASSETS.sxcLogo }} />

        <main className="flex flex-1 flex-col items-center px-4 pt-12 pb-12 sm:px-6 mt-12 md:px-10">
          {/* Title image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            src="/regist-profile/profile.png"
            alt="Profile"
            className="mb-10 h-16 object-contain md:h-50"
            draggable={false}
          />

          {/* Form card */}
          <motion.form
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            onSubmit={handleSubmit}
            className="w-full max-w-5xl rounded-[20px] px-8 py-8 md:px-12 md:py-10"
            style={{ background: 'rgba(6,50,80,0.3)' }}
          >
            <div className="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2">
              {/* Row 1 */}
              <div>
                <label className={labelClass}>Full Name</label>
                <input name="nama" value={form.nama} onChange={handleChange} placeholder="Your Full Name" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Your Major or Faculty</label>
                <input name="major_program" value={form.major_program} onChange={handleChange} placeholder="Your Major/Program" className={inputClass} />
              </div>

              {/* Row 2 */}
              <div>
                <label className={labelClass}>Student ID (NIM)</label>
                <input name="nim" value={form.nim} onChange={handleChange} placeholder="Your NIM" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input value={email} readOnly placeholder="your@email.com" className={inputClass + ' cursor-not-allowed opacity-60'} />
              </div>

              {/* Row 3 */}
              <div>
                <label className={labelClass}>University / School</label>
                <input name="asal_universitas" value={form.asal_universitas} onChange={handleChange} placeholder="Your University/School" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Instagram Username</label>
                <input name="instagram_username" value={form.instagram_username} onChange={handleChange} placeholder="@username" className={inputClass} />
              </div>

              {/* Row 4 */}
              <div>
                <label className={labelClass}>Line ID</label>
                <input name="line_id" value={form.line_id} onChange={handleChange} placeholder="your_line_id" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>WhatsApp Number</label>
                <input name="wa_no" value={form.wa_no} onChange={handleChange} placeholder="08XXXXXXXXXX" className={inputClass} />
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full px-6 py-2 text-sm font-bold font-plus-jakarta text-white transition hover:brightness-110 disabled:opacity-60"
                  style={{ background: 'rgba(87,174,165,0.3)' }}
                >
                  {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-full bg-white/10 px-6 py-2 text-sm font-medium font-plus-jakarta text-white transition hover:bg-white/15"
                >
                  Cancel
                </button>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold font-plus-jakarta text-white transition hover:brightness-110"
                style={{ background: 'rgba(87,174,165,0.3)' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Log Out
              </button>
            </div>
          </motion.form>
        </main>

        <Footer navItems={NAV_ITEMS} assets={{ summitLogo: ASSETS.heroLogo, sxcLogo: ASSETS.sxcLogo, instagram: ASSETS.instagram }} />
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoadingScreen />}>
      <ProfilePageContent />
    </Suspense>
  )
}
