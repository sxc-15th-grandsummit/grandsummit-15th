import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { ASSETS, GRADIENTS, NAV_ITEMS } from '@/constants'
import AssetImage from '@/app/_components/asset-image'
import BenefitsGrid from '@/app/competition/bcc/benefits-grid'
import { MccMotion } from './mcc-motion'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mini Case Competition',
  description:
    'SXC Grand Summit 15th Mini Case Competition (MCC) — a fast-paced pitch deck challenge for undergraduate students across Indonesia.',
  openGraph: {
    title: 'Mini Case Competition | SXC Grand Summit 15th',
    description:
      'Solve a realistic business case through one pitch deck. Open to undergraduate students across Indonesia.',
  },
}

const guidebookUrl = process.env.MCC_GUIDEBOOK_URL ?? 'https://bit.ly/GuidebookMCCGS15'
const EXTENDED_REGISTRATION_VISIBLE_AT = new Date('2026-06-17T17:00:00.000Z') // 18 June 2026 00:00 WIB

const TIMELINE = [
  { event: 'Open Registration Early Bird', date: '1-5 June' },
  { event: 'Open Registration Normal', date: '6-17 June' },
  { event: 'Open Registration Extended', date: '18-22 June' },
  { event: 'Case Release', date: '24 June' },
  { event: 'Pitch Deck Submission', date: '24 June - 1 July' },
  { event: 'Assessment by Judge', date: '2-16 July' },
  { event: 'Announcement Finalist', date: '17 July' },
  { event: 'The Summit', date: '25 July', highlight: true },
]

function getVisibleTimeline(now = new Date()) {
  return TIMELINE.filter(item => (
    item.event !== 'Open Registration Extended' || now >= EXTENDED_REGISTRATION_VISIBLE_AT
  ))
}

const BENEFITS = [
  {
    label: 'Real-World Case Experience',
    description: 'Work through a realistic business problem and turn your analysis into a focused pitch deck.',
  },
  {
    label: 'Pitch Deck Mastery',
    description: 'Practice structuring ideas, evidence, and recommendations into a concise business presentation.',
  },
  {
    label: 'National-Level Competition Exposure',
    description: 'Compete with undergraduate students from universities across Indonesia.',
  },
  {
    label: 'Professional Network',
    description: 'Connect with other ambitious participants and StudentsxCEOs Grand Summit stakeholders.',
  },
  {
    label: 'The Summit Experience',
    description: 'Finalists join the culminating Grand Summit experience in Bandung.',
  },
  {
    label: 'Certificates & Prizes',
    description: 'Earn recognition and compete for a total prize pool of IDR 6.000.000++.',
  },
] as const

const CONTACT = [
  { name: 'Athar Falah', line: 'atharwimara', phone: '087877991788' },
  { name: 'Syafa Nurfadilah', line: 'syafn2', phone: '082120090892' },
]

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

function Decorations({ assets }: { assets: readonly Decoration[] }) {
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

async function getMccOpen() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'mcc_registration_open')
    .single()
  return data?.value === 'true'
}

