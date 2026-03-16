"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GRADIENTS, CategoryItem, revealUp } from "@/constants";

export default function CategoryCard({ label }: CategoryItem) {
  return (
    <motion.article
      {...revealUp}
      className="rounded-2xl border border-white/10 px-5 py-16 text-center shadow-[inset_0_1px_0_rgba(242,242,242,0.18)] md:py-24"
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
