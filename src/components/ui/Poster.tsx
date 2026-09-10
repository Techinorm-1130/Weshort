"use client";

import { useState, type ReactNode } from "react";

/**
 * Artwork that falls back when it cannot load.
 *
 * Which artwork URLs work depends on where the site is pointed. With a backend,
 * an image is uploaded and comes back as a real URL that resolves anywhere.
 * Standing alone there is nowhere to send it, so it stays an object URL — which
 * renders perfectly in the tab that made it and nowhere else.
 *
 * Refusing every `blob:` URL was wrong: it threw away the live ones along with
 * the dead. Letting the browser try and catching the failure tells the two
 * apart exactly, without having to guess from the string.
 */
export default function Poster({
  src,
  alt = "",
  className,
  fallback,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  /** Shown when there is no image, or the one there could not be loaded. */
  fallback: ReactNode;
}) {
  const [broken, setBroken] = useState(false);

  // A new src deserves a fresh attempt, so the key resets this component.
  if (!src || broken) return <>{fallback}</>;

  return (
    // a blob or an already-optimised remote URL; next/image adds nothing here
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={src}
      src={src}
      alt={alt}
      className={className}
      onError={() => setBroken(true)}
    />
  );
}
