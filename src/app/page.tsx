"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, type ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
};

type CategoryItem = {
  label: string;
};

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { label: "Registration", href: "#registration" },
  { label: "Competition", href: "#category" },
  { label: "Events", href: "#category" },
  { label: "Merch", href: "#category" },
];

const CATEGORY_ITEMS: ReadonlyArray<CategoryItem> = [
  { label: "Competition" },
  { label: "Events" },
  { label: "Merch" },
];

const MISSION_POINTS = [
  "To develop students critical thinking, creativity, and transparency-driven leadership through practical business exposure.",
  "To bridge students and companies by delivering educational programs, competitions, and industry engagement activities that emphasize human-centric and sustainable innovation.",
];

const ASSETS = {
  heroLogo: "/grand-summit-logo.png",
  sxcLogo: "/sxc-logo.png",
  puzzleLeft: "/puzzle-left.png",
  puzzleLeftAlt: "/puzzle-left2.png",
  puzzleRight: "/puzzle-right.png",
  instagram: "/assets/home/instagram.svg",
};

const GRADIENTS = {
  page: "url('/background.png')",
  cardPrimary: "linear-gradient(180deg,rgba(10,59,86,0.5) 22.31%,rgba(87,174,165,0.5) 135.28%)",
  cardSecondary: "linear-gradient(132.88deg,rgba(6,50,80,0.5) 10.96%,rgba(48,114,124,0.5) 97.54%)",
  cardSecondaryAlt: "linear-gradient(115.72deg,rgba(6,50,80,0.5) 14.96%,rgba(48,114,124,0.5) 95.28%)",
  footer: "linear-gradient(83.74deg,rgba(36,110,121,0.81) 17.48%,rgba(207,229,231,0.81) 99.11%)",
  pillLight: "linear-gradient(90.26deg,#8ae2d9 0%,#ffffff 60.3%)",
};

const COPY = {
  heroTagline:
    "Authentic Ascendance: Advancing Leadership through Transparency and Human-Centric Innovation",
  objective:
    "To provide a collaborative platform for Indonesian university students and industry leaders to develop transparent, innovative, human-centric solutions to real business challenges.",
  keywords:
    "Human-Centric Innovation • Authenticity in Leadership\nSustainable Value Creation • Collaboration • Transparency",
  values: "Integrity • Collaboration • Innovation",
};

const revealUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.75, ease: "easeOut" as const },
  viewport: { once: true, amount: 0.25 },
};

function cn(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(" ");
}

function AssetImage({
  alt,
  className,
  height,
  priority,
  sizes,
  src,
  width,
}: {
  alt: string;
  className?: string;
  height: number;
  priority?: boolean;
  sizes?: string;
  src: string;
  width: number;
}) {
  return (
    <Image
      unoptimized
      draggable={false}
      alt={alt}
      className={className}
      height={height}
      priority={priority}
      sizes={sizes}
      src={src}
      width={width}
    />
  );
}

function SectionContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full px-4 sm:px-6 lg:px-10 xl:px-12", className)}>
      {children}
    </div>
  );
}

function Pill({
  children,
  className,
  tone = "light",
}: {
  children: ReactNode;
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-32 items-center justify-center rounded-full px-5 py-2 font-plus-jakarta text-base font-bold md:min-w-44 md:text-[1.75rem]",
        tone === "light" ? "text-[#063250]" : "bg-[#063250] text-white",
        className,
      )}
      style={tone === "light" ? { backgroundImage: GRADIENTS.pillLight } : undefined}
    >
      {children}
    </span>
  );
}

function BrandRow({
  summitLogoClassName,
  sxcLogoClassName,
}: {
  summitLogoClassName: string;
  sxcLogoClassName: string;
}) {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <AssetImage
        src={ASSETS.heroLogo}
        alt="Grand Summit logo"
        width={1496}
        height={1764}
        sizes="120px"
        className={cn("object-contain", summitLogoClassName)}
      />
      <AssetImage
        src={ASSETS.sxcLogo}
        alt="StudentxCEO logo"
        width={640}
        height={640}
        sizes="96px"
        className={cn("object-contain", sxcLogoClassName)}
      />
    </div>
  );
}

