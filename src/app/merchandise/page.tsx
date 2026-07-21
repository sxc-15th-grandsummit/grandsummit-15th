"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AssetImage from "@/app/_components/asset-image";
import { HeroParallaxPuzzles } from "@/app/_components/hero-section";
import { ASSETS, GRADIENTS, NAV_ITEMS, revealUp } from "@/constants";

const MERCH_FORM_URL = "https://forms.gle/5SSfnYhLmB89oMsg9";

type Product = {
  id: number;
  name: string;
  price: string;
  image?: string;
  description?: string;
  featured?: boolean;
  items?: string[];
  // Photos per row, e.g. [2, 1, 1] = one row of 2 then two full-width rows.
  // Bundles only — all rows share one fixed-height box so every bundle
  // card lines up at the same height as Paket 1.
  rows?: number[];
};

// Photo shown for each add-on item, and for each extra item on a bundle card.
const ITEM_IMAGES: Record<string, string> = {
  Lanyard: "/merch/Lanyard.png",
  Sticker: "/merch/Sticker.png",
  Keychain: "/merch/Keychain.png",
  Enamel: "/merch/Enamel.png",
};

const BUNDLES: Product[] = [
  {
    id: 1,
    name: "Paket 1 (Wajib)",
    price: "IDR 140k",
    description: "Kaos + Lanyard",
    image: "/merch/T-Shirt.png",
    featured: true,
    items: ["Lanyard"],
    rows: [1, 1],
  },
  {
    id: 2,
    name: "Paket 2",
    price: "IDR 150k",
    description: "Kaos + Lanyard + Sticker + Keychain",
    image: "/merch/T-Shirt.png",
    items: ["Lanyard", "Sticker", "Keychain"],
    rows: [2, 1, 1],
  },
  {
    id: 3,
    name: "Paket 3",
    price: "IDR 160k",
    description: "Kaos + Lanyard + Enamel",
    image: "/merch/T-Shirt.png",
    items: ["Lanyard", "Enamel"],
    rows: [1, 1, 1],
  },
  {
    id: 4,
    name: "Paket 4 (Lengkap)",
    price: "IDR 170k",
    description: "Kaos + Lanyard + Enamel + Keychain + Sticker",
    image: "/merch/T-Shirt.png",
    items: ["Lanyard", "Enamel", "Keychain", "Sticker"],
    rows: [2, 2, 1],
  },
];

const ADD_ONS: Product[] = [
  { id: 5, name: "Sticker", price: "IDR 10k", image: "/merch/Sticker.png" },
  { id: 6, name: "Keychain", price: "IDR 15k", image: "/merch/Keychain.png" },
  { id: 7, name: "Enamel", price: "IDR 35k", image: "/merch/Enamel.png" },
];

const WHY_BUY = [
  {
    title: "Limited Edition",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10">
        <rect x="3" y="8" width="18" height="13" rx="1" />
        <path d="M3 8h18M12 8v13M12 8c-1.5-3-6-3-6 0M12 8c1.5-3 6-3 6 0" />
      </svg>
    ),
  },
  {
    title: "Premium Quality",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10">
        <circle cx="12" cy="8" r="5" />
        <path d="M8.5 12.5 7 21l5-2.5 5 2.5-1.5-8.5" />
      </svg>
    ),
  },
  {
    title: "Support Community",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10">
        <circle cx="8" cy="9" r="3" />
        <circle cx="16" cy="9" r="3" />
        <path d="M2 20c0-3 2.5-5 6-5s6 2 6 5M10 20c0-3 2.5-5 6-5s6 2 6 5" />
      </svg>
    ),
  },
];

// Splits photos into rows per a [2, 1, 1] -style pattern (photos per row).
function groupPhotosByRow(photos: string[], rows: number[]): string[][] {
  const groups: string[][] = [];
  let cursor = 0;
  for (const count of rows) {
    groups.push(photos.slice(cursor, cursor + count));
    cursor += count;
  }
  return groups;
}

