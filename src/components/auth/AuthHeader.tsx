import Link from "next/link";
import Logo from "@/components/ui/Logo";
import LanguageSelect from "@/components/ui/LanguageSelect";
import { ROUTES } from "@/lib/constants";

export default function AuthHeader() {
  return (
    <header className="animate-fade-in relative z-10 w-full">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-12">
        <Link href={ROUTES.home} aria-label="Weshort home">
          <Logo />
        </Link>
        <LanguageSelect />
      </div>
    </header>
  );
}