function HeroParallaxPuzzles() {
  const prefersReducedMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMove = (event: PointerEvent) => {
      pointerX.set(event.clientX / window.innerWidth - 0.5);
      pointerY.set(event.clientY / window.innerHeight - 0.5);
    };

    const reset = () => {
      pointerX.set(0);
      pointerY.set(0);
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerleave", reset);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerleave", reset);
    };
  }, [pointerX, pointerY, prefersReducedMotion]);

  const spring = { stiffness: 95, damping: 19, mass: 0.55 };
  const leftX = useSpring(useTransform(pointerX, [-0.5, 0.5], [20, 46]), spring);
  const leftY = useSpring(useTransform(pointerY, [-0.5, 0.5], [-12, 14]), spring);
  const leftRotate = useSpring(useTransform(pointerX, [-0.5, 0.5], [-10, 6]), spring);

  const rightX = useSpring(useTransform(pointerX, [-0.5, 0.5], [-20, -46]), spring);
  const rightY = useSpring(useTransform(pointerY, [-0.5, 0.5], [12, -14]), spring);
  const rightRotate = useSpring(useTransform(pointerX, [-0.5, 0.5], [10, -6]), spring);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute left-0 top-[44%] w-20 -translate-x-1/2 -translate-y-1/2 sm:w-24 md:w-28 lg:w-36"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, delay: 0.25, ease: "easeOut" }}
        style={{
          x: prefersReducedMotion ? 0 : leftX,
          y: prefersReducedMotion ? 0 : leftY,
          rotate: prefersReducedMotion ? -4 : leftRotate,
        }}
      >
        <AssetImage
          src={ASSETS.puzzleLeft}
          alt=""
          width={408}
          height={761}
          sizes="(max-width: 1024px) 8rem, 10rem"
          className="h-auto w-full drop-shadow-[0_14px_24px_rgba(0,0,0,0.35)]"
        />
      </motion.div>

      <motion.div
        className="absolute right-0 top-[34%] w-20 translate-x-1/2 -translate-y-1/2 sm:w-24 md:w-28 lg:w-36"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, delay: 0.3, ease: "easeOut" }}
        style={{
          x: prefersReducedMotion ? 0 : rightX,
          y: prefersReducedMotion ? 0 : rightY,
          rotate: prefersReducedMotion ? 4 : rightRotate,
        }}
      >
        <AssetImage
          src={ASSETS.puzzleRight}
          alt=""
          width={452}
          height={648}
          sizes="(max-width: 1024px) 8rem, 11rem"
          className="h-auto w-full drop-shadow-[0_16px_28px_rgba(0,0,0,0.35)]"
        />
      </motion.div>
    </div>
  );
}

