import Link from "next/link";
import Logo from "@/components/ui/Logo";
import LanguageSelect from "@/components/ui/LanguageSelect";
import { ROUTES } from "@/lib/constants";

const LINKS = [
  { label: "Home", href: "#home" },
  { label: "Categories", href: "#categories" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#plans" },
];

/** Floating glass pill header: logo, section links, language + Sign In. */
export default function Navbar() {
  return (
    <header className="animate-fade-in fixed inset-x-0 top-0 z-40 px-4 pt-4 sm:px-8 sm:pt-5">
      <div
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-white/12 py-2 pl-5 pr-2 backdrop-blur-xl sm:pl-6"
        style={{
          background: "linear-gradient(180deg, rgba(18,18,20,0.82) 0%, rgba(6,6,8,0.72) 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.10), 0 18px 40px -22px rgba(0,0,0,0.95)",
        }}
      >
        <Link href={ROUTES.home} aria-label="Weshort home" className="shrink-0">
          <Logo height={21} />
        </Link>

        {/* section links, centred */}
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="rounded-full px-4 py-2 text-[13px] font-medium text-white/65 transition duration-300 hover:bg-white/[0.08] hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <LanguageSelect compact />
          <Link
            href={ROUTES.login}
            className="whitespace-nowrap rounded-full bg-brand px-5 py-2 text-[13px] font-semibold text-white shadow-[0_10px_26px_-10px_rgba(229,9,20,0.95),inset_0_1px_0_rgba(255,255,255,0.25)] transition duration-300 hover:bg-brand-hover active:scale-[0.98]"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
