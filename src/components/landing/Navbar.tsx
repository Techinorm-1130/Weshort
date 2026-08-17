import Link from "next/link";
import Logo from "@/components/ui/Logo";
import LanguageSelect from "@/components/ui/LanguageSelect";
import { ROUTES } from "@/lib/constants";

/** Landing header: logo on the left, language + Sign In on the right (nothing else). */
export default function Navbar() {
  return (
    <header className="animate-fade-in absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-12 sm:py-5">
        <Link href={ROUTES.home} aria-label="Weshort home" className="shrink-0">
          <Logo height={28} />
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSelect compact />
          <Link
            href={ROUTES.login}
            className="whitespace-nowrap rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-hover hover:shadow-brand/40 active:scale-[0.98] sm:px-5 sm:py-2"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
