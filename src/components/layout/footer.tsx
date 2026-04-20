import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import BrandRow from "../brand-row";


export type FooterNavItem = {
  href: string;
  label: string;
};

type FooterAssets = {
  instagram: string;
  summitLogo: string;
  sxcLogo: string;
};

export default function Footer({
  assets,
  className,
  navItems,
}: {
  assets: FooterAssets;
  className?: string;
  navItems: ReadonlyArray<FooterNavItem>;
}) {
  return (
    <footer
      className={cn("w-full border-t border-white/10", className)}
      style={{ backgroundColor: "#011f33" }}
    >
      <div className="flex flex-col gap-5 px-4 py-5 sm:px-6 md:flex-row md:items-end md:justify-between md:px-8 md:py-6">
        <div>
          <BrandRow
            assets={assets}
            summitLogoClassName="h-10 w-9 contrast-125 saturate-125 drop-shadow-[0_0_9px_rgba(131,214,221,0.45)] md:h-16 md:w-14"
            sxcLogoClassName="h-10 w-[4.4rem] contrast-125 saturate-125 drop-shadow-[0_0_9px_rgba(131,214,221,0.45)] md:h-16 md:w-[6.4rem]"
          />
          <div className="mt-2 flex items-center gap-2 text-white/75">
            <Image
              unoptimized
              draggable={false}
              src={assets.instagram}
              alt="Instagram"
              width={19}
              height={19}
              className="h-[18px] w-[18px]"
            />
            <p className="font-poppins text-xs font-medium tracking-[0.07em]">
              @sxcgrandsummit
            </p>
          </div>
        </div>

        <nav className="grid grid-cols-2 gap-x-10 gap-y-2 font-plus-jakarta text-sm font-semibold tracking-[0.07em] text-white/85 md:text-base">
          {navItems.map((item) => (
            <Link
              key={`footer-${item.label}`}
              href={item.href}
              className="transition hover:text-accent-teal"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
