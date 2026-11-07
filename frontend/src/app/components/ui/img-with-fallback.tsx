import { useState } from "react";

const FALLBACK = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop";

export function ImgWithFallback({ src, alt, className, priority }: { src: string; alt: string; className?: string; priority?: boolean }) {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setImgSrc(FALLBACK)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}