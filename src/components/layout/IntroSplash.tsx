"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IMAGES, INTRO_DONE_EVENT, INTRO_ONCE_PER_TAB, INTRO_SEEN_KEY } from "@/lib/constants";

/** Must match the .intro animation length in globals.css. */
const DURATION = 6000;
/** Reduced motion gets a plain, short hold instead of the light show. */
const DURATION_REDUCED = 700;

/** The one route the opener belongs to. */
const LANDING = "/";

/**
 * Logo opener: a red bloom, the logo pulled into focus, one light sweep and a red
 * rule drawn beneath it, then a long steady hold before it hands over to the page.
 *
 * It is server-rendered so it covers the very first paint, and it plays only on
 * a load of the landing page. Opening an upload or account page directly gets
 * straight to the point, and walking back to the home page from inside the site
 * does not replay it — the entry route is captured once, on mount.
 *
 * Nothing else has to know: the entrances that hold back for the opener look for
 * the `intro-playing` class, which is only ever set when it is really running.
 */
export default function IntroSplash() {
  const pathname = usePathname();
  // captured on mount, so later navigation cannot start the opener
  const [entryPath] = useState(pathname);
  const onLanding = entryPath === LANDING;

  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!onLanding) return;

    let seen = false;
    if (INTRO_ONCE_PER_TAB) {
      try {
        seen = sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
        sessionStorage.setItem(INTRO_SEEN_KEY, "1");
      } catch {
        /* private mode / storage blocked — just play it */
      }
    }
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Already played this tab: CSS has it hidden already, so just drop the node
    // on the next tick rather than sitting in the DOM for the whole timeline.
    const hold = seen ? 0 : reduced ? DURATION_REDUCED : DURATION;

    const root = document.documentElement;
    if (!seen) root.classList.add("intro-playing");
    const t = window.setTimeout(() => {
      root.classList.remove("intro-playing");
      // tell the page it can start: anything that animates on entry has been
      // waiting behind the overlay for this
      window.dispatchEvent(new Event(INTRO_DONE_EVENT));
      setDone(true);
    }, hold);

    return () => {
      window.clearTimeout(t);
      root.classList.remove("intro-playing");
    };
  }, [onLanding]);

  if (!onLanding || done) return null;

  return (
    <div className="intro" aria-hidden>
      <div className="intro-glow" />

      <div className="intro-logo">
        {IMAGES.logo ? (
          <Image
            src={IMAGES.logo}
            alt=""
            width={IMAGES.logoSize.width}
            height={IMAGES.logoSize.height}
            priority
            className="h-auto w-full"
          />
        ) : (
          <svg viewBox="0 0 156 40" className="h-auto w-full">
            <g fill="none" stroke="#e50914" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7 L16 33 L28 7" />
              <path d="M22 7 L34 33 L46 7" />
            </g>
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
        )}
        <span className="intro-shine" />
      </div>

      <div className="intro-line" />
    </div>
  );
}
