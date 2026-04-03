import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandAssets = {
  summitLogo: string;
  sxcLogo: string;
};

export default function BrandRow({
  assets,
  summitLogoClassName,
  sxcLogoClassName,
}: {
  assets: BrandAssets;
  summitLogoClassName: string;
  sxcLogoClassName: string;
}) {
  return (
    <Link href="/" className="flex items-center gap-2 md:gap-3">
      <Image
        draggable={false}
        src={assets.summitLogo}
        alt="Grand Summit logo"
        width={1496}
        height={1764}
        className={cn("object-contain", summitLogoClassName)}
      />
      <Image
        draggable={false}
        src={assets.sxcLogo}
        alt="StudentxCEO logo"
        width={640}
        height={640}
        className={cn("object-contain", sxcLogoClassName)}
      />
    </Link>
  );
}
