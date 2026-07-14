"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { GRADIENTS, revealUp } from "@/constants";
import AssetImage from "./asset-image";
import SectionContainer from "./section-container";

type PartnerLogo = {
  alt: string;
  darkTile?: boolean;
  height: number;
  src: string;
  width: number;
};

const sponsorBase =
  "/sponsor-medpart/Sponsor (dipisahin yaa judul medpart sama sponsornya)";
const mediaBase = "/sponsor-medpart/Media Partner";

const SPONSORS: PartnerLogo[] = [
  {
    alt: "GMF AeroAsia",
    src: `${sponsorBase}/gmf aeroasia logo new blue (1).png`,
    width: 2744,
    height: 577,
  },
  {
    alt: "Grab",
    src: `${sponsorBase}/Grab_Logo.svg.webp`,
    width: 500,
    height: 178,
  },
  {
    alt: "KAI",
    src: `${sponsorBase}/KAI (LOGO1).png`,
    width: 776,
    height: 328,
  },
  {
    alt: "Sponsor",
    src: `${sponsorBase}/LOGO_1 (1).png`,
    width: 1074,
    height: 484,
  },
  {
    alt: "Ganesha Parents Community",
    src: `${sponsorBase}/S__84434948.jpg`,
    width: 1280,
    height: 1249,
  },
];

const MEDIA_PARTNERS: PartnerLogo[] = [
  {
    alt: "8EH Radio ITB",
    src: `${mediaBase}/Medpart Batch 1/8eh Radio ITB/Logo 8EH Radio ITB.png`,
    width: 1777,
    height: 922,
  },
  {
    alt: "ASCEND",
    src: "/sponsor-medpart/optimized/ascend.png",
    width: 846,
    height: 596,
    darkTile: true,
  },
  {
    alt: "Anak Bisnis",
    src: "/sponsor-medpart/optimized/anak-bisnis.png",
    width: 2479,
    height: 735,
  },
  {
    alt: "BIC Binus",
    src: "/sponsor-medpart/optimized/bic-binus.png",
    width: 367,
    height: 188,
  },
  {
    alt: "BPH Hima HI Unpad",
    src: `${mediaBase}/Medpart Batch 1/BPH Hima HI/LOGO 1 Hima HI Unpad.png`,
    width: 592,
    height: 600,
  },
  {
    alt: "DCMD Undip",
    src: `${mediaBase}/Medpart Batch 1/DCMD Undip/LOGO KSPM FEB UNDIP.png`,
    width: 2828,
    height: 2828,
  },
  {
    alt: "Divia TV",
    src: `${mediaBase}/Medpart Batch 1/Divia unpad tv/Logo Divia TV.png`,
    width: 3508,
    height: 2480,
  },
  {
    alt: "FEBerbisnis",
    src: `${mediaBase}/Medpart Batch 1/FEBerbisnis/Logo FEBerbisnis.jpeg`,
    width: 713,
    height: 714,
  },
  {
    alt: "Finance for Indonesia",
    src: `${mediaBase}/Medpart Batch 1/Finance for Indonesia (pilih salah satu)/Black logo.png`,
    width: 2696,
    height: 793,
  },
  {
    alt: "Kawal Event",
    src: `${mediaBase}/Medpart Batch 1/KAWAL EVENT/Logo Kawal Event.jpg`,
    width: 1656,
    height: 704,
  },
  {
    alt: "Kompasiana",
    src: `${mediaBase}/Medpart Batch 1/Kompasiana/Kompasiana-biru.png`,
    width: 1968,
    height: 510,
  },
  {
    alt: "Lomba Bisnis",
    src: `${mediaBase}/Medpart Batch 1/Lomba Bisnis/LOGO_LOMBABISNIS-removebg-preview.png`,
    width: 534,
    height: 468,
  },
  {
    alt: "Peta Careers",
    src: `${mediaBase}/Medpart Batch 1/Peta Careers/Logo peta careers.png`,
    width: 1080,
    height: 1080,
  },
  {
    alt: "ShARE ITB",
    src: `${mediaBase}/Medpart Batch 1/ShARE ITB/ShARE ITB Green.png`,
    width: 4095,
    height: 1617,
  },
  {
    alt: "Strativate",
    src: `${mediaBase}/Medpart Batch 1/Strativate/Logo Strativate.png`,
    width: 786,
    height: 785,
  },
  {
    alt: "TEC ITB",
    src: `${mediaBase}/Medpart Batch 1/TEC ITB/Logo TEC.png`,
    width: 794,
    height: 794,
  },
  {
    alt: "Tempo",
    src: `${mediaBase}/Medpart Batch 1/Tempo/LOGO TEMPO RED.png`,
    width: 3248,
    height: 776,
  },
  {
    alt: "180DC Undip",
    src: `${mediaBase}/Medpart Batch 2/180DC Undip/2.PNG`,
    width: 4145,
    height: 1480,
  },
  {
    alt: "Gandeng Consulting",
    src: `${mediaBase}/Medpart Batch 2/Gandeng Consulting/Logo - G-Consulting (Logogram & Logotype) V1.png`,
    width: 4087,
    height: 1510,
  },
  {
    alt: "Growth Consulting Club",
    src: `${mediaBase}/Medpart Batch 2/Growth Consulting Club/Logo GCC.jpeg`,
    width: 1350,
    height: 1249,
  },
  {
    alt: "KMW UNDIP",
    src: `${mediaBase}/Medpart Batch 2/KMW UNDIP/Logo KMW UNDIP.jpg`,
    width: 972,
    height: 592,
  },
  {
    alt: "TSound Radio TSM",
    src: `${mediaBase}/Medpart Batch 2/TSound Radio TSM/Logo TSound Radio TSM.jpg`,
    width: 500,
    height: 500,
  },
];

