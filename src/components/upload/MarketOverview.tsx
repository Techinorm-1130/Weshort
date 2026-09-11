"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * The market case: the argument on the left, one chart on the right.
 *
 * The chart is two blocks whose heights carry the comparison, so the growth is
 * read as shape before any number is read as text — the figures only confirm
 * what the silhouette already said. Built from divs and one SVG rather than a
 * chart library: at two data points a library would cost more than it explains.
 * Both blocks are solid black, separated by their edges rather than their fill:
 * red for the earlier figure, white for the later one. Keeping the bodies the
 * same material is what lets the heights do the talking.
 *
 * It builds itself in the order the argument is made: the copy arrives from the
 * left, then the blocks grow up out of the baseline with the climb drawing across
 * them at the same time, and the reading lands once both have settled. Everything runs off one observer
 * so the beats stay in step with each other, and it replays whenever the section
 * is scrolled back to.
 */

const FIGURES = {
  from: { label: "Short-form OTT revenue", value: "$270", unit: "million", year: "2019" },
  to: { label: "Short-form OTT revenue", value: "$5.0", unit: "billion", year: "2027" },
  cagr: "42.5%",
  multiple: "18×",
};

/** The beats, in milliseconds from the section coming into view. */
/** The climb starts with the blocks, not after them: they draw together. */
const CUE = { copy: 0, barA: 620, barB: 760, arrow: 620, reading: 1620 };

const EASE = "cubic-bezier(.22,.61,.36,1)";

/** Faint rules behind the blocks, so the heights are measured rather than guessed. */
function Grid() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {[0, 25, 50, 75].map((t) => (
        <span
          key={t}
          className="absolute inset-x-0 h-px bg-gradient-to-r from-white/[0.09] via-white/[0.06] to-transparent"
          style={{ top: `${t}%` }}
        />
      ))}
    </div>
  );
}

