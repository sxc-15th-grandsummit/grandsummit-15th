"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ASSETS, COPY, GRADIENTS, MISSION_POINTS, revealUp } from "@/constants";
import AssetImage from "./asset-image";
import SectionContainer from "./section-container";

export default function AboutSection({
  targetRef,
}: {
  targetRef: React.RefObject<HTMLElement | null>;
}) {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });
  const bottomLeftX = useTransform(scrollYProgress, [0, 1], [0, 280]);
  const bottomLeftY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const bottomLeftRotate = useTransform(scrollYProgress, [0, 1], [-6, 10]);
  const bottomLeftOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.56]);

  return (
    <section id="registration" className="relative w-full pb-16 md:min-h-[125vh]">
      <SectionContainer className="relative flex flex-col py-6 md:py-8">
        <motion.div className="text-center" {...revealUp}>
          <p className="font-plus-jakarta text-[11px] text-white/80 md:text-xs">
            StudentxCEO
          </p>
          <h2 className="font-plus-jakarta text-4xl font-bold leading-none text-white [text-shadow:0_0_20px_rgba(178,239,255,0.35)] md:text-5xl">
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
          <div className="flex flex-col gap-7 md:gap-9">
            <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-[30%_70%] md:gap-8">
              <div className="flex justify-start">
                <span className="inline-flex h-10 w-fit items-center justify-center rounded-full border border-[#58a3c5]/35 px-5 font-plus-jakarta text-xl font-bold leading-none text-light [text-shadow:0_0_14px_rgba(186,244,255,0.55)] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] md:h-[4.2rem] md:px-8 md:text-[3.05rem]"
                  style={{ backgroundImage: GRADIENTS.badgeLabel }}
                >
                  Objective
                </span>
              </div>
              <div className="flex flex-col">
                <p className="font-poppins text-sm leading-[1.42] text-[#f5fdff] md:text-[1.1rem] md:leading-[1.45]">
                  {COPY.objective}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-[70%_30%] md:gap-8">
              <div className="flex flex-col">
                <div className="lg:ml-50">
                  <p className="whitespace-pre-line text-center font-poppins text-sm leading-[1.42] text-[#f5fdff] md:text-[1.1rem] md:leading-[1.45]">
                    {COPY.keywords}
                  </p>
                </div>
              </div>
              <div className="flex justify-start md:justify-end">
                <span className="inline-flex h-10 w-fit items-center justify-center rounded-full border border-[#58a3c5]/35 px-5 font-plus-jakarta text-xl font-bold leading-none text-light [text-shadow:0_0_14px_rgba(186,244,255,0.55)] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] md:h-[4.2rem] md:px-8 md:text-[3.05rem]"
                  style={{ backgroundImage: GRADIENTS.badgeLabel }}
                >
                  Keywords
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:mt-20 md:gap-6 lg:grid-cols-[0.78fr_1.22fr]">
            <article
              className="relative rounded-3xl border border-white/14 px-5 pb-6 pt-10 shadow-[inset_0_2px_0_rgba(242,242,242,0.2)] md:px-6 md:pb-7 md:pt-14"
              style={{ backgroundImage: GRADIENTS.cardSecondary }}
            >
              <span
                className="absolute left-1/2 top-0 inline-flex h-9 w-[130px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-plus-jakarta text-xl font-bold text-primary-dark md:h-12 md:w-[190px] md:text-[2.1rem]"
                style={{ backgroundImage: GRADIENTS.pillGradient }}
              >
                Vision
              </span>
              <p className="font-poppins text-sm leading-relaxed text-white/95 md:text-[1.1rem]">
                To provide Indonesian university students with opportunities to grow as
                authentic future leaders by strengthening critical thinking, ethical
                decision-making, and real-world problem-solving skills through direct
                collaboration with industry leaders.
              </p>
            </article>

            <article
              className="relative rounded-3xl border border-white/14 px-5 pb-6 pt-10 shadow-[inset_0_2px_0_rgba(242,242,242,0.2)] md:px-6 md:pb-7 md:pt-14"
              style={{ backgroundImage: GRADIENTS.cardSecondaryAlt }}
            >
              <span
                className="absolute left-1/2 top-0 inline-flex h-9 w-[130px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-plus-jakarta text-xl font-bold text-primary-dark md:h-12 md:w-[190px] md:text-[2.1rem]"
                style={{ backgroundImage: GRADIENTS.pillGradient }}
              >
                Mission
              </span>
              <p className="font-poppins text-sm leading-relaxed text-white/95 md:text-[1.1rem]">
                To create a collaborative space for students and industry leaders to
                address business challenges through case-based competitions and
                discussions:
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-6 font-poppins text-sm leading-relaxed text-white/95 md:text-[1.1rem]">
                {MISSION_POINTS.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          </div>

          <div
            className="mx-auto mt-1 flex w-full max-w-5xl items-center overflow-hidden rounded-full"
            style={{ backgroundImage: GRADIENTS.valuesRow }}
          >
            <span
              className="inline-flex h-9 min-w-24 items-center justify-center rounded-full px-5 font-plus-jakarta text-xl font-bold text-primary-dark md:h-12 md:min-w-[200px] md:text-[2.05rem]"
              style={{ backgroundImage: GRADIENTS.pillGradient }}
            >
              Values
            </span>
            <span className="flex-1 px-3 text-center font-poppins text-sm font-semibold text-white md:text-[1.1rem]">
              {COPY.values}
            </span>
          </div>
        </motion.div>

        <motion.div
          aria-hidden
          className="pointer-events-none absolute bottom-20 left-0 hidden w-40 -translate-x-[35%] md:block lg:bottom-24 lg:w-52 xl:w-64"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.25, ease: "easeOut" }}
          style={{
            x: prefersReducedMotion ? 0 : bottomLeftX,
            y: prefersReducedMotion ? 0 : bottomLeftY,
            rotate: prefersReducedMotion ? -4 : bottomLeftRotate,
            opacity: prefersReducedMotion ? 1 : bottomLeftOpacity,
          }}
        >
          <motion.div
            animate={prefersReducedMotion ? undefined : { x: [0, -8, 0], y: [0, -10, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <AssetImage
              src={ASSETS.puzzleLeftAlt}
              alt=""
              width={591}
              height={789}
              sizes="(max-width: 1024px) 12rem, 16rem"
              className="h-auto w-full drop-shadow-[0_18px_30px_rgba(0,0,0,0.35)]"
            />
          </motion.div>
        </motion.div>
      </SectionContainer>
    </section>
  );
}
