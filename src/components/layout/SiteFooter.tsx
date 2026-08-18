import Link from "next/link";
import Logo from "@/components/ui/Logo";
import LanguageSelect from "@/components/ui/LanguageSelect";
import Reveal from "@/components/ui/Reveal";
import { SITE } from "@/lib/constants";

const COLUMNS: { label: string; href: string }[][] = [
  [
    { label: "About us", href: "#" },
    { label: "Contact", href: "#" },
  ],
  [
    { label: "Privacy", href: "#" },
    { label: "Terms & Conditions", href: "#" },
  ],
  [
    { label: "Partner", href: "#" },
    { label: "They talk about us", href: "#" },
  ],
  [
    { label: "Submit your short", href: "#" },
    { label: "Promote your festival", href: "#" },
  ],
  [
    { label: "Shortie", href: "#" },
    { label: "App", href: "#" },
  ],
];

const SOCIALS = [
  {
    label: "Facebook",
    href: "#",
    path: "M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.5 1.5-1.5h1.5V5.1c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8V11H8v3h2.6v7h2.9z",
  },
  {
    label: "Instagram",
    href: "#",
    path: "M12 7.4A4.6 4.6 0 1 0 12 16.6 4.6 4.6 0 0 0 12 7.4zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm5.9-7.8a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM12 3.6c-2.3 0-2.6 0-3.5.1-2.6.1-4.2 1.6-4.3 4.3-.1.9-.1 1.2-.1 3.5s0 2.6.1 3.5c.1 2.6 1.6 4.2 4.3 4.3.9.1 1.2.1 3.5.1s2.6 0 3.5-.1c2.6-.1 4.2-1.6 4.3-4.3.1-.9.1-1.2.1-3.5s0-2.6-.1-3.5c-.1-2.6-1.6-4.2-4.3-4.3-.9-.1-1.2-.1-3.5-.1zm0 1.6c2.3 0 2.5 0 3.4.1 1.8.1 2.8 1 2.9 2.9.1.9.1 1.1.1 3.4s0 2.5-.1 3.4c-.1 1.8-1 2.8-2.9 2.9-.9.1-1.1.1-3.4.1s-2.5 0-3.4-.1c-1.8-.1-2.8-1-2.9-2.9-.1-.9-.1-1.1-.1-3.4s0-2.5.1-3.4c.1-1.8 1-2.8 2.9-2.9.9-.1 1.1-.1 3.4-.1z",
  },
  {
    label: "LinkedIn",
    href: "#",
    path: "M6.9 8.5H4V19h2.9V8.5zM5.5 4A1.7 1.7 0 1 0 5.5 7.4 1.7 1.7 0 0 0 5.5 4zM20 12.6c0-3-1.6-4.4-3.8-4.4-1.7 0-2.5.9-3 1.6V8.5H10.4V19h2.9v-5.7c0-1.5.3-3 2.1-3s1.8 1.7 1.8 3.1V19H20v-6.4z",
  },
  {
    label: "YouTube",
    href: "#",
    path: "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z",
  },
];

/** Large faint outline of the WeShort "W" logomark used as a watermark. */
function WMark({ className }: { className: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 300"
      className={`pointer-events-none absolute text-[#2f5aa8] ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      {/* interlocking double-V, drawn as outlined bands (matches the logo geometry) */}
      <path d="M20 40 L120 260 L220 40 L190 40 L120 195 L50 40 Z" />
      <path d="M180 40 L280 260 L380 40 L350 40 L280 195 L210 40 Z" />
    </svg>
  );
}

/** WeShort-style footer: centered logo, watermark W's, link grid, socials + language, legal line. */
export default function SiteFooter() {
  return (
    <footer className="section-deep-end relative z-10 w-full shrink-0 overflow-hidden px-6 pb-10 pt-8 text-sm sm:px-12 sm:pt-12">
      {/* watermarks (desktop only — they'd sit behind the links on phones) */}
      <WMark className="hidden md:block -left-24 top-6 h-64 w-auto opacity-40 lg:-left-16 lg:h-72" />
      <WMark className="hidden md:block -right-24 top-6 h-64 w-auto opacity-40 lg:-right-16 lg:h-72" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center">
        <Reveal>
          <Link href="/" aria-label={`${SITE.name} home`}>
            <Logo height={26} />
          </Link>
        </Reveal>

        <Reveal as="nav" delay={120} className="mt-12 w-full max-w-4xl sm:mt-14">
          {/* phones: 2 columns, row order. sm+: 5 columns × 2 rows, column order (pairs). */}
          <ul className="grid grid-cols-2 gap-x-6 gap-y-4 text-center sm:grid-flow-col sm:grid-cols-5 sm:grid-rows-2 sm:gap-x-8 sm:gap-y-5 sm:text-left">
            {COLUMNS.flat().map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-[11px] font-bold uppercase tracking-wide text-white transition hover:text-white/70"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={240} className="mt-12 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 sm:mt-14 sm:gap-x-28">
          <ul className="flex items-center gap-4">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-background transition hover:bg-white/80"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d={s.path} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
          <LanguageSelect variant="plain" />
        </Reveal>

        <Reveal delay={340} distance={16} className="mt-14 flex flex-col items-center">
          <p className="max-w-3xl text-center text-[11px] leading-relaxed text-white/35">
            {SITE.legal}
          </p>
          <p className="mt-2 text-center text-xs text-white/70">
            {SITE.name} {new Date().getFullYear()} Copyright &copy; All Rights Reserved Italy
          </p>
        </Reveal>
      </div>
    </footer>
  );
}
