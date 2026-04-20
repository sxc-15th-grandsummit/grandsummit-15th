"use client";

import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import BrandRow from "../brand-row";
import LoginButton from "../login-button";
import RegistrationNav from "../registration-nav";

export type HeaderNavItem = {
  href: string;
  label: string;
};

type HeaderAssets = {
  summitLogo: string;
  sxcLogo: string;
};

export default function Header({
  assets,
  className,
  navItems,
}: {
  assets: HeaderAssets;
  className?: string;
  navItems: ReadonlyArray<HeaderNavItem>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const id = href.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        closeMenu();
      }
    }
  };

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-colors duration-500", className)}>
      <div className="flex w-full justify-center px-4 sm:px-6 lg:px-10">
        <motion.nav
          initial={false}
          animate={{
            y: isScrolled ? 12 : 0,
            width: isScrolled ? "min(95%, 1100px)" : "100%",
            backgroundColor: isScrolled ? "rgba(10, 58, 88, 0.7)" : "rgba(0, 0, 0, 0)",
            backdropFilter: isScrolled ? "blur(16px)" : "blur(0px)",
            paddingLeft: isScrolled ? "2rem" : "0",
            paddingRight: isScrolled ? "2rem" : "0",
            paddingTop: isScrolled ? "0.6rem" : "1.5rem",
            paddingBottom: isScrolled ? "0.6rem" : "1.5rem",
            borderRadius: isScrolled ? "100px" : "0px",
            borderWidth: isScrolled ? "1px" : "0px",
            borderColor: isScrolled ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0)",
            boxShadow: isScrolled ? "0 12px 30px rgba(0, 0, 0, 0.3)" : "none",
          }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="flex w-full items-center justify-between"
        >
          <BrandRow
            assets={assets}
            summitLogoClassName={cn(
              "transition-all duration-500 contrast-125 saturate-125 drop-shadow-[0_0_10px_rgba(151,226,230,0.55)]",
              isScrolled ? "h-10 w-9" : "h-12 w-11 md:h-20 md:w-18"
            )}
            sxcLogoClassName={cn(
              "transition-all duration-500 contrast-125 saturate-125 drop-shadow-[0_0_10px_rgba(151,226,230,0.55)]",
              isScrolled ? "h-10 w-18" : "h-12 w-[5.2rem] md:h-20 md:w-20"
            )}
          />

          <ul className="hidden items-center gap-10 font-plus-jakarta text-sm font-bold tracking-[0.13em] text-white [text-shadow:0_0_10px_rgba(180,240,244,0.35)] min-[1020px]:flex">
            <li><RegistrationNav /></li>
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className="transition hover:text-[#b9f5f0]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <div className="hidden min-[1020px]:block">
              <LoginButton />
            </div>

            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={isOpen}
              onClick={() => setIsOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-primary-mid/85 text-white shadow-[0_0_12px_rgba(140,217,224,0.26)] min-[1020px]:hidden"
            >
              <span className="relative block h-4 w-5">
                <span className="absolute left-0 top-0 block h-[2px] w-5 rounded bg-current" />
                <span className="absolute left-0 top-[6px] block h-[2px] w-5 rounded bg-current" />
                <span className="absolute left-0 top-[12px] block h-[2px] w-5 rounded bg-current" />
              </span>
            </button>
          </div>
        </motion.nav>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu overlay"
              onClick={closeMenu}
              className="fixed inset-0 z-40 bg-[#011224]/45 min-[1020px]:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.aside
              className="fixed right-0 top-0 z-50 h-screen w-[min(92vw,28rem)] overflow-hidden border-l border-white/15 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.38)] min-[1020px]:hidden"
              style={{
                backgroundImage:
                  "linear-gradient(180deg,#022b45 0%,#063250 34%,#1e5f73 78%,#4fa49b 100%)",
              }}
              initial={{ x: "100%", opacity: 0.2 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.2 }}
              transition={{ duration: 0.36, ease: "easeOut" }}
            >
              <div className="relative flex h-full flex-col">
                {/* Header row */}
                <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span className="font-plus-jakarta text-xs font-bold uppercase tracking-[0.2em] text-white/40">Menu</span>
                  <button
                    type="button"
                    aria-label="Close menu"
                    onClick={closeMenu}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Nav items with dividers */}
                <nav className="mt-2 flex flex-col font-plus-jakarta text-[2.4rem] font-bold tracking-[0.03em] text-white">
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }} className="py-3">
                    <RegistrationNav mobile onAction={closeMenu} />
                  </div>
                  {navItems.map((item) => (
                    <div key={`drawer-${item.label}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }} className="py-3">
                      <Link href={item.href} onClick={closeMenu} className="block transition hover:text-[#b9f5f0]">
                        {item.label}
                      </Link>
                    </div>
                  ))}
                </nav>

                {/* Login / Profile — prominent at the bottom */}
                <div className="mt-auto pt-6">
                  <LoginButton onAction={closeMenu} drawerVariant />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
