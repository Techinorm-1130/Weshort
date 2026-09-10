"use client";

import Image from "next/image";
import { useRef } from "react";
import { EDGE } from "@/components/upload/edge";

export type SlateTitle = {
  title: string;
  poster: string;
  rating: string;
  year: string;
  genre: string;
  runtime: string;
  stars: number;
};

/**
 * Score as a segmented meter rather than five stars: it reads at a glance, the
 * value is stated outright, and it belongs to the same instrument-panel language
 * as the rest of the card.
 */
function Meter({ value }: { value: number }) {
  const lit = Math.round((value / 5) * 6);
  return (
    <span className="flex shrink-0 items-center gap-2" aria-label={`Score ${value} of 5`}>
      <span className="flex gap-[3px]">
        {Array.from({ length: 6 }, (_, i) => (
          <span
            key={i}
            className={`h-3 w-[3px] skew-x-[-18deg] ${
              i < lit ? "bg-brand shadow-[0_0_8px_rgba(229,9,20,0.8)]" : "bg-white/15"
            }`}
          />
        ))}
      </span>
      <span className="font-mono text-[11px] tabular-nums text-white/70">{value.toFixed(1)}</span>
    </span>
  );
}

/** Corner ticks framing each still, which pick up the brand red on hover. */
function Brackets() {
  const corners = [
    "left-2 top-2 border-l border-t",
    "right-2 top-2 border-r border-t",
    "left-2 bottom-2 border-l border-b",
    "right-2 bottom-2 border-r border-b",
  ];
  return (
    <>
      {corners.map((pos) => (
        <span
          key={pos}
          aria-hidden
          className={`pointer-events-none absolute h-3.5 w-3.5 border-white/35 transition-colors duration-300 group-hover:border-brand ${pos}`}
        />
      ))}
    </>
  );
}

/**
 * The catalogue row that closes the hero, in an instrument-panel register: each
 * still sits in a notched frame with corner ticks, a catalogue reference and a
 * scan that runs across it on hover.
 *
 * The strip is a real scroll container rather than a transformed track, so a
 * trackpad, a touch screen and the keyboard all work; the arrows only page it.
 * `scroll-pl` keeps the snap line on the page edge — without it, mandatory
 * snapping aligns the first card to the scrollport and eats the padding.
 */
export default function SlateRow({
  heading,
  titles,
}: {
  heading: string;
  titles: SlateTitle[];
}) {
  const strip = useRef<HTMLDivElement>(null);

  const page = (dir: 1 | -1) => {
    const el = strip.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  return (
    <div>
      <div className={`flex items-end justify-between gap-6 ${EDGE}`}>
        <div>
          <p className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.3em] text-white/40">
            <span className="animate-blink h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px_rgba(229,9,20,0.9)]" />
            Catalogue · live
          </p>
          <h2 className="mt-2.5 text-[1.6rem] font-bold tracking-[-0.02em] sm:text-[2rem]">{heading}</h2>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden font-mono text-[11px] tabular-nums tracking-[0.18em] text-white/35 sm:block">
            {String(titles.length).padStart(2, "0")} TITLES
          </span>
          <div className="flex gap-1.5">
            {([-1, 1] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => page(dir)}
                aria-label={dir === -1 ? "Previous titles" : "Next titles"}
                className="flex h-9 w-9 items-center justify-center border border-white/15 bg-white/[0.04] text-white/60 backdrop-blur-md transition duration-300 hover:border-brand/70 hover:bg-brand/10 hover:text-white"
                style={{
                  clipPath:
                    "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))",
                }}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={dir === -1 ? "m15 18-6-6 6-6" : "m9 6 6 6-6 6"} />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={strip}
        className={`mt-6 flex snap-x snap-mandatory scroll-pl-8 gap-5 overflow-x-auto scroll-smooth pb-2 sm:scroll-pl-14 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${EDGE}`}
      >
        {titles.map((t, i) => (
          <article key={t.title} className="group w-[19rem] shrink-0 snap-start sm:w-[24rem]">
            {/* the notch is cut from the frame itself, so the still is clipped to
                the same shape rather than sitting in a rounded box */}
            <div
              className="relative aspect-[16/9] overflow-hidden bg-black ring-1 ring-white/10 transition-shadow duration-500 group-hover:shadow-[0_0_40px_-12px_rgba(229,9,20,0.85)] group-hover:ring-brand/45"
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))",
              }}
            >
              <Image
                src={t.poster}
                alt=""
                fill
                sizes="(max-width: 640px) 76vw, 24rem"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              />

              {/* readout grid, faded out towards the top so it never fights the image */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:linear-gradient(to_top,#000,transparent_65%)]"
              />
              {/* the scan pass */}
              <span
                aria-hidden
                className="animate-shimmer pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-[linear-gradient(90deg,transparent,rgba(255,90,99,0.32),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />

              <Brackets />

              <span className="absolute bottom-2.5 left-3 font-mono text-[10px] tracking-[0.16em] text-white/45">
                WS-{String(1041 + i * 7).padStart(4, "0")}
              </span>

              <span className="absolute left-3 top-3 flex items-center gap-1.5 border border-white/20 bg-black/60 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-white/85 backdrop-blur-md">
                <span className="h-1 w-1 bg-brand" />
                {t.rating}
              </span>
            </div>

            <div className="mt-3.5 flex items-start justify-between gap-4">
              <h3 className="text-[15px] font-semibold leading-tight">{t.title}</h3>
              <Meter value={t.stars} />
            </div>

            <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/35">
              {t.year}
              <span className="px-2 text-brand/60">/</span>
              {t.genre}
              <span className="px-2 text-brand/60">/</span>
              {t.runtime}
            </p>

            {/* the rule under each card fills as you take it in */}
            <span aria-hidden className="mt-3 block h-px w-full bg-white/10">
              <span className="block h-px w-0 bg-brand transition-all duration-700 group-hover:w-full" />
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}
