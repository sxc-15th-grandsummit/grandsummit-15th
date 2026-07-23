"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ASSETS, GRADIENTS, revealUp } from "@/constants";

const EVENT_DATE = new Date("2026-07-25T08:00:00+07:00");
const FORM_URL = "https://forms.gle/CdjgbtprVdgcj39w8";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function subscribeToTime(callback: () => void) {
  const id = setInterval(callback, 1000);
  return () => clearInterval(id);
}

function useNow() {
  return useSyncExternalStore(
    subscribeToTime,
    () => Date.now(),
    () => Date.now()
  );
}

function useCountdown(target: Date) {
  const now = useNow();

  return useMemo(() => {
    const ms = Math.max(0, target.getTime() - now);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  }, [now, target]);
}

function CountdownUnit({ value, label }: { value: number | null; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-3xl font-bold tabular-nums text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-sm sm:h-20 sm:w-20 sm:text-4xl md:h-24 md:w-24 md:text-5xl">
        {value === null ? "--" : pad(value)}
      </div>
      <span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-xs">
        {label}
      </span>
    </div>
  );
}

function SectionTitle({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <div className="mb-8 text-center md:mb-12">
      <motion.h2
        {...revealUp}
        className="font-plus-jakarta text-3xl font-bold tracking-[0.04em] text-white sm:text-4xl md:text-5xl"
      >
        {children}
      </motion.h2>
      {subtitle && (
        <motion.p
          {...revealUp}
          className="mx-auto mt-3 max-w-2xl font-poppins text-sm leading-relaxed text-white/70 sm:text-base"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

function AnchorPill({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/[0.06] px-6 py-2.5 font-poppins text-sm font-semibold text-white backdrop-blur-sm transition hover:border-accent-green/50 hover:bg-white/10 hover:text-accent-green-light"
    >
      {children}
    </Link>
  );
}

function SpeakerCard({
  name,
  role,
  bio,
  imageSrc,
  imageWidth,
  imageHeight,
}: {
  name: string;
  role: string;
  bio: string;
  imageSrc: string;
  imageWidth: number;
  imageHeight: number;
}) {
  return (
    <motion.article
      {...revealUp}
      className="group relative flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm transition hover:border-white/20 hover:bg-white/[0.06] sm:p-8"
    >
      <div className="relative mx-auto mb-6 w-full max-w-[18rem] overflow-hidden rounded-[2rem] drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)] transition duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.02]">
        <Image
          src={imageSrc}
          alt={`${name}, speaker at The Summit 15th`}
          width={imageWidth}
          height={imageHeight}
          priority
          sizes="(max-width: 640px) 80vw, 18rem"
          className="h-auto w-full"
        />
      </div>

      <h3 className="font-plus-jakarta text-xl font-bold text-white sm:text-2xl">{name}</h3>
      <p className="mt-1 max-w-xs font-poppins text-sm font-medium text-accent-green-light">{role}</p>
      <p className="mt-4 max-w-xs font-poppins text-sm leading-relaxed text-white/70">{bio}</p>
    </motion.article>
  );
}

function SessionCard({
  index,
  title,
  description,
}: {
  index: number;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      {...revealUp}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_24px_60px_rgba(0,0,0,0.25)] backdrop-blur-md transition duration-500 hover:-translate-y-1.5 hover:border-silver/50 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_32px_80px_rgba(192,210,214,0.14)] sm:p-10 md:p-12"
    >
      <span className="absolute right-4 top-2 font-plus-jakarta text-6xl font-bold leading-none text-white/[0.05] transition duration-500 group-hover:text-silver/10 sm:text-7xl md:text-8xl">
        {pad(index)}
      </span>

      <div>
        <span className="relative z-10 inline-block rounded-full bg-gradient-to-r from-silver/20 to-transparent px-4 py-1.5 font-poppins text-xs font-semibold tracking-[0.1em] text-silver-light ring-1 ring-white/10 sm:text-sm">
          SESSION {pad(index)}
        </span>
        <h3 className="relative z-10 mt-6 font-plus-jakarta text-xl font-bold leading-snug text-white sm:text-2xl md:text-3xl">
          {title}
        </h3>
      </div>

      <p className="relative z-10 mt-5 max-w-md font-poppins text-base leading-relaxed text-white/70 md:text-lg">
        {description}
      </p>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-silver/[0.05] to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
    </motion.div>
  );
}

function GainCard({
  index,
  title,
  description,
  icon,
}: {
  index: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      {...revealUp}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_24px_60px_rgba(0,0,0,0.25)] backdrop-blur-md transition duration-500 hover:-translate-y-1.5 hover:border-accent-green/40 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_32px_80px_rgba(95,217,177,0.18)] sm:p-10 md:p-12"
    >
      <span className="absolute right-4 top-2 font-plus-jakarta text-6xl font-bold leading-none text-white/[0.05] transition duration-500 group-hover:text-accent-green/10 sm:text-7xl md:text-8xl">
        {pad(index)}
      </span>

      <div>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-green/25 to-accent-green/5 text-accent-green-light shadow-[0_0_40px_rgba(95,217,177,0.18)] ring-1 ring-white/10 sm:h-20 sm:w-20">
          {icon}
        </div>
        <h3 className="relative z-10 mt-7 font-plus-jakarta text-xl font-bold text-white sm:text-2xl md:text-3xl">
          {title}
        </h3>
      </div>

      <p className="relative z-10 mt-4 max-w-md font-poppins text-base leading-relaxed text-white/70 md:text-lg">
        {description}
      </p>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-accent-green/[0.06] to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
    </motion.div>
  );
}

