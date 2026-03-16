"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ASSETS } from "@/constants";
import AssetImage from "@/components/shared/AssetImage";

export default function HeroParallaxPuzzles({ targetRef }: { targetRef: React.RefObject<HTMLElement | null> }) {
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
      className="pointer-events-none absolute inset-x-0 top-0 z-10 h-svh overflow-hidden md:h-screen"
    >
      <motion.div
        className="absolute left-0 top-[44%] w-36 -translate-x-[22%] -translate-y-1/2 sm:w-44 md:w-56 lg:w-72 xl:w-88"
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
          transition={{
            duration: 4.2,
            repeat: Infinity,
            ease: "easeInOut",
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
      </motion.div>

      <motion.div
        className="absolute right-0 top-[34%] w-36 translate-x-[22%] -translate-y-1/2 sm:w-44 md:w-56 lg:w-72 xl:w-88"
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
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
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
      </motion.div>
    </div>
  );
}