function ProductCard({ product }: { product: Product }) {
  const photos = [product.image, ...(product.items ?? []).map((item) => ITEM_IMAGES[item])].filter(
    (src): src is string => Boolean(src)
  );
  const rowGroups = product.rows ? groupPhotosByRow(photos, product.rows) : [photos];

  return (
    <motion.article
      {...revealUp}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 text-left shadow-[inset_0_1px_0_rgba(242,242,242,0.18)]"
      style={{ backgroundImage: GRADIENTS.cardSecondary }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{
          backgroundImage: GRADIENTS.cardPrimary,
          // Bundles (rows set) share one fixed ratio so every card's photo
          // box is the same height as Paket 1's, however many rows it has.
          aspectRatio: product.rows ? "1 / 2" : "1 / 1",
        }}
      >
        {product.featured ? (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-accent-teal/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-black">
            Must Buy
          </span>
        ) : null}
        <div className="flex h-full flex-col gap-1 p-3">
          {rowGroups.map((group, rowIndex) => (
            <div key={rowIndex} className="flex flex-1 gap-1">
              {group.map((src, index) => (
                <div key={src + index} className="flex flex-1 items-center justify-center p-2">
                  <AssetImage
                    src={src}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="h-full w-full object-contain"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-plus-jakarta text-lg font-semibold text-white">{product.name}</h3>
        {product.description ? (
          <p className="mt-1 font-poppins text-sm text-white/70">{product.description}</p>
        ) : null}
        <p className="mt-2 font-poppins text-sm font-semibold text-accent-teal">{product.price}</p>
        <a
          href={MERCH_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex rounded-full px-5 py-1.5 font-poppins text-xs font-semibold text-black"
          style={{ backgroundImage: GRADIENTS.pillLight }}
        >
          Buy Now
        </a>
      </div>
    </motion.article>
  );
}

export default function MerchandisePage() {
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
      <Header
        navItems={NAV_ITEMS}
        assets={{ summitLogo: ASSETS.heroLogo, sxcLogo: ASSETS.sxcLogo }}
      />
      <HeroParallaxPuzzles targetRef={pageRef} />

      {/* Decorative cross ornaments — pointer-events-none, z-0 so they always
          sit behind the z-10 content below regardless of DOM overlap. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
        className="pointer-events-none absolute z-0 hidden select-none md:block"
        style={{ left: "-2.5rem", top: "16vh", width: "6rem" }}
      >
        <AssetImage src="/merch/group-97.png" alt="" width={159} height={186} className="h-auto w-full" />
      </motion.div>
      <motion.div
        aria-hidden
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 0.85, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
        className="pointer-events-none absolute z-0 hidden select-none md:block"
        style={{ right: "-2rem", top: "95vh", width: "9rem" }}
      >
        <AssetImage src="/merch/group-100.png" alt="" width={281} height={317} className="h-auto w-full" />
      </motion.div>

      <div className="relative z-10 px-4 pb-20 pt-28 sm:px-6 md:px-20 md:pt-32">
        <section className="flex flex-col items-center text-center">
          <motion.div {...revealUp}>
            <AssetImage
              src={ASSETS.heroLogo}
              alt="15th Grand Summit StudentsxCEOs"
              width={1496}
              height={1764}
              sizes="(max-width: 768px) 60vw, 24rem"
              className="mx-auto h-auto w-[min(60vw,24rem)]"
            />
          </motion.div>
          <motion.h1
            {...revealUp}
            className="mt-2 font-plus-jakarta text-4xl font-bold text-accent-teal sm:text-5xl md:text-6xl"
          >
            Merchandise
          </motion.h1>
          <motion.p
            {...revealUp}
            className="mt-4 max-w-2xl font-poppins text-sm text-white/80 sm:text-base"
          >
            Represent the spirit of Authentic Leadership. Exclusive designs for the 15th Grand Summit.
          </motion.p>
          <motion.a
            {...revealUp}
            href="#collection"
            className="mt-6 inline-flex rounded-full px-6 py-2.5 font-poppins text-sm font-semibold text-black"
            style={{ backgroundImage: GRADIENTS.pillLight }}
          >
            Shop Collection
          </motion.a>
        </section>

        <section id="collection" className="mt-16 scroll-mt-24">
          <div className="flex flex-col gap-3 text-center">
            <p className="font-poppins text-sm uppercase tracking-[0.28em] text-accent-teal/90">
              Available bundles
            </p>
            <h2 className="font-plus-jakarta text-3xl font-bold text-white sm:text-4xl">
              Choose your merch bundle
            </h2>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {BUNDLES.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="flex flex-col gap-3 text-center">
            <p className="font-poppins text-sm uppercase tracking-[0.28em] text-accent-teal/90">
              Add-ons
            </p>
            <h2 className="font-plus-jakarta text-3xl font-bold text-white sm:text-4xl">
              Need a little extra?
            </h2>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {ADD_ONS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="mt-20">
          <motion.h2
            {...revealUp}
            className="text-center font-plus-jakarta text-3xl font-bold text-accent-teal sm:text-4xl"
          >
            Why Buy?
          </motion.h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {WHY_BUY.map((item) => (
              <motion.div
                key={item.title}
                {...revealUp}
                className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 px-6 py-10 text-center"
                style={{ backgroundImage: GRADIENTS.cardSecondaryAlt }}
              >
                {item.icon}
                <p className="font-plus-jakarta text-lg font-bold text-white">{item.title}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      <div className="relative z-10 mt-10">
        <Footer
          navItems={NAV_ITEMS}
          assets={{ summitLogo: ASSETS.heroLogo, sxcLogo: ASSETS.sxcLogo, instagram: ASSETS.instagram }}
        />
      </div>
    </main>
  );
}
