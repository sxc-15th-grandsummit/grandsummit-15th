import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { NAV_ITEMS, ASSETS, GRADIENTS } from '@/constants'
import AssetImage from '@/app/_components/asset-image'
import BenefitsGrid from './benefits-grid'
import SubEventsCarousel from './sub-events-carousel'

async function getBccOpen() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'bcc_registration_open')
    .single()
  return data?.value === 'true'
}

const STAGES = [
  {
    title: 'Preliminary Stage',
    body: 'Participants are required to submit an essay as the initial output of the competition, which should concisely present the team\'s understanding of the given case, including the key problems identified and the proposed solution approach. The essay serves as an initial screening tool to assess the relevance, clarity, and coherence of the participants\' ideas.',
  },
  {
    title: 'Semifinal Stage',
    body: 'Participants are required to develop and submit a Proposal that provides a more detailed and structured explanation of the identified problems and the proposed solutions. This stage emphasizes deeper analysis, strategic justification, and feasibility considerations based on the given case.',
  },
  {
    title: 'Final Stage',
    body: 'Finalist teams will present their business solutions to the judges, followed by a Q&A session. This stage evaluates idea clarity, strategic depth, solution feasibility, and the team\'s ability to communicate and defend their ideas. This stage will be held on-site at Bandung.',
  },
]

const TIMELINE = [
  { event: 'Open Registration',          date: '11 April – 28 April' },
  { event: 'Case Release 1',             date: '29 April' },
  { event: 'Essay Submission',           date: '30 April – 14 May' },
  { event: 'Preliminary Assessment',     date: '15 – 27 May' },
  { event: 'Announcement Semifinalist',  date: '29 May' },
  { event: 'Case Release 2',             date: '30 May' },
  { event: 'Proposal Submission',        date: '31 May – 15 June' },
  { event: 'Coaching Session',           date: '6 June' },
  { event: 'Semifinal Assessment',       date: '16 – 26 June' },
  { event: 'Finalist Announcement',      date: '28 June' },
  { event: 'Pitch Deck Submission',      date: '29 June – 15 July' },
  { event: '1-on-1 Mentoring',           date: '8 July' },
  { event: 'Technical Meeting',          date: '13 July' },
  { event: 'Final Pitching',             date: '17 July' },
  { event: 'The Summit',                 date: '18 July' },
]

const SUB_EVENTS = [
  {
    title: 'Bootcamp',
    body: 'An intensive preparatory session designed to equip participants with a fundamental understanding of business case solving and effective pitching strategies before entering the semifinal and final stages. Exclusively for registered participants, conducted in four sessions.',
  },
  {
    title: 'Coaching Session',
    body: 'An online session exclusive for semifinalists. Participants will gain practical insights from industry professionals to help them solve the case using a structured approach and develop strong, implementable solutions.',
  },
  {
    title: '1-on-1 Mentoring',
    body: 'Each finalist team will receive one 1-on-1 mentoring session with a professional mentor. This session provides personalized feedback including solution evaluation, strategy refinement, and tips to improve pitch deck and pitching performance.',
  },
  {
    title: 'Company Visit',
    body: 'An experiential pre-event program designed to connect participants with real industry practices. It bridges theoretical case solving with practical business implementation. This program is exclusively for finalists.',
  },
  {
    title: 'The Summit',
    body: 'The flagship culminating event of the program, designed to celebrate the achievements of the competition awardees. A formal platform to honor winners while providing professional insights through seminars led by prominent business figures.',
  },
]

const BENEFITS = [
  {
    label: 'Real-World Business Experience',
    description:
      'Tackle a genuine business case from a leading industry collaborator, simulating the challenges faced by professionals in the field.',
  },
  {
    label: 'Industry Insights',
    description:
      'Receive direct exposure to industry knowledge through coaching sessions led by seasoned professionals.',
  },
  {
    label: 'Personalized Mentoring',
    description:
      'Finalists enjoy exclusive 1-on-1 mentoring sessions with expert mentors, receiving actionable feedback tailored to their team’s needs.',
  },
  {
    label: 'Professional Network Expansion',
    description:
      'Connect with like-minded peers, industry professionals, mentors, and corporate leaders throughout the competition journey.',
  },
  {
    label: 'Skill Development',
    description:
      'Sharpen critical thinking, strategic analysis, problem-solving, teamwork, and public speaking skills through progressive competition stages.',
  },
  {
    label: 'Prestigious Recognition',
    description:
      'Compete at the national level, earn certificates, and stand a chance to win attractive prizes.',
  },
  {
    label: 'The Summit Experience',
    description:
      'Finalists will be part of an exclusive on-site event in Bandung featuring pitching day, networking, and more.',
  },
] as const

