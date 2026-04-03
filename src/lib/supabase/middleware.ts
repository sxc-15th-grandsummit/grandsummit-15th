import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // /profile requires a session
  if (pathname.startsWith('/profile') && !user) {
    return NextResponse.redirect(new URL('/login?toast=auth', request.url))
  }

  // /competition/[slug]/register requires session + complete profile
  if (pathname.match(/^\/competition\/[^/]+\/register/) && !user) {
    return NextResponse.redirect(new URL('/login?toast=auth', request.url))
  }

  if (pathname.match(/^\/competition\/[^/]+\/register/) && user) {
    // Check profile completeness via service role
    const serviceClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('is_complete')
      .eq('id', user.id)
      .single()

    if (!profile?.is_complete) {
      return NextResponse.redirect(new URL('/profile', request.url))
    }
  }

  // /admin requires session + admin email
  if (pathname.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/login?toast=auth', request.url))
  }

  if (pathname.startsWith('/admin') && user) {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) ?? []
    if (!adminEmails.includes(user.email ?? '')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}
