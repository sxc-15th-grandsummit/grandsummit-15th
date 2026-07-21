"use client";

import { motion } from "framer-motion";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AssetImage from "@/app/_components/asset-image";
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
};

// Photo shown for each included item's thumbnail row on a bundle card.
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
  },
  {
    id: 2,
    name: "Paket 2",
    price: "IDR 150k",
    description: "Kaos + Lanyard + Sticker + Keychain",
    image: "/merch/T-Shirt.png",
    items: ["Lanyard", "Sticker", "Keychain"],
  },
  {
    id: 3,
    name: "Paket 3",
    price: "IDR 160k",
    description: "Kaos + Lanyard + Enamel",
    image: "/merch/T-Shirt.png",
    items: ["Lanyard", "Enamel"],
  },
  {
    id: 4,
    name: "Paket 4 (Lengkap)",
    price: "IDR 170k",
    description: "Kaos + Lanyard + Enamel + Keychain + Sticker",
    image: "/merch/T-Shirt.png",
    items: ["Lanyard", "Enamel", "Keychain", "Sticker"],
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

function ProductCard({ product }: { product: Product }) {
  return (
    <motion.article
      {...revealUp}
      className="overflow-hidden rounded-2xl border border-white/10 text-left shadow-[inset_0_1px_0_rgba(242,242,242,0.18)]"
      style={{ backgroundImage: GRADIENTS.cardSecondary }}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden" style={{ backgroundImage: GRADIENTS.cardPrimary }}>
        {product.featured ? (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-accent-teal/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-black">
            Must Buy
          </span>
        ) : null}
        {product.image ? (
          <AssetImage
            src={product.image}
            alt={product.name}
            width={400}
            height={500}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="font-plus-jakarta text-lg font-semibold text-white">{product.name}</h3>
        {product.description ? (
          <p className="mt-1 font-poppins text-sm text-white/70">{product.description}</p>
        ) : null}
        {product.items && product.items.length > 0 ? (
          <div className="mt-2 flex gap-1.5">
            {product.items.map((item) => (
              <div key={item} className="h-9 w-9 overflow-hidden rounded-lg border border-white/15 bg-black/20">
                <AssetImage
                  src={ITEM_IMAGES[item]}
                  alt={item}
                  width={72}
                  height={72}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
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
  return (
    <main
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
