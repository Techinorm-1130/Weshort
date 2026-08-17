import Image from "next/image";
import { IMAGES } from "@/lib/constants";

type Props = {
  className?: string;
  /** Height of the logo in px (width scales). Default 32. */
  height?: number;
};

/**
 * WeShort logo: red interlocking "W" mark + "WeShort" wordmark.
 * If `IMAGES.logo` is set (a real PNG/SVG in public/images/logo/), that file is used instead.
 */
export default function Logo({ className = "", height = 32 }: Props) {
  if (IMAGES.logo) {
    return (
      <Image
        src={IMAGES.logo}
        alt="WeShort"
        width={Math.round(height * 3.9)}
        height={height}
        priority
        className={className}
        style={{ height, width: "auto" }}
      />
    );
  }

  return (
    <svg
      role="img"
      aria-label="WeShort"
      viewBox="0 0 156 40"
      style={{ height, width: "auto" }}
      className={className}
    >
      {/* red "W" mark: two overlapping V strokes */}
      <g
        fill="none"
        stroke="#e50914"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 7 L16 33 L28 7" />
        <path d="M22 7 L34 33 L46 7" />
      </g>
      {/* wordmark */}
      <text
        x="56"
        y="29"
        fontFamily='"Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif'
        fontSize="24"
        fontWeight="700"
        letterSpacing="-0.5"
        fill="#ffffff"
      >
        WeShort
      </text>
    </svg>
  );
}
