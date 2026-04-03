'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const supabase = createClient()

interface LoginButtonProps {
  onAction?: () => void
}

export default function LoginButton({ onAction }: LoginButtonProps = {}) {
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

  async function signOut() {
    onAction?.()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return null

  if (user) {
    return (
      <button
        onClick={signOut}
        className="rounded-full border border-white/20 bg-white/10 px-5 py-1.5 text-sm font-semibold text-white/90 backdrop-blur-sm transition hover:bg-white/15 hover:border-white/30"
      >
        Logout
      </button>
    )
  }

  return (
    <Link
      href="/login"
      onClick={onAction}
      className="rounded-full border border-white/20 bg-white/10 px-5 py-1.5 text-sm font-semibold text-white/90 backdrop-blur-sm transition hover:bg-white/15 hover:border-white/30"
    >
      Login
    </Link>
  )
}
