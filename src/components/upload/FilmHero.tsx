"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EDGE } from "@/components/upload/edge";
import { INTRO_DONE_EVENT, ROUTES } from "@/lib/constants";

/** Films already on the shelf, shown as the strip that closes the hero. */
const SELECTED = [
  { title: "Money Heist", meta: "Drama · 18′", poster: "/images/backgrounds/posters/poster1.jpg" },
  { title: "Nowhere", meta: "Thriller · 22′", poster: "/images/backgrounds/posters/poster3.jpg" },
  { title: "Fall", meta: "Survival · 14′", poster: "/images/backgrounds/posters/poster2.jpg" },
  { title: "Peaky Blinders", meta: "Period · 27′", poster: "/images/backgrounds/posters/poster4.jpg" },
  { title: "Rebel Ridge", meta: "Thriller · 19′", poster: "/images/backgrounds/object1.png" },
  { title: "Uglies", meta: "Sci-fi · 16′", poster: "/images/backgrounds/object3.png" },
];

/** What a film-maker actually wants to know, set as a title card's credit line. */
const CREDITS = [
  { label: "Rights", value: "You keep them" },
  { label: "Decision", value: "3 weeks" },
  { label: "Revenue share", value: "70%" },
];

/** The beats, in milliseconds from the hero being cleared to run. */
const CUE = { still: 0, genres: 200, title: 320, credits: 460, lede: 580, buttons: 700, row: 880 };

const EASE = "cubic-bezier(.22,.61,.36,1)";

/**
 * The chamfer for this page. The catalogue row on the production-house page cuts
 * its top-right and bottom-left; this cuts the opposite pair, so the two pages
 * read as the same system without being the same component.
 */
const NOTCH = "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)";

/**
 * The producer and director opener: a still running the full screen with the
 * pitch set over its dark side, laid out like a title page — genres, title,
 * credit line, synopsis, actions — and closed by a strip of films already on the
 * shelf.
 *
 * Two gates decide when it animates. The logo opener covers the page on load, so
 * the first play waits for it to hand over; after that an observer takes over so
 * scrolling back replays it.
 */
