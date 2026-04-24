'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { NAV_ITEMS, ASSETS, GRADIENTS } from '@/constants'
import AssetImage from '@/app/_components/asset-image'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: EASE, delay },
})

const revealUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.7, ease: EASE, delay },
})

type TimelineItem = {
  event: string
  date: string
  highlight?: boolean
}

type Decoration = {
  src: string
  width: number
  height: number
  className: string
  sizes?: string
  priority?: boolean
  quality?: number
  unoptimized?: boolean
}

const TIMELINE: ReadonlyArray<TimelineItem> = [
  { event: 'Open Registration', date: '11 April-28 April' },
  { event: 'Case Release 1', date: '29 April' },
  { event: 'Essay Submission', date: '30 April-14 May' },
  { event: 'Preliminary Assessment', date: '15-27 May' },
  { event: 'Announcement Semifinalist', date: '29 May', highlight: true },
] as const

const BENEFITS = [
  'Real-World Case Experience',
  'Professional Network',
  'Pitch Deck Mastery',
  'The Summit Experience',
  'National-Level Competition Exposure',
  'Certificates & Prizes',
] as const

const CONTACT = [
  { name: 'Athar Falah', line: 'atharfalah', phone: '087877791788' },
  { name: 'Syafa Nurfadillah', line: 'syafna2', phone: '082120090692' },
]

const cardBg = 'linear-gradient(180deg, rgba(6,50,80,0.25) 0%, rgba(87,174,165,0.25) 100%)'

const HERO_DECORATIONS: ReadonlyArray<Decoration> = [
  {
    src: '/bcc/Ellipse.png',
    width: 2880,
    height: 1614,
    className: 'absolute left-1/2 top-10 w-[125%] min-w-[720px] max-w-none -translate-x-1/2 opacity-50 sm:top-12 sm:w-[118%] lg:top-14 lg:w-[100%] xl:w-[92%]',
    priority: true,
    quality: 100,
    sizes: '100vw',
    unoptimized: true,
  },
  {
    src: '/bcc/Ellipse 30.png',
    width: 391,
    height: 398,
    className: 'absolute -left-14 top-4 hidden w-36 opacity-24 md:block lg:-left-10 lg:top-0 lg:w-56 xl:-left-6 xl:w-64',
    sizes: '(min-width: 1024px) 256px, 160px',
  },
  {
    src: '/bcc/Ellipse 29.png',
    width: 250,
    height: 247,
    className: 'absolute left-4 top-20 hidden w-20 opacity-55 mix-blend-multiply md:block lg:left-10 lg:top-24 lg:w-32 xl:left-16 xl:w-40',
    sizes: '(min-width: 1024px) 176px, 96px',
  },
  {
    src: '/bcc/Ellipse 26.png',
    width: 426,
    height: 729,
    className: 'absolute -right-20 bottom-[-6rem] hidden w-52 opacity-22 md:block lg:-right-14 lg:bottom-[-9rem] lg:w-[20rem] xl:-right-8 xl:w-[23rem]',
    sizes: '(min-width: 1024px) 416px, 256px',
  },
  {
    src: '/bcc/Group 141.png',
    width: 135,
    height: 188,
    className: 'absolute left-0 top-[58%] hidden w-8 opacity-28 md:block lg:left-2 lg:w-10 xl:left-4 xl:w-12',
    sizes: '(min-width: 1024px) 56px, 40px',
  },
] as const

const LOWER_DECORATIONS: ReadonlyArray<Decoration> = [
  {
    src: '/bcc/Ellipse(2).png',
    width: 499,
    height: 938,
    className: 'absolute -left-16 top-32 hidden w-20 opacity-16 md:block lg:left-2 lg:w-28',
    sizes: '(min-width: 1024px) 112px, 80px',
  },
  {
    src: '/bcc/Ellipse(1).png',
    width: 838,
    height: 1432,
    className: 'absolute -right-24 top-[18rem] hidden w-40 opacity-12 md:block lg:right-[-2rem] lg:w-64',
    sizes: '(min-width: 1024px) 256px, 160px',
  },
  {
    src: '/bcc/Group 142.png',
    width: 226,
    height: 364,
    className: 'absolute right-2 top-[44rem] hidden w-10 opacity-20 md:block lg:right-10 lg:w-14',
    sizes: '(min-width: 1024px) 56px, 40px',
  },
  {
    src: '/bcc/Group 143.png',
    width: 200,
    height: 299,
    className: 'absolute left-4 bottom-28 hidden w-10 opacity-20 md:block lg:left-16 lg:w-14',
    sizes: '(min-width: 1024px) 56px, 40px',
  },
] as const

