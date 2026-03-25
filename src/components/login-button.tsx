'use client'

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

  async function signIn() {
    onAction?.()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

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
        className="rounded-lg border border-teal-500/40 px-4 py-1.5 text-sm font-semibold text-teal-200 transition hover:bg-teal-500/20"
      >
        Logout
      </button>
    )
  }

  return (
    <button
      onClick={signIn}
      className="rounded-lg bg-teal-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-teal-500"
    >
      Login
    </button>
  )
}