function HeaderNav() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <SectionContainer className="pt-4 md:pt-6">
        <nav className="flex items-center justify-between">
          <BrandRow
            summitLogoClassName="h-9 w-8 md:h-12 md:w-11"
            sxcLogoClassName="h-10 w-[4.6rem] md:h-14 md:w-[6.1rem]"
          />

          <ul className="hidden items-center gap-8 font-plus-jakarta text-xs font-light tracking-[0.22em] text-white/90 lg:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="#"
            className="rounded-full bg-[#7ea9b8] px-4 py-1 text-[11px] font-semibold text-[#063250] shadow-[0_1px_0_rgba(255,255,255,0.2)]"
          >
            Log In
          </Link>
        </nav>

        <ul className="mt-3 flex items-center justify-center gap-5 overflow-x-auto pb-1 font-plus-jakarta text-[11px] tracking-[0.19em] text-white/85 lg:hidden">
          {NAV_ITEMS.map((item) => (
            <li key={`mobile-${item.label}`} className="shrink-0">
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </SectionContainer>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative h-[100svh] w-full md:h-screen">
      <HeaderNav />
      <HeroParallaxPuzzles />

      <SectionContainer className="relative flex h-full flex-col items-center justify-center pt-20 text-center md:pt-24">
        <motion.div
          className="relative z-10 w-full max-w-3xl"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.2 }}
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <AssetImage
              src={ASSETS.heroLogo}
              alt="15th Grand Summit StudentxCEO"
              width={1496}
              height={1764}
              priority
              sizes="(max-width: 768px) 88vw, 42rem"
              className="mx-auto h-auto w-[min(88vw,42rem)] drop-shadow-[0_0_22px_rgba(123,222,214,0.24)]"
            />
          </motion.div>
        </motion.div>

        <motion.p
          className="relative z-10 mt-3 max-w-4xl font-poppins text-[11px] italic tracking-[0.3em] text-white/92 sm:text-sm md:mt-5 md:text-xl md:tracking-[0.22em]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.35 }}
        >
          {COPY.heroTagline}
        </motion.p>
      </SectionContainer>
    </section>
  );
}

function CategoryCard({ label }: CategoryItem) {
  return (
    <motion.article
      {...revealUp}
      className="rounded-2xl border border-white/10 px-5 py-10 text-center shadow-[inset_0_1px_0_rgba(242,242,242,0.18)]"
      style={{ backgroundImage: GRADIENTS.cardPrimary }}
    >
      <h3 className="font-plus-jakarta text-2xl font-semibold tracking-[0.08em] text-white md:text-3xl">
        {label.toUpperCase()}
      </h3>
      <Link
        href="#registration"
        className="mt-7 inline-flex rounded-full px-5 py-1 font-poppins text-xs font-semibold text-black md:text-sm"
        style={{ backgroundImage: GRADIENTS.pillLight }}
      >
        Learn More
      </Link>
    </motion.article>
  );
}

