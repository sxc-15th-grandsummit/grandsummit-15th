'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { NAV_ITEMS, ASSETS } from '@/constants'
import GoogleLoginButton from './google-button'
import AuthToast from './auth-toast'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: EASE, delay },
})

export default function LoginContent() {
  return (
    <div
      className="relative flex min-h-screen w-full flex-col overflow-hidden text-white"
      style={{ background: 'linear-gradient(180deg, #063250 10%, #174b61 47.6%, #215c6d 75%, #398085 100%)' }}
    >
      <Header
        navItems={NAV_ITEMS}
        assets={{ summitLogo: ASSETS.heroLogo, sxcLogo: ASSETS.sxcLogo }}
      />

      {/* Left ellipse glow */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
        src="/login-page/eclipse-left.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute select-none"
        style={{ left: '-7.6%', top: '18vh', width: '31%', maxWidth: '449px' }}
      />

      {/* Chess piece */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
        src="/login-page/chess-left.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute select-none"
        style={{ left: '10%', top: '14vh', width: '18%', maxWidth: '262px' }}
      />

      {/* Right ellipse glow */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
        src="/login-page/eclipse-right.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute select-none"
        style={{ right: '-9%', top: '10vh', width: '26%', maxWidth: '380px' }}
      />

      {/* Puzzle pieces */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.0, ease: EASE, delay: 0.15 }}
        src="/login-page/puzzle-right.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute select-none"
        style={{ right: '-3%', top: '-2vh', width: '48%', maxWidth: '690px', transform: 'rotate(-41.9deg)' }}
      />

      <Suspense><AuthToast /></Suspense>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pt-16">
        <motion.h1
          {...fadeUp(0)}
          className="mb-10 text-center font-plus-jakarta text-[clamp(3.5rem,9vw,6rem)] font-extrabold leading-none tracking-tight text-white"
          style={{ textShadow: '0 3px 16px rgba(255,255,255,0.35)' }}
        >
          Log In
        </motion.h1>

        <motion.div {...fadeUp(0.15)}>
          <GoogleLoginButton />
        </motion.div>
      </main>

      <Footer
        navItems={NAV_ITEMS}
        assets={{ summitLogo: ASSETS.heroLogo, sxcLogo: ASSETS.sxcLogo, instagram: ASSETS.instagram }}
        className="relative z-10"
      />
    </div>
  )
}
