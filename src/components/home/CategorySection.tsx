"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CATEGORY_ITEMS, revealUp } from "@/constants";
import SectionContainer from "@/components/shared/SectionContainer";
import CategoryCard from "@/components/shared/CategoryCard";

export default function CategorySection() {
  return (
    <section id="category" className="relative w-full py-12 md:h-[75vh] md:py-0">
      <SectionContainer className="flex flex-col justify-center md:h-full">
        <motion.h2
          {...revealUp}
          className="text-center font-plus-jakarta text-4xl font-bold tracking-[0.07em] text-[#72c8bc] md:text-5xl"
        >
          Category
        </motion.h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-3 md:mt-8 md:gap-20">
          {CATEGORY_ITEMS.map((category) => (
            <CategoryCard key={category.label} label={category.label} />
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
