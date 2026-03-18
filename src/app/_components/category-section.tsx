"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CATEGORY_ITEMS, GRADIENTS, revealUp } from "@/constants";
import type { CategoryItem } from "@/constants";
import SectionContainer from "./section-container";

function CategoryCard({ label }: CategoryItem) {
  return (
    <motion.article
      {...revealUp}
      className="rounded-2xl border border-white/10 px-4 py-10 text-center shadow-[inset_0_1px_0_rgba(242,242,242,0.18)] sm:px-5 sm:py-14 md:py-24"
      style={{ backgroundImage: GRADIENTS.cardPrimary }}
    >
      <h3 className="font-plus-jakarta text-lg font-semibold tracking-[0.08em] text-white sm:text-2xl md:text-xl lg:text-2xl xl:text-3xl">
        {label.toUpperCase()}
      </h3>
      <Link
        href="#registration"
        className="mt-5 inline-flex whitespace-nowrap rounded-full px-5 py-1 font-poppins text-xs font-semibold text-black md:mt-7 md:text-sm"
        style={{ backgroundImage: GRADIENTS.pillLight }}
      >
        Learn More
      </Link>
    </motion.article>
  );
}

export default function CategorySection() {
  return (
    <section id="category" className="relative w-full py-10 md:h-[75vh] md:py-0">
      <SectionContainer className="flex flex-col justify-center md:h-full">
        <motion.h2
          {...revealUp}
          className="text-center font-plus-jakarta text-3xl font-bold tracking-[0.07em] text-accent-teal sm:text-4xl md:text-5xl"
        >
          Category
        </motion.h2>

        <div className="mt-6 grid gap-4 md:mt-8 md:grid-cols-3 md:gap-4 lg:gap-10 xl:gap-20">
          {CATEGORY_ITEMS.map((category) => (
            <CategoryCard key={category.label} label={category.label} />
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
