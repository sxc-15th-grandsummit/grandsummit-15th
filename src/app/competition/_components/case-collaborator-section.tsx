'use client'

import { motion } from 'framer-motion'
import AssetImage from '@/app/_components/asset-image'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

type CollaboratorLogo = {
  alt: string
  height: number
  src: string
  width: number
}

const revealUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.7, ease: EASE },
}

export default function CaseCollaboratorSection({
  logos,
}: {
  logos: CollaboratorLogo[]
}) {
  return (
    <div id="case-collaborator" className="relative px-4 pb-20 pt-8 text-center sm:px-6 md:px-20">
      <motion.h2
        {...revealUp}
        className="font-plus-jakarta text-4xl font-bold leading-none text-white [text-shadow:0_0_20px_rgba(178,239,255,0.35)] md:text-5xl"
      >
        Case{' '}
        <span className="italic text-shadow-md text-shadow-white">
          Collaborator
        </span>
      </motion.h2>

      <motion.div
        {...revealUp}
        className="relative mx-auto mt-8 max-w-5xl overflow-hidden rounded-3xl border border-accent-teal/45 p-4 shadow-[0_0_34px_rgba(142,225,216,0.24),inset_0_2px_0_rgba(242,242,242,0.18)] md:mt-10 md:p-6"
        style={{
          background:
            'linear-gradient(180deg,rgba(6,50,80,0.34)_0%,rgba(87,174,165,0.28)_100%)',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(142,225,216,0.34),transparent_38%),linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)]"
        />
        <div className="relative z-10 grid gap-4 md:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
          {logos.map((logo) => (
            <div
              key={logo.src}
              className="flex h-32 items-center justify-center rounded-2xl border border-white/12 bg-white px-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] md:h-40 md:px-8"
            >
              <AssetImage
                alt={`${logo.alt} logo`}
                className="max-h-[76%] w-auto object-contain"
                height={logo.height}
                sizes="(max-width: 768px) 80vw, 360px"
                src={logo.src}
                width={logo.width}
              />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