export default async function MccPage() {
  const mccOpen = await getMccOpen()
  const timeline = getVisibleTimeline()

  return (
    <div className="min-h-screen w-full overflow-x-hidden text-white" style={{ backgroundColor: '#011f33' }}>
      <Header navItems={NAV_ITEMS} assets={{ summitLogo: ASSETS.heroLogo, sxcLogo: ASSETS.sxcLogo }} />

      <section className="relative overflow-hidden">
        <Decorations
          assets={[
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
            { src: '/bcc/Ellipse 30.png', width: 391, height: 398, className: 'absolute -left-14 top-4 hidden w-36 opacity-24 md:block lg:-left-10 lg:top-0 lg:w-56 xl:-left-6 xl:w-64', sizes: '(min-width: 1024px) 256px, 160px' },
            { src: '/bcc/Ellipse 26.png', width: 426, height: 729, className: 'absolute -right-20 bottom-[-6rem] hidden w-52 opacity-22 md:block lg:-right-14 lg:bottom-[-9rem] lg:w-[20rem] xl:-right-8 xl:w-[23rem]', sizes: '(min-width: 1024px) 416px, 256px' },
          ]}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(53,130,162,0.16),transparent_21%),linear-gradient(180deg,rgba(1,31,51,0.02)_0%,rgba(1,31,51,0.1)_100%)]" />

        <MccMotion className="relative z-10 px-4 pb-16 pt-32 text-center sm:px-6 md:px-20 md:pt-40">
          <h1
            className="mx-auto max-w-[11ch] bg-clip-text font-plus-jakarta text-5xl font-bold leading-[0.98] text-transparent sm:text-6xl md:text-[4.7rem]"
            style={{ backgroundImage: 'linear-gradient(80deg, #4f9e9f 1%, #79d9d2 50%, #5fb4af 88%)' }}
          >
            Mini Case Competition
          </h1>
          <p className="mx-auto mt-8 max-w-4xl font-poppins text-[1rem] leading-relaxed text-white/90 md:text-[1.08rem]">
            A business challenge where participants are given a realistic business problem to be
            solved and are required to prepare a pitch deck within a limited time. This competition
            is open to undergraduate students from universities across Indonesia.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
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
            {guidebookUrl !== '#' && (
              <a
                href={guidebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-accent-teal/45 px-8 py-3 font-plus-jakarta text-lg font-semibold text-accent-teal transition hover:bg-accent-teal/10"
              >
                Guidebook
              </a>
            )}
          </div>
        </MccMotion>

        <MccMotion className="relative px-4 py-14 text-center sm:px-6 md:px-20" delay={0.1}>
          <p className="font-plus-jakarta text-lg font-semibold tracking-[0.16em] text-white md:text-xl">
            This Year&apos;s Theme :
          </p>
          <p
            className="mx-auto mt-8 max-w-5xl bg-clip-text font-plus-jakarta text-[2rem] font-bold italic leading-tight text-transparent sm:text-[2.35rem] md:text-[3.15rem]"
            style={{ backgroundImage: 'linear-gradient(98deg, #57aaa5 0%, #98f8ee 53%, #50bbb6 100%)' }}
          >
            &ldquo;Advancing Impact-Driven Business Innovation for Resilience and Inclusive
            Prosperity&rdquo;
          </p>
        </MccMotion>

        <MccMotion className="relative px-4 pb-16 pt-8 text-center sm:px-6 md:px-20" delay={0.1}>
          <p className="font-plus-jakarta text-xl font-semibold text-white md:text-2xl">
            Total Competition Prize Up To
          </p>
          <p
            className="mt-4 bg-clip-text font-plus-jakarta text-5xl font-extrabold leading-none text-transparent sm:text-6xl md:text-[5.4rem]"
            style={{ backgroundImage: 'linear-gradient(93deg, #57aaa5 19%, #92fbf3 50%, #57aaa5 89%)' }}
          >
            IDR 14.000.000++
          </p>
        </MccMotion>
      </section>

      <section className="relative overflow-hidden">
        <Decorations
          assets={[
            { src: '/bcc/Ellipse(2).png', width: 499, height: 938, className: 'absolute -left-16 top-32 hidden w-20 opacity-16 md:block lg:left-2 lg:w-28', sizes: '(min-width: 1024px) 112px, 80px' },
            { src: '/bcc/Ellipse(1).png', width: 838, height: 1432, className: 'absolute -right-24 top-[18rem] hidden w-40 opacity-12 md:block lg:right-[-2rem] lg:w-64', sizes: '(min-width: 1024px) 256px, 160px' },
          ]}
        />
        <div className="relative px-4 py-12 sm:px-6 md:px-20">
          <MccMotion className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[220px_minmax(0,1fr)] md:gap-16">
            <h2 className="font-plus-jakarta text-3xl font-extrabold text-white md:text-4xl">Timeline</h2>
            <div className="relative max-w-lg">
              {timeline.map((item, index) => (
                <MccMotion key={item.event} className="relative mb-7 pl-12 last:mb-0" delay={index * 0.06}>
                  <span className="absolute left-4 top-[0.42rem] block h-3 w-3 -translate-x-1/2 rotate-45 bg-[#6bd5d2]" />
                  {index < timeline.length - 1 && (
                    <span
                      className="absolute left-4 block w-px bg-accent-teal/55"
                      style={{ top: 'calc(0.42rem + 0.375rem)', height: 'calc(100% + 1.75rem)' }}
                    />
                  )}
                  <p className={`font-plus-jakarta text-[1.05rem] leading-[1.2] text-white break-words ${item.highlight ? 'font-bold' : 'font-semibold'}`}>
                    {item.event}
                  </p>
                  <p className="mt-1 font-poppins text-[0.98rem] leading-none text-white/65">{item.date}</p>
                </MccMotion>
              ))}
            </div>
          </MccMotion>
        </div>

        <div className="relative px-4 py-12 sm:px-6 md:px-20">
          <MccMotion>
            <h2 className="mb-8 text-center font-plus-jakarta text-3xl font-extrabold text-white md:text-4xl">
              Registration Fee
            </h2>
          </MccMotion>
          <MccMotion className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(6,50,80,0.25)_0%,rgba(87,174,165,0.25)_100%)] px-5 py-8 sm:px-8" delay={0.1}>
            <div className="grid gap-6 text-center sm:grid-cols-2">
              <div>
                <p className="font-plus-jakarta text-lg font-medium text-white/70">Early Bird</p>
                <p className="mt-1 font-plus-jakarta text-3xl font-bold leading-tight text-white">IDR 40.000,00</p>
              </div>
              <div>
                <p className="font-plus-jakarta text-lg font-medium text-white/70">Normal</p>
                <p className="mt-1 font-plus-jakarta text-3xl font-bold leading-tight text-white">IDR 65.000,00</p>
              </div>
            </div>
          </MccMotion>
        </div>

        <div className="relative px-4 pb-16 pt-12 text-center sm:px-6 md:px-20">
          <MccMotion>
            <h2
              className="mb-8 bg-clip-text font-plus-jakarta text-3xl font-extrabold text-transparent md:text-4xl"
              style={{ backgroundImage: 'linear-gradient(95deg, #57aaa5 0%, #98f8ee 53%, #50bbb6 100%)' }}
            >
              What will you get?
            </h2>
          </MccMotion>
          <MccMotion delay={0.1}>
            <BenefitsGrid items={BENEFITS} />
          </MccMotion>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <Decorations
          assets={[
            { src: '/bcc/Ellipse 31.png', width: 173, height: 302, className: 'absolute left-4 top-8 hidden w-14 opacity-16 md:block lg:left-10 lg:w-20', sizes: '(min-width: 1024px) 80px, 56px' },
            { src: '/bcc/Ellipse 20.png', width: 378, height: 536, className: 'absolute -right-8 bottom-0 hidden w-24 opacity-16 md:block lg:right-6 lg:w-36', sizes: '(min-width: 1024px) 144px, 96px' },
          ]}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,48,67,0.12)_0%,rgba(61,128,125,0.35)_100%)]" />
        <MccMotion className="relative px-4 pb-12 pt-10 text-center sm:px-6 md:px-20">
          <h2
            className="mx-auto max-w-4xl bg-clip-text font-plus-jakarta text-3xl font-extrabold text-transparent sm:text-4xl"
            style={{ backgroundImage: 'linear-gradient(96deg, #57aaa5 0%, #98f8ee 53%, #50bbb6 100%)' }}
          >
            Looking for a fast-paced business challenge that fits your schedule?
          </h2>
          <p className="mx-auto mt-4 max-w-3xl font-plus-jakarta text-sm text-[#d0faf5] md:text-base">
            MCC StudentsxCEOs 15th Grand Summit is your chance to showcase your analytical thinking
            and creativity through one powerful pitch deck. Whether you&apos;re a solo strategist or a
            dynamic team, this is your stage.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
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
            {guidebookUrl !== '#' && (
              <a
                href={guidebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-7 py-3 font-plus-jakarta text-base font-bold text-black shadow-md"
                style={{ backgroundImage: GRADIENTS.pillLight }}
              >
                Guidebook
              </a>
            )}
          </div>
        </MccMotion>

        <div className="relative overflow-hidden px-4 pb-10 pt-2 sm:px-6 md:px-20">
          <MccMotion>
            <h2 className="mb-5 text-center font-plus-jakarta text-lg font-medium text-white/90">
              Contact Person
            </h2>
          </MccMotion>
          <div className="mx-auto grid max-w-xl gap-4 md:grid-cols-2">
            {CONTACT.map((contact, index) => (
              <MccMotion
                key={contact.name}
                className="rounded-2xl border border-white/10 bg-[rgba(9,46,67,0.56)] p-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                delay={index * 0.08}
              >
                <p className="font-plus-jakarta text-base font-semibold text-white">{contact.name}</p>
                <p className="mt-2 font-plus-jakarta text-xs text-white/65">ID LINE: {contact.line}</p>
                <p className="font-plus-jakarta text-xs text-white/65">Phone: {contact.phone}</p>
              </MccMotion>
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
