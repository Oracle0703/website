import Image from "next/image";

type BlogCoverImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

const DEFAULT_SIZES = "(max-width: 768px) 100vw, 40vw";

export function BlogCoverImage({
  src,
  alt,
  priority = false,
  sizes = DEFAULT_SIZES,
  className = ""
}: BlogCoverImageProps) {
  if (!src) return null;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={["object-cover", className].filter(Boolean).join(" ")}
    />
  );
}
