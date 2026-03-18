import Image from "next/image";

export default function AssetImage({
  alt,
  className,
  height,
  priority,
  sizes,
  src,
  width,
}: {
  alt: string;
  className?: string;
  height: number;
  priority?: boolean;
  sizes?: string;
  src: string;
  width: number;
}) {
  return (
    <Image
      draggable={false}
      alt={alt}
      className={className}
      height={height}
      priority={priority}
      sizes={sizes}
      src={src}
      width={width}
    />
  );
}
