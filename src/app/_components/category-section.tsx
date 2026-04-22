"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { CATEGORY_ITEMS, GRADIENTS, revealUp } from "@/constants";
import type { CategoryItem } from "@/constants";
import SectionContainer from "./section-container";

function CategoryCard({ label, href, subLinks }: CategoryItem) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.article
      {...revealUp}
      className="relative rounded-2xl border border-white/10 px-4 py-10 text-center shadow-[inset_0_1px_0_rgba(242,242,242,0.18)] sm:px-5 sm:py-14 md:py-24"
      style={{ backgroundImage: GRADIENTS.cardPrimary }}
    >
      <h3 className="font-plus-jakarta text-lg font-semibold tracking-[0.08em] text-white sm:text-2xl md:text-xl lg:text-2xl xl:text-3xl">
        {label.toUpperCase()}
      </h3>

      <div className="mt-5 flex items-center justify-center md:mt-7">
        <AnimatePresence mode="wait">
          {subLinks && expanded ? (
            <motion.div
              key="pills"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex gap-2"
            >
              {subLinks.map((sub) => (
                <Link
                  key={sub.label}
                  href={sub.href}
                  className="inline-flex whitespace-nowrap rounded-full px-5 py-1 font-poppins text-xs font-semibold text-black md:text-sm"
                  style={{ backgroundImage: GRADIENTS.pillLight }}
                >
                  {sub.label}
                </Link>
              ))}
            </motion.div>
          ) : (
            <motion.button
              key="learn"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={() => subLinks ? setExpanded(true) : undefined}
              className="inline-flex whitespace-nowrap rounded-full px-5 py-1 font-poppins text-xs font-semibold text-black md:text-sm"
              style={{ backgroundImage: GRADIENTS.pillLight }}
            >
              {subLinks ? (
                label === "Merch" ? "Buy Here" : "Regist Here"
              ) : (
                <Link href={href ?? "/coming-soon"} className="contents">
                  {label === "Merch" ? "Buy Here" : "Regist Here"}
                </Link>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
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
            <CategoryCard
              key={category.label}
              label={category.label}
              href={category.href}
              subLinks={category.subLinks}
            />
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
