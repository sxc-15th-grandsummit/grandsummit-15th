import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // Only run middleware on the specific protected page routes.
  // Do NOT add a catch-all here — it would run supabase.auth.getUser()
  // on every API request, adding a network round-trip to each call.
  matcher: [
    '/profile',
    '/profile/:path*',
    '/competition/:slug/register',
    '/competition/:slug/register/:path*',
    '/competition/bcc/register',
    '/competition/bcc/register/:path*',
    '/competition/mcc/register',
    '/competition/mcc/register/:path*',
    '/admin',
    '/admin/:path*',
  ],
}
