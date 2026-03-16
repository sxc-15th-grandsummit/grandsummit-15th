"use client";

import { useRef } from "react";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { GRADIENTS, ASSETS, NAV_ITEMS } from "@/constants";

import HeroParallaxPuzzles from "@/components/home/HeroParallaxPuzzles";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import AboutSection from "@/components/home/AboutSection";

export default function Home() {
  const pageRef = useRef<HTMLElement>(null);

  return (
    <main
      ref={pageRef}
      className="relative min-h-[300svh] w-full overflow-x-clip text-white md:min-h-[300vh]"
      style={{
        backgroundColor: "#00243c",
        backgroundImage: GRADIENTS.page,
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <h1 className="sr-only">StudentxCEO Grand Summit 15th</h1>
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

      <div className="relative z-20 mt-6 md:absolute md:inset-x-0 md:bottom-0 md:mt-0">
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