function RisingLine() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-0 -z-10 h-full w-full -translate-x-1/2 opacity-40"
      viewBox="0 0 1440 900"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#5fd9b1" stopOpacity="0" />
          <stop offset="50%" stopColor="#8af2cc" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#c0d2d6" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <motion.path
        d="M720 900 C 720 700, 200 650, 200 450 C 200 250, 720 300, 720 100"
        stroke="url(#lineGrad)"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 2, ease: EASE }}
      />
      <motion.path
        d="M720 900 C 720 700, 1240 650, 1240 450 C 1240 250, 720 300, 720 100"
        stroke="url(#lineGrad)"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 2, delay: 0.3, ease: EASE }}
      />
    </svg>
  );
}

export default function EventsContent() {
  const countdown = useCountdown(EVENT_DATE);
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-4 pt-24 text-center md:pt-28">
        <RisingLine />

        {/* Summit logo */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative z-10 mb-6 w-24 sm:w-32 md:w-40"
        >
          <Image
            src={ASSETS.heroLogo}
            alt="Grand Summit 15th"
            width={1496}
            height={1764}
            priority
            className="h-auto w-full drop-shadow-[0_0_28px_rgba(95,217,177,0.25)]"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          className="relative z-10 max-w-4xl font-plus-jakarta text-4xl font-extrabold tracking-[0.02em] text-white sm:text-5xl md:text-6xl lg:text-7xl"
          style={{ textShadow: "0 2px 30px rgba(95,217,177,0.25)" }}
        >
          The Summit 15th
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          className="relative z-10 mt-4 max-w-2xl font-poppins text-base font-medium italic tracking-wide text-accent-green-light sm:text-lg md:text-xl"
        >
          Leading with Strategy, Powered by AI, Grounded in Ethics
        </motion.p>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          className="relative z-10 mt-10"
        >
          <p className="mb-4 font-poppins text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Event Starts In
          </p>
          <div className="flex gap-3 sm:gap-4 md:gap-6">
            <CountdownUnit value={countdown?.days ?? null} label="Days" />
            <CountdownUnit value={countdown?.hours ?? null} label="Hours" />
            <CountdownUnit value={countdown?.minutes ?? null} label="Minutes" />
            <CountdownUnit value={countdown?.seconds ?? null} label="Seconds" />
          </div>
        </motion.div>

        {/* Action anchors */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
          className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <AnchorPill href="#speakers">Speakers</AnchorPill>
          <AnchorPill href="#sessions">Session</AnchorPill>
          <AnchorPill href="#gains">What You&apos;ll Gain</AnchorPill>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
          className="relative z-10 mt-4 w-full max-w-xs sm:max-w-sm"
        >
          <a
            href={FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center rounded-full px-8 py-3.5 font-poppins text-sm font-bold text-black shadow-[0_8px_30px_rgba(138,242,204,0.35)] transition hover:scale-[1.02] hover:shadow-[0_10px_36px_rgba(138,242,204,0.45)] active:scale-[0.99]"
            style={{ backgroundImage: GRADIENTS.pillLight }}
          >
            Save Your Seat
          </a>
        </motion.div>

        {!prefersReducedMotion && (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="h-10 w-6 rounded-full border-2 border-white/20 p-1"
            >
              <div className="h-2 w-full rounded-full bg-white/50" />
            </motion.div>
          </div>
        )}
      </section>

      {/* Speakers */}
      <section id="speakers" className="px-4 py-20 sm:px-6 md:py-28 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <SectionTitle subtitle="Meet the voices who will shape our conversations on leadership, AI, and ethics.">
            Speakers
          </SectionTitle>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <SpeakerCard
              name="Kintan"
              role="Business & Product Growth Manager – Tribun Network | KG Media"
              bio="A StudentsxCEOs alumna leading product marketing for key digital platforms at Tribun Network. From Senior Business Analyst at MarkPlus to managing $300k+ growth budgets, Kintan brings firsthand insights on career transitions, cross-functional leadership, and driving growth in a disruptive era."
              imageSrc="/events/kintan.png"
              imageWidth={800}
              imageHeight={800}
            />
            <SpeakerCard
              name="Irfan"
              role="AVP Business Partnership at LinkAja"
              bio="A senior commercial leader with 15+ years scaling revenue, strategic partnerships, and business ecosystems across Fintech, Telco, and FMCG. Formerly national sales and distribution management at Nestlé Indonesia and Danone Indonesia, Irfan has managed 100+ strategic partners and multi-billion transaction portfolios. He brings deep expertise in go-to-market strategy, commercial leadership, and building scalable ecosystems."
              imageSrc="/events/irfan.png"
              imageWidth={800}
              imageHeight={800}
            />
            <SpeakerCard
              name="Laura"
              role="Corporate Venture Capital & Business Analytics Intern at HP"
              bio="A high-achieving student and dynamic professional with internships spanning HP, BCG, TikTok, Mars, and Kompas Gramedia. An alumna of StudentsxCEOs and Young Leaders for Indonesia (YLI) by McKinsey & Co., Laura brings hands-on expertise in data-driven decision-making, strategic marketing, and business analytics. She offers practical strategies on leveraging AI, building personal branding, and ethically preparing for high-impact careers."
              imageSrc="/events/laura-square.png"
              imageWidth={1068}
              imageHeight={1068}
            />
          </div>
        </div>
      </section>

      {/* Sessions */}
      <section id="sessions" className="relative overflow-hidden px-4 py-28 sm:px-6 md:py-40 lg:px-10">
        {/* Background glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[min(80vw,60rem)] w-[min(80vw,60rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-silver/[0.06] blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-silver/[0.03] to-transparent"
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-16 text-center md:mb-24">
            <motion.h2
              {...revealUp}
              className="font-plus-jakarta text-4xl font-extrabold tracking-[0.03em] text-white sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Sessions
            </motion.h2>
            <motion.p
              {...revealUp}
              className="mx-auto mt-5 max-w-3xl font-poppins text-lg leading-relaxed text-white/70 md:text-xl"
            >
              Three curated talkshow sessions built to turn ideas into actionable career strategies.
            </motion.p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            <SessionCard
              index={1}
              title="Beyond the Classroom: Navigating Growth in the Age of Disruption"
              description="Learn real strategies from cross-industry experience: navigating career transitions, leading cross-functional teams, and driving business growth. Build the mental readiness and critical skills to become a resilient, adaptive future leader in the AI era."
            />
            <SessionCard
              index={2}
              title="Surprise Session"
              description="A special session that will be revealed on the day. Save your seat and be there to find out who takes the stage next."
            />
            <SessionCard
              index={3}
              title="From Campus to Career: Leveraging AI, Strategy, and Ethics"
              description="Ready to transform from student to work-ready professional? Learn how to build a compelling portfolio, expand your network, and use AI to accelerate learning and career preparation with smart, ethical strategies."
            />
          </div>
        </div>
      </section>

      {/* What You'll Gain */}
      <section id="gains" className="relative overflow-hidden px-4 py-28 sm:px-6 md:py-40 lg:px-10">
        {/* Background glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[min(80vw,60rem)] w-[min(80vw,60rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-green/[0.08] blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-accent-green/[0.04] to-transparent"
        />

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-16 text-center md:mb-24">
            <motion.h2
              {...revealUp}
              className="font-plus-jakarta text-4xl font-extrabold tracking-[0.03em] text-white sm:text-5xl md:text-6xl lg:text-7xl"
            >
              What You&apos;ll Gain
            </motion.h2>
            <motion.p
              {...revealUp}
              className="mx-auto mt-5 max-w-3xl font-poppins text-lg leading-relaxed text-white/70 md:text-xl"
            >
              Every seat comes with benefits that last beyond the event day.
            </motion.p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
            <GainCard
              index={1}
              title="Official E-Certificate"
              description="Receive a digital certificate from The 15th StudentsxCEOs Grand Summit."
              icon={
                <svg className="h-7 w-7 sm:h-8 sm:w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                  <line x1="9" y1="11" x2="15" y2="11" />
                </svg>
              }
            />
            <GainCard
              index={2}
              title="Valuable Insights"
              description="Exclusive real-world case studies and perspectives from expert speakers."
              icon={
                <svg className="h-7 w-7 sm:h-8 sm:w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
                  <path d="M9 21h6" />
                </svg>
              }
            />
            <GainCard
              index={3}
              title="Professional Networking"
              description="Connect with a community of young talents and industry practitioners."
              icon={
                <svg className="h-7 w-7 sm:h-8 sm:w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
            />
            <GainCard
              index={4}
              title="Actionable Career Strategies"
              description="Tactics and strategic mindsets to prepare yourself as a future leader."
              icon={
                <svg className="h-7 w-7 sm:h-8 sm:w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12h5l2-7 5 14 2-7h5" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* Save Your Seat */}
      <section id="register" className="px-4 py-20 sm:px-6 md:py-28 lg:px-10">
        <motion.div
          {...revealUp}
          className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md sm:p-12 md:p-16"
        >
          <h2 className="font-plus-jakarta text-3xl font-bold tracking-[0.04em] text-white sm:text-4xl md:text-5xl">
            Save Your Seat
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-poppins text-base leading-relaxed text-white/70 sm:text-lg">
            Reserve your spot for The Summit 15th. Finalists of BCC & MCC will receive an exclusive invitation from the committee, while general participants can register directly through the link below.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4">
            <a
              href={FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full px-10 py-4 font-poppins text-base font-bold text-black shadow-[0_8px_30px_rgba(138,242,204,0.35)] transition hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(138,242,204,0.5)] active:scale-[0.99]"
              style={{ backgroundImage: GRADIENTS.pillLight }}
            >
              Register via Google Form
            </a>
            <p className="max-w-md font-poppins text-xs text-white/50">
              You&apos;ll be redirected to a Google Form. Come back anytime to explore speakers and sessions.
            </p>
          </div>
        </motion.div>
      </section>
    </>
  );
}
