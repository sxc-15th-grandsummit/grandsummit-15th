import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Service role client: bypasses RLS entirely.
// Does NOT use session cookies — cookie handlers are intentionally no-ops.
export async function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    }
  )
}

// Gets the current session user via the anon key (reads cookies).
// Use this in API route handlers to identify who is calling.
// Returns null if not authenticated.
export async function getSessionUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