function CategorySection() {
  return (
    <section id="category" className="relative h-[75svh] min-h-[34rem] w-full md:h-[75vh] md:min-h-0">
      <SectionContainer className="flex h-full flex-col justify-center">
        <motion.h2
          {...revealUp}
          className="text-center font-plus-jakarta text-4xl font-bold tracking-[0.07em] text-[#72c8bc] md:text-5xl"
        >
          Category
        </motion.h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-3 md:mt-8 md:gap-6">
          {CATEGORY_ITEMS.map((category) => (
            <CategoryCard key={category.label} label={category.label} />
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}

function FooterBar() {
  return (
    <footer className="border-t border-[#8eb8bf]/30" style={{ backgroundImage: GRADIENTS.footer }}>
      <div className="flex flex-col gap-4 px-4 py-3 sm:px-5 md:flex-row md:items-end md:justify-between md:px-6">
        <div>
          <BrandRow
            summitLogoClassName="h-7 w-6 md:h-9 md:w-8"
            sxcLogoClassName="h-8 w-[3.5rem] md:h-10 md:w-[4.4rem]"
          />
          <div className="mt-2 flex items-center gap-2 text-[#063250]">
            <AssetImage src={ASSETS.instagram} alt="" width={19} height={19} className="h-4 w-4" />
            <p className="font-poppins text-[10px] font-medium tracking-[0.07em]">sxcgrandsummit</p>
          </div>
        </div>

        <nav className="grid grid-cols-2 gap-x-8 gap-y-1 font-plus-jakarta text-[11px] font-semibold text-[#063250] md:text-xs">
          {NAV_ITEMS.map((item) => (
            <Link key={`footer-${item.label}`} href={item.href} className="transition hover:text-[#021827]">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

function AboutSection() {
  return (
    <section id="registration" className="relative h-[125svh] min-h-[62rem] w-full md:h-[125vh] md:min-h-0">
      <SectionContainer className="relative flex h-full flex-col py-6 md:py-8">
        <motion.div className="text-center" {...revealUp}>
          <p className="font-plus-jakarta text-[11px] text-white/80 md:text-xs">StudentxCEO</p>
          <h2 className="font-plus-jakarta text-4xl font-bold leading-none text-white md:text-5xl">
            About <span className="italic">Grand Summit</span>
          </h2>
        </motion.div>

        <motion.div
          className="mt-6 flex-1 space-y-5 md:mt-8 md:space-y-6"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        >
          <div className="grid items-center gap-3 md:grid-cols-[auto,1fr] md:gap-6">
            <Pill>Objective</Pill>
            <p className="font-poppins text-sm leading-relaxed text-white/92 md:text-base">
              {COPY.objective}
            </p>
          </div>

          <div className="grid items-center gap-3 md:grid-cols-[1fr,auto] md:gap-6">
            <p className="order-2 whitespace-pre-line text-left font-poppins text-sm leading-relaxed text-white/92 md:order-1 md:text-right md:text-base">
              {COPY.keywords}
            </p>
            <Pill tone="dark" className="order-1 md:order-2">
              Keywords
            </Pill>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr,1.6fr] lg:gap-5">
            <article
              className="rounded-2xl border border-white/10 px-5 pb-6 pt-4 shadow-[inset_0_2px_0_rgba(242,242,242,0.22)]"
              style={{ backgroundImage: GRADIENTS.cardSecondary }}
            >
              <Pill className="text-xl md:text-3xl">Vision</Pill>
              <p className="mt-4 font-poppins text-sm leading-relaxed text-white/92 md:text-base">
                To provide Indonesian university students with opportunities to grow as
                authentic future leaders by strengthening critical thinking, ethical
                decision-making, and real-world problem-solving skills through direct
                collaboration with industry leaders.
              </p>
            </article>

            <article
              className="rounded-2xl border border-white/10 px-5 pb-6 pt-4 shadow-[inset_0_2px_0_rgba(242,242,242,0.22)]"
              style={{ backgroundImage: GRADIENTS.cardSecondaryAlt }}
            >
              <Pill className="text-xl md:text-3xl">Mission</Pill>
              <p className="mt-4 font-poppins text-sm leading-relaxed text-white/92 md:text-base">
                To create a collaborative space for students and industry leaders to
                address business challenges through case-based competitions and
                discussions:
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6 font-poppins text-sm leading-relaxed text-white/92 md:text-base">
                {MISSION_POINTS.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          </div>

          <div className="grid items-center gap-3 md:grid-cols-[auto,1fr] md:gap-6">
            <Pill>Values</Pill>
            <div className="rounded-full bg-white/22 px-6 py-2 text-center font-poppins text-sm font-medium text-white md:text-base">
              {COPY.values}
            </div>
          </div>
        </motion.div>

        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-10 bottom-28 hidden w-28 md:block lg:w-36"
          {...revealUp}
        >
          <AssetImage
            src={ASSETS.puzzleLeftAlt}
            alt=""
            width={591}
            height={789}
            sizes="(max-width: 1024px) 7rem, 9rem"
            className="h-auto w-full drop-shadow-[0_14px_24px_rgba(0,0,0,0.3)]"
          />
        </motion.div>

        <motion.div className="mt-6 md:mt-8" {...revealUp}>
          <FooterBar />
        </motion.div>
      </SectionContainer>
    </section>
  );
}

export default function Home() {
  return (
    <main
      className="relative h-[300svh] w-full overflow-x-clip text-white md:h-[300vh] px-20"
      style={{
        backgroundColor: "#00243c",
        backgroundImage: GRADIENTS.page,
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <h1 className="sr-only">StudentxCEO Grand Summit 15th</h1>

      <HeroSection />
      <CategorySection />
      <AboutSection />
    </main>
  );
}
