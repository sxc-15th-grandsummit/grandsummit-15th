import Image from "next/image";

export default function AssetImage({
  alt,
  className,
  height,
  priority,
  quality,
  sizes,
  src,
  unoptimized,
  width,
}: {
  alt: string;
  className?: string;
  height: number;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  src: string;
  unoptimized?: boolean;
  width: number;
}) {
  return (
    <Image
      draggable={false}
      alt={alt}
      className={className}
      height={height}
      priority={priority}
      quality={quality}
      sizes={sizes}
      src={src}
      unoptimized={unoptimized}
      width={width}
    />
  );
}
