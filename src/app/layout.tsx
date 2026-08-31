import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import IntroSplash from "@/components/layout/IntroSplash";
import { INTRO_ONCE_PER_TAB, INTRO_SEEN_KEY } from "@/lib/constants";
import "./globals.css";

/**
 * Runs before the first paint: if the opener already played in this tab, mark the
 * document so CSS hides the overlay outright — otherwise it would flash for a
 * frame before React could remove it. Empty while INTRO_ONCE_PER_TAB is false,
 * because then the opener is meant to play on every load.
 */
const INTRO_SEEN_SCRIPT = INTRO_ONCE_PER_TAB
  ? `try{if(sessionStorage.getItem(${JSON.stringify(
      INTRO_SEEN_KEY,
    )})==="1")document.documentElement.classList.add("intro-seen")}catch(e){}`
  : "";

// Body / subtext font. Headings use "Netflix Sans" (self-hosted via @font-face
// in globals.css — files go in public/fonts/).
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Weshort",
    template: "%s | Weshort",
  },
  description: "Watch short movies, series and more on Weshort.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: INTRO_SEEN_SCRIPT adds `intro-seen` to <html>
    // before React hydrates — a deliberate server/client difference.
    <html lang="en" className={`${manrope.variable} antialiased`} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: INTRO_SEEN_SCRIPT }} />
        <IntroSplash />
        <div className="page-clip relative flex min-h-screen flex-col">{children}</div>
      </body>
    </html>
  );
}
