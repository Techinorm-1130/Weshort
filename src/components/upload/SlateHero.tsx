"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SlateRow, { type SlateTitle } from "@/components/upload/SlateRow";
import { EDGE } from "@/components/upload/edge";
import { INTRO_DONE_EVENT, ROUTES } from "@/lib/constants";

/**
 * Full-bleed cinematic hero for the production-house page: a still running the
 * whole screen, the pitch set low on the left, and two people cards floating
 * bottom-right the way a title page credits its leads.
 *
 * It opens on a cue sheet, the same language as the sections below: the still
 * settles out of a slow push, the pitch arrives line by line from the left, the
 * people cards follow, and the catalogue row rises up out of the baseline last.
 *
 * Two gates decide when that runs. The logo opener covers the page on load, so
 * the first play waits for it to hand over — otherwise the whole sequence would
 * finish behind the overlay. After that an observer takes over, so scrolling
 * away and back replays it, like every other section on the page.
 */

/** The beats, in milliseconds from load. */
const CUE = { still: 0, eyebrow: 220, title: 340, lede: 480, buttons: 620, people: 780, row: 940 };

const EASE = "cubic-bezier(.22,.61,.36,1)";

const PEOPLE = [
  {
    name: "Elena Marchetti",
    role: "Head of partnerships",
    photo: "/images/backgrounds/posters/poster4.jpg",
  },
  {
    name: "Marco Ricci",
    role: "Delivery & QC lead",
    photo: "/images/backgrounds/posters/poster2.jpg",
  },
];

/** Titles from partner catalogues, standing in for the live carousel. */
const LICENSED: SlateTitle[] = [
  { title: "Rebel Ridge", poster: "/images/backgrounds/object1.png", rating: "TV-MA", year: "2024", genre: "Thriller", runtime: "2h 11m", stars: 4.5 },
  { title: "Fall", poster: "/images/backgrounds/posters/poster2.jpg", rating: "TV-14", year: "2022", genre: "Survival", runtime: "1h 47m", stars: 4 },
  { title: "Peaky Blinders", poster: "/images/backgrounds/posters/poster4.jpg", rating: "TV-MA", year: "2013", genre: "Crime drama", runtime: "1h 02m", stars: 5 },
  { title: "Nowhere", poster: "/images/backgrounds/posters/poster3.jpg", rating: "TV-MA", year: "2023", genre: "Drama", runtime: "1h 49m", stars: 4.5 },
  { title: "The Day After Tomorrow", poster: "/images/backgrounds/object2.png", rating: "TV-14", year: "2004", genre: "Disaster", runtime: "2h 04m", stars: 4 },
  { title: "Uglies", poster: "/images/backgrounds/object3.png", rating: "TV-14", year: "2024", genre: "Sci-fi", runtime: "1h 40m", stars: 3.5 },
];