export default function FilmHero() {
  const section = useRef<HTMLElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [live, setLive] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      const t = window.setTimeout(() => setStill(true), 0);
      return () => window.clearTimeout(t);
    }

    const arm = () => setArmed(true);

    if (document.documentElement.classList.contains("intro-playing")) {
      window.addEventListener(INTRO_DONE_EVENT, arm, { once: true });
      return () => window.removeEventListener(INTRO_DONE_EVENT, arm);
    }

    const t = window.setTimeout(arm, 20);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = section.current;
    if (!el || still) return;

    const io = new IntersectionObserver(([entry]) => setLive(entry.isIntersecting), {
      threshold: 0.15,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [still]);

  const page = (dir: 1 | -1) => {
    const el = strip.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step * 3, behavior: "smooth" });
  };

  const shown = (armed && live) || still;
  const enter = (delay: number, from: "left" | "below" = "left", distance = 40) => ({
    opacity: shown ? 1 : 0,
    transform: shown
      ? "translate(0,0)"
      : from === "left"
        ? `translateX(-${distance}px)`
        : `translateY(${distance}px)`,
    transition: still
      ? "none"
      : `opacity 620ms linear ${delay}ms, transform 840ms ${EASE} ${delay}ms`,
  });

  return (
    <section ref={section} className="relative flex min-h-[100svh] w-full flex-col overflow-hidden pb-8 sm:pb-10">
      {/* Two subjects centred against a bright sky — the opposite problem to the
          near-black art it replaced. The frame is nudged right so the faces clear
          the copy column, and the scrim below is heavy again: white type needs
          something solid behind it when the picture is this light. */}
      <div className="absolute inset-y-0 left-[10%] right-[-10%]">
        <Image
          src="/images/production house posters/4K Celebrity Wallpapers _ BlakeVelocity.jpg"
          alt=""
          fill
          priority
          sizes="90vw"
          className="object-cover object-[56%_42%]"
          style={{
            transform: shown ? "scale(1)" : "scale(1.07)",
            transition: still ? "none" : `transform 1900ms ${EASE} ${CUE.still}ms`,
          }}
        />
      </div>

      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#000_0%,#000_16%,rgba(0,0,0,0.88)_38%,rgba(0,0,0,0.5)_64%,rgba(0,0,0,0.15)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[52%] bg-[linear-gradient(0deg,#000_0%,rgba(0,0,0,0.92)_28%,transparent_100%)]" />
        <div className="absolute inset-x-0 top-0 h-[26%] bg-[linear-gradient(180deg,rgba(0,0,0,0.85),transparent)]" />
      </div>

      <div className={`relative flex flex-1 flex-col justify-end pb-5 pt-28 ${EDGE}`}>
        <div className="max-w-xl">
          {/* what we take, in the register a title page uses for genres */}
          <p
            className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-white/70"
            style={enter(CUE.genres)}
          >
            {["Short film", "Documentary", "Animation"].map((g, i) => (
              <span key={g} className="flex items-center gap-3">
                {i > 0 && <span className="text-white/25">|</span>}
                {g}
              </span>
            ))}
          </p>

          <h1
            className="mt-2.5 text-[2.1rem] font-black leading-[1] tracking-[-0.03em] sm:text-[2.9rem]"
            style={enter(CUE.title, "left", 52)}
          >
            Upload your film
          </h1>

          {/* the credit line — the three answers a film-maker looks for first */}
          <div
            className="mt-3 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[12.5px]"
            style={enter(CUE.credits)}
          >
            {CREDITS.map((c, i) => (
              <span key={c.label} className="flex items-center gap-4">
                {i > 0 && <span className="text-white/20">|</span>}
                <span>
                  <span className="font-semibold uppercase tracking-[0.12em] text-white/55">
                    {c.label}:
                  </span>{" "}
                  <span className="font-semibold text-white">{c.value}</span>
                </span>
              </span>
            ))}
          </div>

          <p className="mt-4 max-w-md text-[13.5px] leading-relaxed text-white/65" style={enter(CUE.lede)}>
            Send one film or a handful. Two programmers watch every submission in full, you hear back
            inside three weeks, and the licence is non-exclusive — festivals, sales and screenings
            all stay open to you.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2.5" style={enter(CUE.buttons, "left", 32)}>
            <Link
              href={ROUTES.submitAsDirector}
              className="group inline-flex items-center gap-2.5 rounded bg-brand px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.1em] text-white shadow-[0_16px_36px_-14px_rgba(229,9,20,0.95)] transition duration-300 hover:bg-brand-hover active:scale-[0.99]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4M7 9l5-5 5 5" />
                <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
              </svg>
              Upload your film
            </Link>

            <Link
              href="#specs"
              className="inline-flex items-center rounded border border-white/25 px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.1em] text-white/90 backdrop-blur-md transition duration-300 hover:border-white/50 hover:bg-white/[0.08]"
            >
              Submission specs
            </Link>
          </div>

          <p className="mt-4 text-[12.5px] text-white/45" style={enter(CUE.buttons + 120, "left", 24)}>
            Placing a whole catalogue?{" "}
            <Link
              href={ROUTES.uploadProductionHouse}
              className="font-semibold text-white underline-offset-4 hover:underline"
            >
              Use the production house route
            </Link>
          </p>
        </div>
      </div>

      {/* what is already on the shelf */}
      <div className="relative shrink-0" style={enter(CUE.row, "below", 28)}>
        {/* the arrows belong beside the heading, not out at the page edge —
            pushed right they end up floating over the picture */}
        <div className={`flex items-center gap-5 ${EDGE}`}>
          <h2 className="flex items-center gap-2.5 text-[12px] font-bold uppercase tracking-[0.18em] text-white/85">
            <span className="animate-blink h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px_rgba(229,9,20,0.9)]" />
            Selected this week
          </h2>
          <span className="hidden font-mono text-[10.5px] tabular-nums tracking-[0.2em] text-white/30 sm:block">
            {String(SELECTED.length).padStart(2, "0")}
          </span>
          <div className="flex shrink-0 gap-2">
            {([-1, 1] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => page(dir)}
                aria-label={dir === -1 ? "Previous films" : "Next films"}
                className="flex h-7 w-7 items-center justify-center border border-white/25 text-white/70 backdrop-blur-md transition duration-300 hover:border-brand/80 hover:bg-brand/10 hover:text-white"
                style={{ clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)" }}
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={dir === -1 ? "m15 18-6-6 6-6" : "m9 6 6 6-6 6"} />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div
          ref={strip}
          className={`mt-3 flex snap-x snap-mandatory scroll-pl-8 gap-4 overflow-x-auto scroll-smooth pb-2 sm:scroll-pl-14 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${EDGE}`}
        >
          {SELECTED.map((f, i) => (
            <article key={f.title} className="group w-[7.25rem] shrink-0 snap-start sm:w-[8.5rem]">
              <div
                className="relative aspect-[3/4] overflow-hidden bg-black ring-1 ring-white/12 transition duration-500 group-hover:ring-brand/60 group-hover:shadow-[0_0_30px_-10px_rgba(229,9,20,0.9)]"
                style={{ clipPath: NOTCH }}
              >
                <Image
                  src={f.poster}
                  alt=""
                  fill
                  sizes="160px"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />

                {/* readout grid, held back until the card is looked at */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_top,#000,transparent_70%)]"
                />

                {/* two ticks on the square corners, opposite the cut ones */}
                {["right-1.5 top-1.5 border-r border-t", "left-1.5 bottom-1.5 border-l border-b"].map((pos) => (
                  <span
                    key={pos}
                    aria-hidden
                    className={`pointer-events-none absolute h-2.5 w-2.5 border-white/40 transition-colors duration-300 group-hover:border-brand ${pos}`}
                  />
                ))}

                {/* the readout lives on the artwork, not under it */}
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-[linear-gradient(0deg,rgba(0,0,0,0.92),transparent)] px-2 pb-2 pt-7">
                  <span className="font-mono text-[9.5px] tabular-nums tracking-[0.12em] text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-white/70">
                    {f.meta.split("·")[1]?.trim()}
                  </span>
                </span>
              </div>

              <p className="mt-2.5 truncate text-[12.5px] font-medium">{f.title}</p>
              <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
                {f.meta.split("·")[0]?.trim()}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
