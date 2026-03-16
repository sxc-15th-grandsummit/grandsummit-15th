"use client";

import { motion } from "framer-motion";
import { ASSETS, COPY } from "@/constants";
import AssetImage from "@/components/shared/AssetImage";
import SectionContainer from "@/components/shared/SectionContainer";

export default function HeroSection() {
  return (
    <section className="relative h-svh w-full md:h-screen">
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
