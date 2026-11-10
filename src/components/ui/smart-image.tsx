"use client";

import Image, { type ImageLoaderProps, type ImageProps } from "next/image";
import { useState } from "react";

const FALLBACK = "/images/placeholder.svg";

/** Requests correctly sized, modern-format images straight from Unsplash's CDN. */
function remoteLoader({ src, width, quality }: ImageLoaderProps): string {
  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality ?? 75));
    return url.toString();
  }
  return src;
}

/**
 * next/image wrapper with responsive sizing and a graceful, branded fallback
 * so a missing photo never shows a broken-image icon.
 */
export function SmartImage({ src, alt, ...props }: Omit<ImageProps, "src" | "loader"> & { src: string }) {
  const [failed, setFailed] = useState(false);
  const isRemote = src.startsWith("http");
  return (
    <Image
      {...props}
      src={failed ? FALLBACK : src}
      alt={alt}
      loader={isRemote && !failed ? remoteLoader : undefined}
      unoptimized={failed || src.endsWith(".svg")}
      onError={() => setFailed(true)}
    />
  );
}
