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

  const leftX = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const leftY = useTransform(scrollYProgress, [0, 1], [0, -240]);
  const leftRotate = useTransform(scrollYProgress, [0, 1], [-6, 12]);
  const leftOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.52]);

  const rightX = useTransform(scrollYProgress, [0, 1], [0, -360]);
  const rightY = useTransform(scrollYProgress, [0, 1], [0, 240]);
  const rightRotate = useTransform(scrollYProgress, [0, 1], [6, -12]);
  const rightOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.52]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[100svh] overflow-hidden md:h-screen"
    >
      <motion.div
        className="absolute left-0 top-[44%] w-36 -translate-x-[22%] -translate-y-1/2 sm:w-44 md:w-56 lg:w-72 xl:w-[22rem]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, delay: 0.25, ease: "easeOut" }}
        style={{
          x: prefersReducedMotion ? 0 : leftX,
          y: prefersReducedMotion ? 0 : leftY,
          rotate: prefersReducedMotion ? -4 : leftRotate,
          opacity: prefersReducedMotion ? 1 : leftOpacity,
        }}
      >
        <motion.div
          animate={prefersReducedMotion ? undefined : { x: [0, -8, 0], y: [0, -10, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
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
      </motion.div>

      <motion.div
        className="absolute right-0 top-[34%] w-36 translate-x-[22%] -translate-y-1/2 sm:w-44 md:w-56 lg:w-72 xl:w-[22rem]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, delay: 0.3, ease: "easeOut" }}
        style={{
          x: prefersReducedMotion ? 0 : rightX,
          y: prefersReducedMotion ? 0 : rightY,
          rotate: prefersReducedMotion ? 4 : rightRotate,
          opacity: prefersReducedMotion ? 1 : rightOpacity,
        }}
      >
        <motion.div
          animate={prefersReducedMotion ? undefined : { x: [0, 8, 0], y: [0, 10, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
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
