import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { NAV_ITEMS, ASSETS } from '@/constants'
import GoogleLoginButton from './google-button'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/')

  return (
    <div
      className="relative flex min-h-screen w-full flex-col overflow-hidden text-white"
      style={{ background: 'linear-gradient(180deg, #063250 10%, #174b61 47.6%, #215c6d 75%, #398085 100%)' }}
    >
      <Header
        navItems={NAV_ITEMS}
        assets={{ summitLogo: ASSETS.heroLogo, sxcLogo: ASSETS.sxcLogo }}
      />

      {/* ── Decorative background elements ─────────────────────── */}

      {/* Left ellipse glow */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/login-page/eclipse-left.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute select-none"
        style={{ left: '-7.6%', top: '18vh', width: '31%', maxWidth: '449px' }}
      />

      {/* Chess piece */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/login-page/chess-left.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute select-none"
        style={{ left: '10%', top: '14vh', width: '18%', maxWidth: '262px' }}
      />

      {/* Right ellipse glow */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/login-page/eclipse-right.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute select-none"
        style={{ right: '-9%', top: '10vh', width: '26%', maxWidth: '380px' }}
      />

      {/* Puzzle pieces */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/login-page/puzzle-right.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute select-none"
        style={{ right: '-3%', top: '-2vh', width: '48%', maxWidth: '690px', transform: 'rotate(-41.9deg)' }}
      />

      {/* ── Main content ───────────────────────────────────────── */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pt-16">
        <h1
          className="mb-10 text-center font-plus-jakarta text-[clamp(3.5rem,9vw,6rem)] font-extrabold leading-none tracking-tight text-white"
          style={{ textShadow: '0 3px 16px rgba(255,255,255,0.35)' }}
        >
          Log In
        </h1>

        <GoogleLoginButton />
      </main>

      <Footer
        navItems={NAV_ITEMS}
        assets={{ summitLogo: ASSETS.heroLogo, sxcLogo: ASSETS.sxcLogo, instagram: ASSETS.instagram }}
        className="relative z-10"
      />
    </div>
  )
}
