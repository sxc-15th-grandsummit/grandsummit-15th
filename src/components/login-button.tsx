'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const supabase = createClient()

interface LoginButtonProps {
  onAction?: () => void
  drawerVariant?: boolean
}

export default function LoginButton({ onAction, drawerVariant }: LoginButtonProps = {}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return null

  const baseClass = drawerVariant
    ? 'w-full rounded-2xl border border-white/25 bg-white/15 px-6 py-4 text-lg font-bold font-plus-jakarta text-white backdrop-blur-sm transition hover:bg-white/20 text-center block'
    : 'rounded-full border border-white/20 bg-white/10 px-5 py-1.5 text-sm font-semibold text-white/90 backdrop-blur-sm transition hover:bg-white/15 hover:border-white/30'

  if (user) {
    return (
      <Link href="/profile" onClick={onAction} className={baseClass}>
        Profile
      </Link>
    )
  }

  return (
    <Link href="/login" onClick={onAction} className={baseClass}>
      Login
    </Link>
  )
}
