import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type AdminResult =
  | { ok: true; user: { id: string; email: string } }
  | { ok: false; response: Response }

// Returns { ok: true, user } if the request is from an admin,
// or { ok: false, response } with a 401/403 to return immediately.
// NOTE: Intentional deviation from spec signature (spec used throw).
// Return-based pattern is used instead to avoid catching unknown exceptions
// as HTTP responses (TypeScript catches are typed as `unknown`).
export async function requireAdmin(): Promise<AdminResult> {
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

  if (!user?.email) {
    return { ok: false, response: new Response('Unauthorized', { status: 401 }) }
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) ?? []
  if (!adminEmails.includes(user.email)) {
    return { ok: false, response: new Response('Forbidden', { status: 403 }) }
  }

  return { ok: true, user: { id: user.id, email: user.email } }
}
