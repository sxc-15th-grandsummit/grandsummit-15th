'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

const pillClass =
  'rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-semibold tracking-[0.1em] text-white/90 backdrop-blur-sm transition hover:bg-white/15 hover:border-white/30'

interface Props {
  onAction?: () => void
  /** If true, renders as a large drawer-style link (mobile) */
  mobile?: boolean
}

export default function RegistrationNav({ onAction, mobile }: Props) {
  const [ready, setReady] = useState(false)
  const [registrations, setRegistrations] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        if (!cancelled) { setRegistrations([]); setReady(true) }
        return
      }

      const [bccRes, mccRes] = await Promise.all([
        fetch('/api/teams/my?competition=BCC'),
        fetch('/api/teams/my?competition=MCC'),
      ])

      const regs: string[] = []
      if (bccRes.ok && (await bccRes.json()).team) regs.push('BCC')
      if (mccRes.ok && (await mccRes.json()).team) regs.push('MCC')

      if (!cancelled) { setRegistrations(regs); setReady(true) }
    }

    load()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setReady(false)
      load()
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  if (!ready) return null

  if (mobile) {
    if (registrations.length === 0) {
      return (
        <Link href="/#category" onClick={onAction} className="tracking-[0.04em]">
          Registration
        </Link>
      )
    }
    return (
      <div className="flex flex-col gap-2">
        {registrations.map((comp) => (
          <Link
            key={comp}
            href={`/competition/${comp.toLowerCase()}/register`}
            onClick={onAction}
            className="tracking-[0.04em]"
          >
            {comp} Registration
          </Link>
        ))}
      </div>
    )
  }

  // Desktop
  return (
    <AnimatePresence mode="wait">
      {registrations.length === 0 ? (
        <motion.span
          key="registration"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22 }}
        >
          <Link href="/#category" onClick={onAction} className="transition hover:text-[#b9f5f0]">
            Registration
          </Link>
        </motion.span>
      ) : (
        <motion.span
          key="registered"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22 }}
          className="flex items-center gap-2"
        >
          {registrations.map((comp) => (
            <Link
              key={comp}
              href={`/competition/${comp.toLowerCase()}/register`}
              onClick={onAction}
              className={pillClass}
            >
              {comp}
            </Link>
          ))}
        </motion.span>
      )}
    </AnimatePresence>
  )
}