const CONTACT = [
  { name: 'Chintya Erika',  line: 'chintyaerikaa',  phone: '088239469413' },
  { name: 'Sabrina Naila',  line: 'theboyz',         phone: '085780274379' },
]

const cardBg = 'linear-gradient(180deg, rgba(6,50,80,0.25) 0%, rgba(87,174,165,0.25) 100%)'

const HERO_DECORATIONS = [
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

const LOWER_DECORATIONS = [
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

const CTA_DECORATIONS = [
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

const CONTACT_DECORATIONS = [
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

export default async function BccPage() {
  const bccOpen = await getBccOpen()
  const guidebookUrl = 'https://bit.ly/GuidebookBCCGS15'
  const registrationKitUrl = 'https://bit.ly/RegistrationKitBCCGS15'

  const renderDecorations = (
    assets: ReadonlyArray<{
      src: string
      width: number
      height: number
      className: string
      sizes?: string
      priority?: boolean
      quality?: number
      unoptimized?: boolean
    }>
  ) => (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {assets.map((asset) => (
        <AssetImage
          key={`${asset.src}-${asset.className}`}
          alt=""
          className={asset.className}
          height={asset.height}
          priority={asset.priority}
          quality={asset.quality}
          sizes={asset.sizes}
          src={asset.src}
          unoptimized={asset.unoptimized}
          width={asset.width}
        />
      ))}
    </div>
  )

  return (
    <div className="min-h-screen w-full overflow-x-hidden text-white" style={{ backgroundColor: '#011f33' }}>
      <Header
        navItems={NAV_ITEMS}
        assets={{ summitLogo: ASSETS.heroLogo, sxcLogo: ASSETS.sxcLogo }}
      />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {HERO_DECORATIONS.map((asset) => (
            <AssetImage
              key={`${asset.src}-${asset.className}`}
              alt=""
              className={asset.className}
              height={asset.height}
              priority={'priority' in asset ? asset.priority : undefined}
              quality={'quality' in asset ? asset.quality : undefined}
              sizes={asset.sizes}
              src={asset.src}
              unoptimized={'unoptimized' in asset ? asset.unoptimized : undefined}
              width={asset.width}
            />
          ))}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(53,130,162,0.12),transparent_18%),linear-gradient(180deg,rgba(1,31,51,0.03)_0%,rgba(1,31,51,0.06)_26%,rgba(1,31,51,0.1)_58%,rgba(1,31,51,0.16)_100%)]" />
        </div>

        <section className="relative z-10 px-4 pb-24 pt-32 text-center sm:px-6 md:px-20 md:pt-40">
          <div className="mx-auto max-w-5xl">
            <h1
              className="mx-auto max-w-[10ch] bg-clip-text font-plus-jakarta text-5xl font-bold leading-[0.95] text-transparent sm:text-6xl md:text-[4.7rem]"
              style={{ backgroundImage: 'linear-gradient(80deg, #4f9e9f 1%, #79d9d2 50%, #5fb4af 88%)' }}
            >
              Business Case
              <br />
              Competition
            </h1>

            <p className="mx-auto mt-8 max-w-4xl font-poppins text-[1rem] leading-relaxed text-white/90 md:text-[1.08rem]">
              A business challenge where participants are given a realistic business problem to be
              solved within a limited time, then presents the solution in front of the panelists.
              This competition is open to undergraduate and diploma students from all universities
              across Indonesia.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              {bccOpen ? (
                <Link
                  href="/competition/bcc/register"
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
                href={guidebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-accent-teal/45 px-8 py-3 font-plus-jakarta text-lg font-semibold text-accent-teal transition hover:bg-accent-teal/10"
              >
                Guidebook
              </a>
              <a
                href={registrationKitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-accent-teal/45 px-8 py-3 font-plus-jakarta text-lg font-semibold text-accent-teal transition hover:bg-accent-teal/10"
              >
                Registration Kit
              </a>
            </div>
          </div>
        </section>

        {/* ── Theme ────────────────────────────────────────────────── */}
        <section className="relative px-4 py-16 text-center sm:px-6 md:px-20">
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
        </section>

        {/* ── Prize ────────────────────────────────────────────────── */}
        <section className="relative px-4 pb-20 pt-10 text-center sm:px-6 md:px-20">
          <p className="font-plus-jakarta text-xl font-semibold text-white md:text-2xl">
            Total Competition Prize Up To
          </p>
          <p
            className="mt-4 bg-clip-text font-plus-jakarta text-5xl font-extrabold leading-none text-transparent sm:text-6xl md:text-[5.4rem]"
            style={{ backgroundImage: 'linear-gradient(93deg, #57aaa5 19%, #92fbf3 50%, #57aaa5 89%)' }}
          >
            IDR 24.000.000++
          </p>
        </section>
      </section>

      {/* ── BCC Stages ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 py-12 sm:px-6 md:px-20">
        {renderDecorations([
          {
            src: '/bcc/Ellipse 20.png',
            width: 378,
            height: 536,
            className: 'absolute -left-10 top-10 hidden w-16 opacity-14 md:block lg:left-0 lg:w-24',
            sizes: '(min-width: 1024px) 96px, 64px',
          },
          {
            src: '/bcc/Group 142.png',
            width: 226,
            height: 364,
            className: 'absolute right-2 bottom-6 hidden w-10 opacity-18 md:block lg:right-8 lg:w-14',
            sizes: '(min-width: 1024px) 56px, 40px',
          },
        ])}
        <h2 className="mb-8 text-center font-plus-jakarta text-3xl font-extrabold text-white md:text-4xl">
          BCC Stages
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {STAGES.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-white/10 p-6 shadow-[inset_0_1px_0_rgba(242,242,242,0.12)]"
              style={{ background: cardBg }}
            >
              <h3 className="mb-3 font-plus-jakarta text-lg font-semibold text-white">{s.title}</h3>
              <p className="font-poppins text-sm leading-relaxed text-white/75 text-justify">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden">
        {renderDecorations(LOWER_DECORATIONS)}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(1,31,51,0.01)_0%,rgba(1,31,51,0.05)_24%,rgba(1,31,51,0.1)_100%)]" />
        {/* ── Timeline ─────────────────────────────────────────────── */}
        <section className="relative px-4 py-12 sm:px-6 md:px-20">
          <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[180px_minmax(0,1fr)] md:gap-16">
            <div>
              <h2 className="font-plus-jakarta text-3xl font-extrabold text-white md:text-4xl">
                Timeline
              </h2>
            </div>

            <div className="relative max-w-md">
              <span className="absolute bottom-0 left-4 top-1 block w-px bg-accent-teal/55" />
              {TIMELINE.map((t, i) => (
                <div key={i} className="relative mb-6 pl-12 last:mb-0">
                  <span className="absolute left-4 top-[0.42rem] block h-3 w-3 -translate-x-1/2 rotate-45 bg-[#6bd5d2]" />
                  <p className="font-plus-jakarta text-[1.05rem] font-semibold leading-[1.2] text-white">
                    {t.event}
                  </p>
                  <p className="mt-1 font-poppins text-[0.98rem] leading-none text-white/65">
                    {t.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Registration Fee ─────────────────────────────────────── */}
        <section className="relative px-4 py-12 sm:px-6 md:px-20">
          <h2 className="mb-8 text-center font-plus-jakarta text-3xl font-extrabold text-white md:text-4xl">
            Registration Fee
          </h2>
          <div
            className="mx-auto max-w-2xl rounded-2xl border border-white/10 p-8"
            style={{ background: cardBg }}
          >
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <p className="font-plus-jakarta text-lg font-medium text-white/70">Early Bird</p>
                <p className="mt-1 font-plus-jakarta text-2xl font-bold text-white md:text-3xl">IDR 100.000,00</p>
              </div>
              <div>
                <p className="font-plus-jakarta text-lg font-medium text-white/70">Normal</p>
                <p className="mt-1 font-plus-jakarta text-2xl font-bold text-white md:text-3xl">IDR 135.000,00</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Sub Events ───────────────────────────────────────────── */}
        <section className="relative px-4 py-12 sm:px-6 md:px-20">
          <h2 className="mb-8 text-center font-plus-jakarta text-3xl font-extrabold text-white md:text-4xl">
            Sub Events
          </h2>
          <SubEventsCarousel events={SUB_EVENTS} cardBg={cardBg} />
        </section>

        {/* ── What will you get? ───────────────────────────────────── */}
        <section className="relative px-4 pb-8 pt-12 text-center sm:px-6 md:px-20">
          <h2
            className="mb-6 bg-clip-text font-plus-jakarta text-3xl font-extrabold text-transparent md:text-4xl"
            style={{ backgroundImage: 'linear-gradient(95deg, #57aaa5 0%, #98f8ee 53%, #50bbb6 100%)' }}
          >
            What will you get?
          </h2>
          <BenefitsGrid items={BENEFITS} />
        </section>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {renderDecorations(CTA_DECORATIONS)}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,48,67,0.12)_0%,rgba(61,128,125,0.24)_100%)]" />
        <section className="relative px-4 pb-12 pt-10 text-center sm:px-6 md:px-20">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(26,86,104,0.62)_0%,rgba(54,123,120,0.62)_100%)] px-6 py-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:px-10 md:py-12">
            <h2
              className="mx-auto max-w-3xl bg-clip-text font-plus-jakarta text-3xl font-extrabold text-transparent sm:text-4xl"
              style={{ backgroundImage: 'linear-gradient(96deg, #57aaa5 0%, #98f8ee 53%, #50bbb6 100%)' }}
            >
              Are you ready to turn business challenges into breakthrough solutions?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-plus-jakarta text-sm text-[#d0faf5] md:text-base">
              Join StudentsxCEOs 15th Grand Summit Business Case Competition and prove that you
              have what it takes to lead the future of impact-driven innovation!
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {bccOpen ? (
                <Link
                  href="/competition/bcc/register"
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
                href={guidebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-7 py-3 font-plus-jakarta text-base font-bold text-black shadow-md"
                style={{ backgroundImage: GRADIENTS.pillLight }}
              >
                Guidebook
              </a>
              <a
                href={registrationKitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-7 py-3 font-plus-jakarta text-base font-bold text-black shadow-md"
                style={{ backgroundImage: GRADIENTS.pillLight }}
              >
                Registration Kit
              </a>
            </div>
          </div>
        </section>

        {/* ── Contact Person ───────────────────────────────────────── */}
        <section className="relative overflow-hidden px-4 pb-10 pt-2 sm:px-6 md:px-20">
          {renderDecorations(CONTACT_DECORATIONS)}
          <h2 className="mb-5 text-center font-plus-jakarta text-lg font-medium text-white/90">
            Contact Person
          </h2>
          <div className="mx-auto grid max-w-xl gap-4 md:grid-cols-2">
            {CONTACT.map((c) => (
              <div
                key={c.name}
                className="rounded-2xl border border-white/10 bg-[rgba(9,46,67,0.56)] p-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
              >
                <p className="font-plus-jakarta text-base font-semibold text-white">{c.name}</p>
                <p className="mt-2 font-plus-jakarta text-xs text-white/65">ID LINE: {c.line}</p>
                <p className="font-plus-jakarta text-xs text-white/65">Phone: {c.phone}</p>
              </div>
            ))}
          </div>
        </section>
      </section>

      <div className="border-t border-white/8">
        <Footer
          navItems={NAV_ITEMS}
          assets={{ summitLogo: ASSETS.heroLogo, sxcLogo: ASSETS.sxcLogo, instagram: ASSETS.instagram }}
        />
      </div>
    </div>
  )
}