export default function MarketOverview() {
  const section = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const el = section.current;
    if (!el) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reduced motion: show the finished state on the next tick rather than
    // synchronously, which would cascade a second render out of this effect.
    if (reduced) {
      const t = window.setTimeout(() => setStill(true), 0);
      return () => window.clearTimeout(t);
    }

    const io = new IntersectionObserver(([entry]) => setLive(entry.isIntersecting), {
      threshold: 0.25,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const on = live || still;
  /** Grows a block up out of the baseline. */
  const rise = (delay: number) => ({
    transform: on ? "scaleY(1)" : "scaleY(0)",
    transformOrigin: "bottom",
    transition: still ? "none" : `transform 780ms ${EASE} ${delay}ms`,
  });
  /** Fades a thing in on its cue. */
  const appear = (delay: number, shift = "translateY(10px)") => ({
    opacity: on ? 1 : 0,
    transform: on ? "translate(0,0)" : shift,
    transition: still ? "none" : `opacity 600ms linear ${delay}ms, transform 700ms ${EASE} ${delay}ms`,
  });

  return (
    <section ref={section} className="relative px-6 py-20 sm:px-12 sm:py-28">
      {/* one red bloom behind the chart, so the panel sits in light rather than on black */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[6%] top-1/2 h-[46vmin] w-[46vmin] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(229,9,20,0.16),transparent_70%)] blur-[90px]"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        {/* the argument — arrives first, from the left */}
        <div
          style={{
            opacity: on ? 1 : 0,
            transform: on ? "translateX(0)" : "translateX(-56px)",
            transition: still
              ? "none"
              : `opacity 700ms linear ${CUE.copy}ms, transform 900ms ${EASE} ${CUE.copy}ms`,
          }}
        >
          <p className="flex items-center gap-2.5 font-mono text-[10.5px] uppercase tracking-[0.3em] text-brand">
            <span className="h-px w-8 bg-brand" />
            The market
          </p>

          <h2 className="mt-5 text-[2.1rem] font-black uppercase leading-[1.05] tracking-[-0.02em] sm:text-[3rem]">
            Overview of the
            <span className="block text-white/45">short-film market</span>
          </h2>

          <p className="mt-7 max-w-md text-[14.5px] leading-relaxed text-white/55">
            Short-form is the fastest-growing shelf in streaming, and the catalogues being placed
            now are the ones that will hold those slots. We licence for the long term rather than
            the launch week.
          </p>

          <p className="mt-5 max-w-md text-[14.5px] leading-relaxed text-white/55">
            Bring your slate while the shelf is still being built, and your titles grow with it
            instead of arriving to a full house.
          </p>

          <Link
            href="#contact"
            className="group mt-9 inline-flex items-center gap-3 bg-brand px-7 py-3.5 text-[13.5px] font-semibold text-white shadow-[0_18px_44px_-18px_rgba(229,9,20,0.95)] transition duration-300 hover:bg-brand-hover active:scale-[0.99]"
          >
            Partner with us
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>

        {/* the chart */}
        <figure className="m-0">
          <figcaption
            className="mb-5 flex items-baseline justify-between gap-6 border-b border-edge/40 pb-3"
            style={appear(CUE.barA)}
          >
            <span className="max-w-[16rem] text-[11.5px] leading-snug text-white/40">
              Over-the-top (OTT) short-form revenue, worldwide
            </span>
            <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/25">
              2019 — 2027
            </span>
          </figcaption>

          <div className="relative">
            {/* The climb is dotted, so it cannot be drawn with a dash offset — the
                dashes are the look. It is wiped in from the left instead, which
                reads the same and keeps the dotted texture intact. */}
            <div
              className="absolute inset-x-0 -top-1 h-[7.5rem]"
              style={{
                clipPath: on ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
                transition: still ? "none" : `clip-path 900ms ${EASE} ${CUE.arrow}ms`,
              }}
            >
              <svg viewBox="0 0 320 120" className="h-full w-full" fill="none" aria-hidden>
                <path d="M14 108 C 120 106, 196 78, 236 14" stroke="rgba(255,255,255,0.65)" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="1 5" />
                <path d="M236 14 l-9 15 m9-15 l-16 4" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>

            <div className="relative pt-[7.5rem]">
              <div className="absolute left-0 top-[3.9rem]" style={appear(CUE.reading)}>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">CAGR</p>
                <p className="mt-1 text-[1.5rem] font-bold leading-none tracking-tight tabular-nums">
                  {FIGURES.cagr}
                </p>
                <p className="mt-2 inline-block border border-brand/40 bg-brand/10 px-2 py-0.5 font-mono text-[10px] tracking-[0.16em] text-brand">
                  {FIGURES.multiple} GROWTH
                </p>
              </div>

              <div className="relative flex h-[15rem] items-end sm:h-[17rem]">
                <Grid />

                {/* earlier, smaller — black body, red edge and red label */}
                <div
                  className="relative flex h-[58%] flex-1 flex-col justify-end overflow-hidden border border-brand/50 bg-[linear-gradient(180deg,#2a0508_0%,#0b0304_100%)] p-5 shadow-[0_26px_50px_-30px_rgba(229,9,20,0.7)] sm:p-6"
                  style={rise(CUE.barA)}
                >
                  <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-brand" />
                  <p className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-brand">
                    {FIGURES.from.label}
                  </p>
                  <p className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-[1.7rem] font-bold leading-none tracking-tight tabular-nums sm:text-[2rem]">
                      {FIGURES.from.value}
                    </span>
                    <span className="text-[12.5px] font-medium text-white/60">{FIGURES.from.unit}</span>
                  </p>
                  <p className="mt-3 font-mono text-[11.5px] tracking-[0.16em] text-white/45 tabular-nums">
                    {FIGURES.from.year}
                  </p>
                </div>

                {/* later, larger — black body with a white edge, so the pair reads
                    as one material lit two ways rather than two colours */}
                <div
                  className="relative flex h-full flex-1 flex-col justify-end overflow-hidden border border-edge/50 bg-[linear-gradient(180deg,#17171a_0%,#0a0a0c_100%)] p-5 shadow-[0_30px_60px_-32px_rgba(0,0,0,0.95)] sm:p-6"
                  style={rise(CUE.barB)}
                >
                  <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-white/70" />
                  <p className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-white/70">
                    {FIGURES.to.label}
                  </p>
                  <p className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-[1.7rem] font-bold leading-none tracking-tight tabular-nums sm:text-[2rem]">
                      {FIGURES.to.value}
                    </span>
                    <span className="text-[12.5px] font-medium text-white/60">{FIGURES.to.unit}</span>
                  </p>
                  <p className="mt-3 font-mono text-[11.5px] tracking-[0.16em] text-white/45 tabular-nums">
                    {FIGURES.to.year}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </figure>
      </div>
    </section>
  );
}
