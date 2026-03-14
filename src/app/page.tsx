import type { ReactNode } from "react";

const navItems = [
  { label: "Registration", href: "#registration" },
  { label: "Competition", href: "#category" },
  { label: "Events", href: "#category" },
  { label: "Merch", href: "#category" },
];

const categories = ["Competition", "Events", "Merch"];

const logoSXC =
  "https://www.figma.com/api/mcp/asset/d673fa27-5dee-4aaf-912a-0a58ce17d9f3";
const logoStudentxCEO =
  "https://www.figma.com/api/mcp/asset/1fe3d79c-707f-4d6a-9a78-b201c318c8a8";

const missionPoints = [
  "To develop students critical thinking, creativity, and transparency-driven leadership through practical business exposure.",
  "To bridge students and companies by delivering educational programs, competitions, and industry engagement activities that emphasize human-centric and sustainable innovation.",
];

function GradientPill({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex min-w-[140px] items-center justify-center rounded-full bg-[linear-gradient(90deg,#8ae2d9_0%,#fdfdfd_60%)] px-6 py-2 font-plus-jakarta text-xl font-bold text-[#063250] md:text-3xl ${className}`}
    >
      {children}
    </span>
  );
}

function DecorativeCross({ className }: { className: string }) {
  return (
    <div className={`pointer-events-none absolute ${className}`} aria-hidden>
      <div className="relative h-16 w-16 rotate-45 md:h-24 md:w-24">
        <div className="absolute left-1/2 top-0 h-full w-4 -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,#95f1e7_0%,#62b7bf_45%,#0f4f69_100%)] opacity-90 blur-[0.2px]" />
        <div className="absolute left-0 top-1/2 h-4 w-full -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,#95f1e7_0%,#62b7bf_45%,#0f4f69_100%)] opacity-90 blur-[0.2px]" />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div
      className="relative min-h-screen overflow-x-clip text-white"
      style={{
        backgroundImage:
          "linear-gradient(180deg, #00243c 0%, #063250 20%, #2a6976 55%, #57aea5 80%, #e8f5ef 100%)",
      }}
    >
      <div className="pointer-events-none absolute -left-24 top-32 h-60 w-60 rounded-full bg-[#2f6f85]/35 blur-2xl" />
      <div className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-[#2f6f85]/35 blur-2xl" />
      <div className="pointer-events-none absolute -left-8 top-[360px] h-44 w-44 rounded-full bg-[#d2ece8]/30 blur-2xl" />
      <div className="pointer-events-none absolute right-[-90px] top-[640px] h-64 w-64 rounded-full bg-[#d2ece8]/25 blur-2xl" />
      <div className="pointer-events-none absolute left-1/2 top-[820px] h-80 w-80 -translate-x-1/2 rounded-full bg-[#cceae2]/20 blur-3xl" />

      <DecorativeCross className="right-8 top-36 hidden md:block" />
      <DecorativeCross className="-left-6 top-[380px]" />
      <DecorativeCross className="-left-5 top-[960px]" />

      <header className="relative z-20 mx-auto w-full max-w-[1200px] px-4 pt-5 md:px-8 md:pt-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoSXC} alt="SXC logo" className="h-12 w-12 object-contain md:h-16 md:w-16" />
            <img
              src={logoStudentxCEO}
              alt="StudentxCEO logo"
              className="h-12 w-16 object-contain md:h-16 md:w-[5.5rem]"
            />
          </div>

          <ul className="hidden items-center gap-8 font-plus-jakarta text-sm tracking-[0.18em] text-white/85 lg:flex">
            {navItems.map((item) => (
              <li key={item.label}>
                <a href={item.href} className="transition hover:text-white">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            className="rounded-full bg-[#7ea9b8] px-4 py-1.5 font-plus-jakarta text-xs font-semibold text-[#063250] md:px-6 md:text-sm"
          >
            Log In
          </a>
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1200px] px-4 pb-20 md:px-8 md:pb-28">
        <section className="pb-20 pt-10 md:pb-28 md:pt-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-poppins text-[clamp(120px,22vw,280px)] font-medium italic leading-[0.82] text-transparent [text-shadow:0_0_30px_rgba(194,241,235,0.4)] [-webkit-text-stroke:1.4px_rgba(211,248,242,0.9)]">
              15
            </p>
            <p className="-mt-4 font-plus-jakarta text-xl text-white/90 md:text-4xl">
              StudentxCEO
            </p>
            <h1 className="font-plus-jakarta text-5xl font-bold leading-[0.95] md:text-7xl">
              Grand <span className="font-poppins italic">Summit</span>
            </h1>
            <p className="mx-auto mt-8 max-w-4xl font-poppins text-[15px] italic tracking-[0.34em] text-white/90 md:text-2xl md:tracking-[0.26em]">
              Authentic Ascendance: Advancing Leadership through Transparency and
              Human-Centric Innovation
            </p>
          </div>
        </section>

        <section id="category" className="pb-24 md:pb-28">
          <h2 className="text-center font-plus-jakarta text-4xl font-bold tracking-[0.07em] text-[#72c8bc] md:text-5xl">
            Category
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {categories.map((category) => (
              <article
                key={category}
                className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(10,59,86,0.5)_0%,rgba(87,174,165,0.38)_140%)] px-6 py-14 text-center shadow-[inset_0_2px_0_rgba(242,242,242,0.2)]"
              >
                <h3 className="font-plus-jakarta text-3xl font-semibold tracking-[0.08em] md:text-4xl">
                  {category.toUpperCase()}
                </h3>
                <button
                  type="button"
                  className="mt-8 rounded-full bg-[linear-gradient(90deg,#8ae2d9_0%,#fdfdfd_60%)] px-6 py-1.5 font-poppins text-base font-semibold text-black md:text-lg"
                >
                  Learn More
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="registration" className="pb-24 md:pb-28">
          <div className="text-center">
            <p className="font-plus-jakarta text-sm text-white/80">StudentxCEO</p>
            <h2 className="font-plus-jakarta text-5xl font-bold md:text-6xl">
              About <span className="font-poppins italic">Grand Summit</span>
            </h2>
          </div>

          <div className="mt-12 space-y-8">
            <div className="grid items-center gap-4 md:grid-cols-[auto,1fr]">
              <GradientPill>Objective</GradientPill>
              <p className="font-poppins text-lg text-white/90 md:text-2xl">
                To provide a collaborative platform for Indonesian university students
                and industry leaders to develop transparent, innovative,
                human-centric solutions to real business challenges.
              </p>
            </div>

            <div className="grid items-center gap-4 md:grid-cols-[1fr,auto]">
              <p className="order-2 text-left font-poppins text-lg text-white/90 md:order-1 md:text-right md:text-2xl">
                Human-Centric Innovation - Authenticity in Leadership
                <br />
                Sustainable Value Creation - Collaboration - Transparency
              </p>
              <span className="order-1 inline-flex min-w-[150px] items-center justify-center rounded-full bg-[#063250] px-6 py-2 font-plus-jakarta text-xl font-bold text-white md:order-2 md:text-3xl">
                Keywords
              </span>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr,2fr]">
              <article className="rounded-2xl border border-white/15 bg-[linear-gradient(132deg,rgba(6,50,80,0.5)_11%,rgba(48,114,124,0.5)_98%)] px-6 pb-8 pt-5 shadow-[inset_0_2px_0_rgba(242,242,242,0.25)]">
                <GradientPill className="text-2xl md:text-3xl">Vision</GradientPill>
                <p className="mt-7 font-poppins text-base leading-relaxed text-white/90 md:text-xl">
                  To provide Indonesian university students with opportunities to grow
                  as authentic future leaders by strengthening critical thinking,
                  ethical decision-making, and real-world problem-solving skills
                  through direct collaboration with industry leaders.
                </p>
              </article>

              <article className="rounded-2xl border border-white/15 bg-[linear-gradient(115deg,rgba(6,50,80,0.5)_15%,rgba(48,114,124,0.5)_95%)] px-6 pb-8 pt-5 shadow-[inset_0_2px_0_rgba(242,242,242,0.25)]">
                <GradientPill className="text-2xl md:text-3xl">Mission</GradientPill>
                <p className="mt-7 font-poppins text-base leading-relaxed text-white/90 md:text-xl">
                  To create a collaborative space for students and industry leaders to
                  address business challenges through case-based competitions and
                  discussions:
                </p>
                <ul className="mt-4 list-disc space-y-3 pl-6 font-poppins text-base leading-relaxed text-white/90 md:text-xl">
                  {missionPoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            </div>

            <div className="grid items-center gap-4 md:grid-cols-[auto,1fr]">
              <GradientPill>Values</GradientPill>
              <div className="rounded-full bg-white/22 px-6 py-3 text-center font-poppins text-base font-medium text-white md:text-xl">
                Integrity - Collaboration - Innovation
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/20 bg-[linear-gradient(84deg,rgba(36,110,121,0.88)_15%,rgba(207,229,231,0.88)_100%)]">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-8 md:px-8 md:py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-3">
              <img src={logoSXC} alt="SXC logo" className="h-12 w-12 object-contain md:h-16 md:w-16" />
              <img
                src={logoStudentxCEO}
                alt="StudentxCEO logo"
                className="h-12 w-16 object-contain md:h-16 md:w-[5.5rem]"
              />
            </div>

            <div>
              <p className="mt-2 font-plus-jakarta text-sm text-[#063250]">
                @sxcgrandsummit
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-10 gap-y-2 font-plus-jakarta text-sm font-semibold text-[#063250] md:text-base">
              {navItems.map((item) => (
                <a key={item.label} href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