const CTA_DECORATIONS: ReadonlyArray<Decoration> = [
  {
    src: '/bcc/Ellipse 31.png',
    width: 173,
    height: 302,
    className: 'absolute left-4 top-8 hidden w-14 opacity-16 md:block lg:left-10 lg:w-20',
    sizes: '(min-width: 1024px) 80px, 56px',
  },
  {
    src: '/bcc/Ellipse 20.png',
    width: 378,
    height: 536,
    className: 'absolute -right-8 bottom-0 hidden w-24 opacity-16 md:block lg:right-6 lg:w-36',
    sizes: '(min-width: 1024px) 144px, 96px',
  },
] as const

const CONTACT_DECORATIONS: ReadonlyArray<Decoration> = [
  {
    src: '/bcc/Group 141.png',
    width: 135,
    height: 188,
    className: 'absolute left-2 top-4 hidden w-8 opacity-16 md:block lg:left-10 lg:w-12',
    sizes: '(min-width: 1024px) 48px, 32px',
  },
  {
    src: '/bcc/Ellipse 31.png',
    width: 173,
    height: 302,
    className: 'absolute right-2 bottom-0 hidden w-12 opacity-12 md:block lg:right-12 lg:w-16',
    sizes: '(min-width: 1024px) 64px, 48px',
  },
] as const

function Decorations({ assets }: { assets: ReadonlyArray<Decoration> }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {assets.map((asset) => (
        <AssetImage
          key={`${asset.src}-${asset.className}`}
          alt=""
          src={asset.src}
          width={asset.width}
          height={asset.height}
          className={asset.className}
          sizes={asset.sizes}
          priority={asset.priority}
          quality={asset.quality}
          unoptimized={asset.unoptimized}
        />
      ))}
    </div>
  )
}

function MccBenefitsGrid() {
  return (
    <div className="mx-auto grid max-w-[54rem] gap-x-24 gap-y-8 sm:grid-cols-2">
      {BENEFITS.map((benefit, index) => (
        <motion.div
          key={benefit}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, ease: EASE, delay: index * 0.06 }}
          className="flex min-h-[3.75rem] items-center justify-center rounded-full border border-white/20 bg-[linear-gradient(96deg,rgba(4,35,58,0.82)_0%,rgba(8,52,78,0.76)_48%,rgba(46,124,139,0.68)_100%)] px-10 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_12px_30px_rgba(0,0,0,0.16)]"
        >
          <p className="font-plus-jakarta text-sm font-medium leading-tight text-white/90 md:text-base">
            {benefit}
          </p>
        </motion.div>
      ))}
    </div>
  )
}