function SectionHeading({
  children,
  emphasis,
}: {
  children?: ReactNode;
  emphasis?: ReactNode;
}) {
  return (
    <motion.h2
      {...revealUp}
      className="text-center font-plus-jakarta text-4xl font-bold leading-none text-white [text-shadow:0_0_20px_rgba(178,239,255,0.35)] md:text-5xl"
    >
      {children}{" "}
      {emphasis ? (
        <span className="italic text-shadow-md text-shadow-white">{emphasis}</span>
      ) : null}
    </motion.h2>
  );
}

function LogoTile({ logo, size }: { logo: PartnerLogo; size: "large" | "small" }) {
  const smallTileTone = logo.darkTile
    ? "border-white/16 bg-primary-dark"
    : "border-white/14 bg-white";

  return (
    <div
      className={
        size === "large"
          ? "flex h-24 items-center justify-center rounded-2xl border border-white/12 bg-white px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] md:h-32 md:px-7"
          : `flex h-20 min-w-[150px] items-center justify-center rounded-2xl border px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] md:h-[5.5rem] md:min-w-[190px] ${smallTileTone}`
      }
    >
      <AssetImage
        alt={`${logo.alt} logo`}
        className="max-h-[70%] w-auto object-contain"
        height={logo.height}
        sizes={size === "large" ? "(max-width: 768px) 42vw, 20vw" : "190px"}
        src={logo.src}
        width={logo.width}
      />
    </div>
  );
}

function PartnerTrack({
  logos,
  reverse,
}: {
  logos: PartnerLogo[];
  reverse?: boolean;
}) {
  const loopedLogos = [...logos, ...logos];

  return (
    <div className="overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <div
        className={`flex w-max gap-4 ${reverse ? "partner-marquee-reverse" : "partner-marquee"}`}
      >
        {loopedLogos.map((logo, index) => (
          <LogoTile
            key={`${logo.src}-${index}`}
            logo={logo}
            size="small"
          />
        ))}
      </div>
    </div>
  );
}

export default function PartnersSection() {
  const mediaRows = [
    MEDIA_PARTNERS.slice(0, Math.ceil(MEDIA_PARTNERS.length / 2)),
    MEDIA_PARTNERS.slice(Math.ceil(MEDIA_PARTNERS.length / 2)),
  ];

  return (
    <section id="partners" className="relative w-full">
      <SectionContainer className="space-y-10 py-10 md:space-y-12 md:py-16">
        <div>
          <SectionHeading emphasis="Sponsors" />
          <motion.div
            {...revealUp}
            className="mx-auto mt-6 max-w-5xl rounded-3xl border border-white/14 p-3 shadow-[inset_0_2px_0_rgba(242,242,242,0.2)] md:mt-8 md:p-5"
            style={{ backgroundImage: GRADIENTS.cardSecondary }}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {SPONSORS.map((sponsor) => (
                <LogoTile key={sponsor.src} logo={sponsor} size="large" />
              ))}
            </div>
          </motion.div>
        </div>

        <div>
          <SectionHeading emphasis="Partners">Media</SectionHeading>
          <motion.div
            {...revealUp}
            className="mt-6 space-y-2 rounded-3xl border border-white/14 py-4 shadow-[inset_0_2px_0_rgba(242,242,242,0.2)] md:mt-8 md:py-5"
            style={{ backgroundImage: GRADIENTS.cardPrimary }}
          >
            {mediaRows.map((row, index) => (
              <PartnerTrack
                key={index}
                logos={row}
                reverse={index === 1}
              />
            ))}
          </motion.div>
        </div>
      </SectionContainer>
    </section>
  );
}
