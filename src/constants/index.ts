export type NavItem = {
  href: string;
  label: string;
};

export type CategoryItem = {
  label: string;
};

export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { label: "Registration", href: "#registration" },
  { label: "Competition", href: "#category" },
  { label: "Events", href: "#category" },
  { label: "Merch", href: "#category" },
];

export const CATEGORY_ITEMS: ReadonlyArray<CategoryItem> = [
  { label: "Competition" },
  { label: "Events" },
  { label: "Merch" },
];

export const MISSION_POINTS = [
  "To develop students critical thinking, creativity, and transparency-driven leadership through practical business exposure.",
  "To bridge students and companies by delivering educational programs, competitions, and industry engagement activities that emphasize human-centric and sustainable innovation.",
];

export const ASSETS = {
  heroLogo: "/grand-summit-logo.png",
  sxcLogo: "/sxc-logo.png",
  puzzleLeft: "/puzzle-left.png",
  puzzleLeftAlt: "/puzzle-left2.png",
  puzzleRight: "/puzzle-right.png",
  instagram: "/assets/home/instagram.svg",
};

export const GRADIENTS = {
  page: "url('/background.png')",
  cardPrimary:
    "linear-gradient(180deg,rgba(10,59,86,0.5) 22.31%,rgba(87,174,165,0.5) 135.28%)",
  cardSecondary:
    "linear-gradient(132.88deg,rgba(6,50,80,0.5) 10.96%,rgba(48,114,124,0.5) 97.54%)",
  cardSecondaryAlt:
    "linear-gradient(115.72deg,rgba(6,50,80,0.5) 14.96%,rgba(48,114,124,0.5) 95.28%)",
  footer:
    "linear-gradient(83.74deg,rgba(36,110,121,0.81) 17.48%,rgba(207,229,231,0.81) 99.11%)",
  pillLight: "linear-gradient(90.26deg,#8ae2d9 0%,#ffffff 60.3%)",
  badgeLabel: "linear-gradient(180deg,#0b4972 0%,#063250 100%)",
  pillGradient: "linear-gradient(90deg,#8ee1d8 0%,#f6f6f6 100%)",
  valuesRow:
    "linear-gradient(90deg,rgba(112,214,205,0.88) 0%,rgba(68,121,141,0.94) 42%,rgba(95,171,188,0.9) 100%)",
};

export const COPY = {
  heroTagline:
    "Authentic Ascendance: Advancing Leadership through Transparency and Human-Centric Innovation",
  objective:
    "To provide a collaborative platform for Indonesian university students and industry leaders\nto develop transparent, innovative, human-centric solutions to real business challenges.",
  keywords:
    "Human-Centric Innovation • Authenticity In Leadership\nSustainable Value Creation • Collaboration • Transparency",
  values: "Integrity • Collaboration • Innovation",
};

export const revealUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.75, ease: "easeOut" as const },
  viewport: { once: true, amount: 0.25 },
};
