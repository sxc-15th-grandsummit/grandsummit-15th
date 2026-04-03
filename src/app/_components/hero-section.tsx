"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ASSETS, COPY } from "@/constants";
import AssetImage from "./asset-image";
import SectionContainer from "./section-container";

export function HeroParallaxPuzzles({
  targetRef,
}: {
  targetRef: React.RefObject<HTMLElement | null>;
}) {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const leftX = useTransform(scrollYProgress, [0, 1], [0, 520]);
  const leftY = useTransform(scrollYProgress, [0, 1], [0, -320]);
  const leftRotate = useTransform(scrollYProgress, [0, 1], [-6, 22]);
  const leftScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.88]);
  const leftOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const rightX = useTransform(scrollYProgress, [0, 1], [0, -520]);
  const rightY = useTransform(scrollYProgress, [0, 1], [0, 320]);
  const rightRotate = useTransform(scrollYProgress, [0, 1], [6, -22]);
  const rightScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.88]);
  const rightOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[100svh] overflow-hidden md:h-screen"
    >
      {/* Left puzzle */}
      <motion.div
        className="absolute left-0 top-[42%] w-52 -translate-x-[16%] -translate-y-1/2 sm:w-64 md:w-80 lg:w-[26rem] xl:w-[32rem]"
        initial={{ opacity: 0, x: -80, scale: 0.78 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        style={{
          x: prefersReducedMotion ? 0 : leftX,
          y: prefersReducedMotion ? 0 : leftY,
          rotate: prefersReducedMotion ? -4 : leftRotate,
          scale: prefersReducedMotion ? 1 : leftScale,
          opacity: prefersReducedMotion ? 1 : leftOpacity,
        }}
      >
        <motion.div
          animate={prefersReducedMotion ? undefined : {
            x: [0, -14, 4, -6, 0],
            y: [0, -18, -8, -20, 0],
            rotate: [-4, -6.5, -5, -7, -4],
          }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <AssetImage
            src={ASSETS.puzzleLeft}
            alt=""
            width={408}
            height={761}
            sizes="(max-width: 640px) 13rem, (max-width: 1024px) 18rem, 28rem"
            className="h-auto w-full drop-shadow-[0_24px_48px_rgba(0,0,0,0.5)] drop-shadow-[0_0_40px_rgba(87,174,165,0.18)]"
          />
        </motion.div>
      </motion.div>

      {/* Right puzzle */}
      <motion.div
        className="absolute right-0 top-[32%] w-52 translate-x-[16%] -translate-y-1/2 sm:w-64 md:w-80 lg:w-[26rem] xl:w-[32rem]"
        initial={{ opacity: 0, x: 80, scale: 0.78 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{
          x: prefersReducedMotion ? 0 : rightX,
          y: prefersReducedMotion ? 0 : rightY,
          rotate: prefersReducedMotion ? 4 : rightRotate,
          scale: prefersReducedMotion ? 1 : rightScale,
          opacity: prefersReducedMotion ? 1 : rightOpacity,
        }}
      >
        <motion.div
          animate={prefersReducedMotion ? undefined : {
            x: [0, 14, 6, 10, 0],
            y: [0, 18, 8, 22, 0],
            rotate: [4, 6.5, 5, 7.5, 4],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        >
          <AssetImage
            src={ASSETS.puzzleRight}
            alt=""
            width={452}
            height={648}
            sizes="(max-width: 640px) 13rem, (max-width: 1024px) 18rem, 28rem"
            className="h-auto w-full drop-shadow-[0_24px_48px_rgba(0,0,0,0.5)] drop-shadow-[0_0_40px_rgba(87,174,165,0.18)]"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative h-[100svh] w-full md:h-screen">
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
