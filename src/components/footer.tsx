import Image from "next/image";
import Link from "next/link";

export type FooterNavItem = {
  href: string;
  label: string;
};

type FooterAssets = {
  instagram: string;
  summitLogo: string;
  sxcLogo: string;
};

function cn(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(" ");
}

function BrandRow({
  assets,
  summitLogoClassName,
  sxcLogoClassName,
}: {
  assets: FooterAssets;
  summitLogoClassName: string;
  sxcLogoClassName: string;
}) {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <Image
        unoptimized
        draggable={false}
        src={assets.summitLogo}
        alt="Grand Summit logo"
        width={1496}
        height={1764}
        className={cn("object-contain", summitLogoClassName)}
      />
      <Image
        unoptimized
        draggable={false}
        src={assets.sxcLogo}
        alt="StudentxCEO logo"
        width={640}
        height={640}
        className={cn("object-contain", sxcLogoClassName)}
      />
    </div>
  );
}

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
      className={cn("w-full border-t border-[#8eb8bf]/30", className)}
      style={{
        backgroundImage:
          "linear-gradient(83.74deg,rgba(36,110,121,0.81) 17.48%,rgba(207,229,231,0.81) 99.11%)",
      }}
    >
      <div className="flex flex-col gap-5 px-4 py-4 sm:px-6 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <BrandRow
            assets={assets}
            summitLogoClassName="h-10 w-9 contrast-125 saturate-125 drop-shadow-[0_0_9px_rgba(131,214,221,0.45)] md:h-30 md:w-28"
            sxcLogoClassName="h-10 w-[4.4rem] contrast-125 saturate-125 drop-shadow-[0_0_9px_rgba(131,214,221,0.45)] md:h-30 md:w-28"
          />
          <div className="mt-2 flex items-center gap-2 text-[#063250]">
            <Image
              unoptimized
              draggable={false}
              src={assets.instagram}
              alt="Instagram"
              width={19}
              height={19}
              className="h-[18px] w-[18px]"
            />
            <p className="font-poppins text-xs font-semibold tracking-[0.06em] [text-shadow:0_0_8px_rgba(213,244,246,0.45)] md:text-sm">
              sxcgrandsummit
            </p>
          </div>
        </div>

        <nav className="grid grid-cols-2 gap-x-10 gap-y-2 font-plus-jakarta text-sm font-bold tracking-[0.03em] text-[#063250] [text-shadow:0_0_8px_rgba(213,244,246,0.4)] md:text-base">
          {navItems.map((item) => (
            <Link key={`footer-${item.label}`} href={item.href} className="transition hover:text-[#0a2438]">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
