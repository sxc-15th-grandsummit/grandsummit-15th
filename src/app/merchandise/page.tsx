"use client";

import { motion } from "framer-motion";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AssetImage from "@/app/_components/asset-image";
import { ASSETS, GRADIENTS, NAV_ITEMS, revealUp } from "@/constants";

const MERCH_FORM_URL = "https://forms.gle/5SSfnYhLmB89oMsg9";

type Product = { id: number; name: string; price: string; image?: string };

// ponytail: placeholder catalog — replace with real product names/prices/
// images (or a real data source) once available. `image` unset renders the
// gradient placeholder block below; set it and the card renders that image
// instead, no other code changes needed.
const PRODUCTS: Product[] = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  name: "Hoodie",
  price: "IDR 288.000",
}));

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
      <div className="aspect-[4/5] w-full" style={{ backgroundImage: GRADIENTS.cardPrimary }}>
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
        <p className="mt-1 font-poppins text-sm text-white/70">{product.price}</p>
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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {PRODUCTS.map((product) => (
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

        <motion.section
          {...revealUp}
          className="mt-20 rounded-3xl border border-white/10 p-8 text-center sm:p-12 md:text-right"
          style={{ backgroundImage: GRADIENTS.cardSecondary }}
        >
          <h2 className="font-plus-jakarta text-3xl font-bold text-white sm:text-4xl">
            Summit Bundles!
          </h2>
          <p className="mx-auto mt-3 max-w-md font-poppins text-sm text-white/80 md:ml-auto md:mr-0">
            Get the exclusive tee + hoodie + cap combo for a special price.
          </p>
          <p className="mt-4 font-poppins text-lg">
            <span className="text-white/50 line-through">IDR 500.000</span>{" "}
            <span className="font-bold text-accent-teal">IDR 400.000</span>
          </p>
          <a
            href={MERCH_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex rounded-full px-6 py-2.5 font-poppins text-sm font-semibold text-black"
            style={{ backgroundImage: GRADIENTS.pillLight }}
          >
            View Bundles
          </a>
        </motion.section>
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
