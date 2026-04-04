"use client";

import { useRef } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { HeroParallaxPuzzles } from "./hero-section";
import HeroSection from "./hero-section";
import CategorySection from "./category-section";
import AboutSection from "./about-section";
import { NAV_ITEMS, ASSETS, GRADIENTS } from "@/constants";

export default function PageContent() {
  const pageRef = useRef<HTMLElement>(null);

  return (
    <main
      ref={pageRef}
      className="relative w-full overflow-x-clip text-white"
      style={{
        backgroundColor: "var(--background)",
        backgroundImage: GRADIENTS.page,
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <h1 className="sr-only">StudentsxCEOs Grand Summit 15th</h1>
      <Header
        navItems={NAV_ITEMS}
        assets={{
          summitLogo: ASSETS.heroLogo,
          sxcLogo: ASSETS.sxcLogo,
        }}
      />
      <HeroParallaxPuzzles targetRef={pageRef} />

      <div className="relative z-10 h-full px-4 sm:px-6 md:px-20">
        <HeroSection />
        <CategorySection />
        <AboutSection targetRef={pageRef} />
      </div>

      <div className="z-30 mt-6">
        <Footer
          navItems={NAV_ITEMS}
          assets={{
            summitLogo: ASSETS.heroLogo,
            sxcLogo: ASSETS.sxcLogo,
            instagram: ASSETS.instagram,
          }}
        />
      </div>
    </main>
  );
}