export default function SlateHero() {
  const section = useRef<HTMLElement>(null);
  /** The logo opener has handed over — nothing may animate before this. */
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

    // one tick, so the first paint holds the closed state and the browser has
    // something to transition from
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

  const shown = (armed && live) || still;
  /** Arrives from the left on its cue. */
  const fromLeft = (delay: number, distance = 40) => ({
    opacity: shown ? 1 : 0,
    transform: shown ? "translateX(0)" : `translateX(-${distance}px)`,
    transition: still
      ? "none"
      : `opacity 620ms linear ${delay}ms, transform 820ms ${EASE} ${delay}ms`,
  });
  /** Rises up on its cue. */
  const fromBelow = (delay: number, distance = 26) => ({
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : `translateY(${distance}px)`,
    transition: still
      ? "none"
      : `opacity 620ms linear ${delay}ms, transform 820ms ${EASE} ${delay}ms`,
  });

  return (
    <section ref={section} className="relative w-full overflow-hidden pb-14 sm:pb-16">
      {/* The still owns the top of the hero. A tight portrait with a watermark
          along its bottom edge, so it sits at natural scale anchored high: the
          eyes stay in shot and the watermark falls below the crop. */}
      {/* The picture is masked away at its own bottom edge rather than stopping
          at one, so it dissolves into the page instead of cutting against it —
          the heading and the top of the cards sit inside that dissolve. This is
          a mask on the image, not a dark layer over it: nothing tints the frame. */}
      <div className="absolute inset-x-0 top-0 h-[94svh] [-webkit-mask-image:linear-gradient(to_bottom,#000_0%,#000_70%,rgba(0,0,0,0.6)_86%,transparent_100%)] [mask-image:linear-gradient(to_bottom,#000_0%,#000_70%,rgba(0,0,0,0.6)_86%,transparent_100%)]">
        <Image
          src="/images/production house posters/volv.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_26%]"
          style={{
            transform: shown ? "scale(1)" : "scale(1.08)",
            transition: still ? "none" : `transform 1800ms ${EASE} ${CUE.still}ms`,
          }}
        />
        {/* The reference darkens its left third — that is what its copy is
            readable against. Same here: a wash across the text side only, and a
            short one at the foot, so the right of the frame stays untouched. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.8)_28%,rgba(0,0,0,0.38)_52%,transparent_78%)]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(0deg,rgba(0,0,0,0.88),transparent)]"
        />
        {/* an even veil over the whole frame — just enough to sit the picture
            back behind the type without flattening it */}
        <div aria-hidden className="absolute inset-0 bg-black/40" />
      </div>

      <div className={`relative flex h-[72svh] flex-col justify-end pb-4 pt-32 ${EDGE}`}>
        <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          {/* the pitch */}
          <div className="max-w-xl [text-shadow:0_2px_18px_rgba(0,0,0,0.85),0_1px_3px_rgba(0,0,0,0.9)]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-white/60" style={fromLeft(CUE.eyebrow)}>
<span className="text-brand">Upload</span> · production house
            </p>

            <h1
              className="mt-4 text-[3rem] font-black leading-[0.98] tracking-[-0.03em] sm:text-[4.2rem]"
              style={fromLeft(CUE.title, 52)}
            >
              Upload your slate
            </h1>

            <p
              className="mt-5 max-w-md text-[15.5px] leading-relaxed text-white/70"
              style={fromLeft(CUE.lede)}
            >
              Upload your films as a company rather than one title at a time: a single agreement
              covers the catalogue, a single delivery covers the files, and every release is
              scheduled, subtitled and reported on from the same place.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3" style={fromLeft(CUE.buttons, 32)}>
              <Link
                href={ROUTES.submitAsProductionHouse}
                className="group inline-flex items-center gap-2.5 rounded-md bg-brand px-6 py-3 text-[13px] font-bold uppercase tracking-[0.1em] text-white shadow-[0_16px_36px_-14px_rgba(229,9,20,0.95)] transition duration-300 hover:bg-brand-hover active:scale-[0.99]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 16V4M7 9l5-5 5 5" />
                  <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
                </svg>
                Upload your films
              </Link>

              <Link
                href="#delivery"
                className="inline-flex items-center gap-2.5 rounded-md border border-edge/45 bg-white/[0.07] px-6 py-3 text-[13px] font-bold uppercase tracking-[0.1em] text-white/90 backdrop-blur-md transition duration-300 hover:border-edge/85 hover:bg-white/[0.12]"
              >
                What to upload
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </Link>
            </div>

            <p
              className="mt-5 text-[13px] text-white/45"
              style={fromLeft(CUE.buttons + 120, 24)}
            >
              Uploading your own film as a producer or director?{" "}
              <Link
                href={ROUTES.uploadProducer}
                className="font-semibold text-white underline-offset-4 hover:underline"
              >
                Use the director route
              </Link>
            </p>
          </div>

          {/* who you'll be dealing with */}
          <div className="flex flex-col gap-3 sm:flex-row lg:pb-1" style={fromBelow(CUE.people)}>
            {PEOPLE.map((p) => (
              <div
                key={p.name}
                className="flex min-w-[15rem] items-center gap-3 rounded-xl border border-edge/40 bg-black/45 p-2.5 pr-5 backdrop-blur-xl"
              >
                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-edge/45">
                  <Image src={p.photo} alt="" fill sizes="44px" className="object-cover" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold text-white">{p.name}</span>
                  <span className="block truncate text-[12px] text-white/50">{p.role}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* the row that closes the hero, sitting inside the dissolve */}
      <div className="relative pt-4" style={fromBelow(CUE.row, 34)}>
        <SlateRow heading="Recently licensed" titles={LICENSED} />
      </div>
    </section>
  );
}