export default function MccContent({ mccOpen }: { mccOpen: boolean }) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden text-white" style={{ backgroundColor: '#011f33' }}>
      <Header navItems={NAV_ITEMS} assets={{ summitLogo: ASSETS.heroLogo, sxcLogo: ASSETS.sxcLogo }} />

      <section className="relative overflow-hidden">
        <Decorations assets={HERO_DECORATIONS} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(53,130,162,0.12),transparent_18%),linear-gradient(180deg,rgba(1,31,51,0.03)_0%,rgba(1,31,51,0.06)_26%,rgba(1,31,51,0.1)_58%,rgba(1,31,51,0.16)_100%)]" />

        <div className="relative z-10 px-4 pb-20 pt-32 text-center sm:px-6 md:px-20 md:pt-40">
          <motion.h1
            {...fadeUp(0)}
            className="mx-auto max-w-[10ch] bg-clip-text font-plus-jakarta text-5xl font-bold leading-[0.95] text-transparent sm:text-6xl md:text-[4.7rem]"
            style={{ backgroundImage: 'linear-gradient(80deg, #4f9e9f 1%, #79d9d2 50%, #5fb4af 88%)' }}
          >
            Mini Case<br />Competition
          </motion.h1>

          <motion.p
            {...fadeUp(0.15)}
            className="mx-auto mt-8 max-w-4xl font-poppins text-[1rem] leading-relaxed text-white/90 md:text-[1.08rem]"
          >
            A business challenge where participants are given a realistic business problem to be solved
            and are required to prepare a pitch deck within a limited time. This competition is open to
            both high school and undergraduate students from all schools / universities across Indonesia
          </motion.p>

          <motion.div {...fadeUp(0.28)} className="mt-9 flex flex-wrap items-center justify-center gap-4">
            {mccOpen ? (
              <Link
                href="/competition/mcc/register"
                className="rounded-full px-8 py-3 font-plus-jakarta text-lg font-bold text-black shadow-md"
                style={{ backgroundImage: GRADIENTS.pillLight }}
              >
                Register
              </Link>
            ) : (
              <span className="rounded-full bg-white/12 px-8 py-3 font-plus-jakarta text-lg font-semibold text-white/50">
                Registration Closed
              </span>
            )}
            <a
              href="#"
              className="rounded-full border border-accent-teal/45 px-8 py-3 font-plus-jakarta text-lg font-semibold text-accent-teal transition hover:bg-accent-teal/10"
            >
              Guidebook
            </a>
          </motion.div>
        </div>

        <div className="relative px-4 py-16 text-center sm:px-6 md:px-20">
          <motion.p
            {...revealUp(0)}
            className="font-plus-jakarta text-lg font-semibold tracking-[0.16em] text-white md:text-xl"
          >
            This Year&apos;s Theme :
          </motion.p>
          <motion.p
            {...revealUp(0.12)}
            className="mx-auto mt-8 max-w-5xl bg-clip-text font-plus-jakarta text-[2rem] font-bold italic leading-tight text-transparent sm:text-[2.35rem] md:text-[3.15rem]"
            style={{ backgroundImage: 'linear-gradient(98deg, #57aaa5 0%, #98f8ee 53%, #50bbb6 100%)' }}
          >
            &ldquo;Advancing Impact-Driven Business Innovation for Resilience and Inclusive
            Prosperity&rdquo;
          </motion.p>
        </div>

        <div className="relative px-4 pb-20 pt-8 text-center sm:px-6 md:px-20">
          <motion.p {...revealUp(0)} className="font-plus-jakarta text-xl font-semibold text-white md:text-2xl">
            Total Competition Prize Up To
          </motion.p>
          <motion.p
            {...revealUp(0.12)}
            className="mt-4 bg-clip-text font-plus-jakarta text-5xl font-extrabold leading-none text-transparent sm:text-6xl md:text-[5.4rem]"
            style={{ backgroundImage: 'linear-gradient(93deg, #57aaa5 19%, #92fbf3 50%, #57aaa5 89%)' }}
          >
            IDR 6.000.000++
          </motion.p>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <Decorations assets={LOWER_DECORATIONS} />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(1,31,51,0.01)_0%,rgba(1,31,51,0.05)_24%,rgba(1,31,51,0.1)_100%)]" />

        <div className="relative px-4 py-12 sm:px-6 md:px-20">
          <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[180px_minmax(0,1fr)] md:gap-16">
            <motion.div {...revealUp()}>
              <h2 className="font-plus-jakarta text-3xl font-extrabold text-white md:text-4xl">Timeline</h2>
            </motion.div>

            <div className="relative max-w-md">
              {TIMELINE.map((item, index) => (
                <motion.div
                  key={item.event}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.5, ease: EASE, delay: index * 0.06 }}
                  className="relative mb-6 pl-12 last:mb-0"
                >
                  <span className="absolute left-4 top-[0.42rem] block h-3 w-3 -translate-x-1/2 rotate-45 bg-[#6bd5d2]" />
                  {index < TIMELINE.length - 1 && (
                    <span
                      className="absolute left-4 block w-px bg-accent-teal/55"
                      style={{ top: 'calc(0.42rem + 0.375rem)', height: 'calc(100% + 1.5rem)' }}
                    />
                  )}
                  <p className={`font-plus-jakarta text-[1.05rem] leading-[1.2] text-white break-words ${item.highlight ? 'font-bold' : 'font-semibold'}`}>
                    {item.event}
                  </p>
                  <p className="mt-1 font-poppins text-[0.98rem] leading-none text-white/65">{item.date}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative px-4 py-12 sm:px-6 md:px-20">
          <motion.h2 {...revealUp()} className="mb-8 text-center font-plus-jakarta text-3xl font-extrabold text-white md:text-4xl">
            Registration Fee
          </motion.h2>
          <motion.div
            {...revealUp(0.1)}
            className="mx-auto max-w-2xl rounded-2xl border border-white/10 p-8"
            style={{ background: cardBg }}
          >
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <p className="font-plus-jakarta text-lg font-medium text-white/70">Early Bird</p>
                <p className="mt-1 font-plus-jakarta text-2xl font-bold text-white md:text-3xl">IDR 40.000,00</p>
              </div>
              <div>
                <p className="font-plus-jakarta text-lg font-medium text-white/70">Normal</p>
                <p className="mt-1 font-plus-jakarta text-2xl font-bold text-white md:text-3xl">IDR 65.000,00</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative px-4 pb-24 pt-12 text-center sm:px-6 md:px-20">
          <motion.h2
            {...revealUp()}
            className="mb-16 bg-clip-text font-plus-jakarta text-3xl font-extrabold text-transparent md:text-4xl"
            style={{ backgroundImage: 'linear-gradient(95deg, #57aaa5 0%, #98f8ee 53%, #50bbb6 100%)' }}
          >
            What will you get?
          </motion.h2>
          <MccBenefitsGrid />
        </div>
      </section>

      <section className="relative overflow-hidden">
        <Decorations assets={CTA_DECORATIONS} />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(1,31,51,0.04)_0%,rgba(5,45,68,0.34)_28%,rgba(29,93,101,0.62)_72%,rgba(73,153,146,0.58)_100%)]" />
        <div className="relative px-4 pb-14 pt-10 text-center sm:px-6 md:px-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 24 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mx-auto max-w-5xl px-6 py-10 sm:px-10 md:py-12"
          >
            <h2
              className="mx-auto max-w-4xl bg-clip-text font-plus-jakarta text-[1.65rem] font-extrabold leading-tight text-transparent sm:text-3xl md:text-[2.05rem]"
              style={{ backgroundImage: 'linear-gradient(96deg, #57aaa5 0%, #98f8ee 53%, #50bbb6 100%)' }}
            >
              Looking for a fast-paced business challenge that fits your schedule?
            </h2>
            <p className="mx-auto mt-4 max-w-4xl font-plus-jakarta text-sm leading-relaxed text-[#d0faf5] md:text-[0.95rem]">
              MCC StudentsxCEOs 15th Grand Summit is your chance to showcase your analytical
              thinking and creativity all through one powerful pitch deck. Whether you&apos;re a solo
              strategist or a dynamic team, this is your stage. Register now and take the first step
              toward becoming a future business leader!
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-9">
              {mccOpen ? (
                <Link
                  href="/competition/mcc/register"
                  className="rounded-full px-7 py-3 font-plus-jakarta text-base font-bold text-black shadow-md"
                  style={{ backgroundImage: GRADIENTS.pillLight }}
                >
                  Register Here
                </Link>
              ) : (
                <span className="rounded-full bg-[#26485e] px-7 py-3 font-plus-jakarta text-base font-semibold text-white/45">
                Registration Closed
              </span>
            )}
              <a
                href="#"
                className="rounded-full px-7 py-3 font-plus-jakarta text-base font-bold text-black shadow-md"
                style={{ backgroundImage: GRADIENTS.pillLight }}
              >
                Guidebook
              </a>
            </div>
          </motion.div>
        </div>

        <div className="relative overflow-hidden px-4 pb-10 pt-2 sm:px-6 md:px-20">
          <Decorations assets={CONTACT_DECORATIONS} />
          <motion.h2 {...revealUp()} className="mb-5 text-center font-plus-jakarta text-lg font-medium text-white/90">
            Contact Person
          </motion.h2>
          <div className="mx-auto grid max-w-xl gap-4 md:grid-cols-2">
            {CONTACT.map((contact, index) => (
              <motion.div
                key={contact.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, ease: EASE, delay: index * 0.1 }}
                className="rounded-2xl border border-white/10 bg-[rgba(9,46,67,0.56)] p-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
              >
                <p className="font-plus-jakarta text-base font-semibold text-white">{contact.name}</p>
                <p className="mt-2 font-plus-jakarta text-xs text-white/65">ID LINE: {contact.line}</p>
                <p className="font-plus-jakarta text-xs text-white/65">Phone: {contact.phone}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-white/8">
        <Footer navItems={NAV_ITEMS} assets={{ summitLogo: ASSETS.heroLogo, sxcLogo: ASSETS.sxcLogo, instagram: ASSETS.instagram }} />
      </div>
    </div>
  )
}
