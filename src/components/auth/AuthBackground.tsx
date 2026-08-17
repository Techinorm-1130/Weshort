import Image from "next/image";
import { IMAGES } from "@/lib/constants";

/** Poster-collage backdrop for the auth pages — shown fully, no blur/tint. */
export default function AuthBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {IMAGES.authBackground ? (
        <Image
          src={IMAGES.authBackground}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="bg-navy-glow absolute inset-0" />
      )}
      {/* navy shade over the collage */}
      <div className="absolute inset-0 bg-background-dark/25" />
    </div>
  );
}
