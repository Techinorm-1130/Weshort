"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Quote = {
  quote: string;
  name: string;
  role: string;
  company: string;
  titles: string;
  photo: string;
  /**
   * Where to hold the crop. Each poster puts its subject somewhere different and
   * one carries burned-in lettering, so a single object-position would either
   * behead a subject or leave someone else's title text on screen.
   */
  focus: string;
};

const QUOTES: Quote[] = [
  {
    quote:
      "We uploaded eleven years of shorts in one delivery. What used to be a festival-by-festival scramble is now a single agreement, and we can see exactly which titles are earning in which territory.",
    name: "Daniella Chow",
    role: "Head of distribution",
    company: "Vertice Films",
    titles: "38 titles",
    photo: "/images/production house posters/volv.jpg",
    // a tight portrait: the face sits high in the frame
    focus: "62% 24%",
  },
  {
    quote:
      "The statements are detailed enough that we pass them straight to our co-producers without rebuilding anything. That alone changed which platform we send new titles to first.",
    name: "Sofia Marchetti",
    role: "Managing director",
    company: "Rossa Studio",
    titles: "62 titles",
    photo: "/images/production house posters/walter.jpg",
    // a wide still in a tall panel: hold just above centre to keep the figure
    focus: "50% 38%",
  },
];

/** The beats, in milliseconds from the section coming into view. */
const CUE = { label: 0, claim: 120, quote: 320, by: 460, rule: 600, portrait: 200 };

const EASE = "cubic-bezier(.22,.61,.36,1)";

/**
 * What partners say, staged like the hero: a portrait running the full height of
 * the section and bleeding off the right edge, with the quote laid over the dark
 * side of the frame.
 *
 * The portrait is full-bleed rather than boxed, so it belongs to the page instead
 * of sitting on it — and because the copy sits on the picture, the picture is
 * scrimmed from the left exactly as the hero is. One entry at a time: a
 * testimonial only counts if it is actually read.
 */
export default function Testimonials() {
  const [i, setI] = useState(0);
  const q = QUOTES[i];

  const section = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const el = section.current;
    if (!el) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      const t = window.setTimeout(() => setStill(true), 0);
      return () => window.clearTimeout(t);
    }

    const io = new IntersectionObserver(([entry]) => setLive(entry.isIntersecting), {
      threshold: 0.2,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const shown = live || still;
  const enter = (delay: number, from: "left" | "below" | "right" = "left") => ({
    opacity: shown ? 1 : 0,
    transform: shown
      ? "translate(0,0)"
      : from === "left"
        ? "translateX(-48px)"
        : from === "right"
          ? "translateX(48px)"
          : "translateY(28px)",
    transition: still
      ? "none"
      : `opacity 620ms linear ${delay}ms, transform 860ms ${EASE} ${delay}ms`,
  });

  const step = (dir: 1 | -1) => setI((n) => (n + dir + QUOTES.length) % QUOTES.length);

  return (
    <section ref={section} className="relative isolate overflow-hidden py-16 sm:py-20">
      {/* the portrait: full height, running off the right edge of the screen */}
      {/* The panel's own left edge is masked away, so it dissolves into the page
          instead of ending on a line. The scrim alone cannot do it: it only hits
          full black at exactly 0%, so a sliver of picture survives at the border
          and reads as a seam down the screen. */}
      <div
        className="absolute inset-y-0 right-0 -z-10 w-[62%] [-webkit-mask-image:linear-gradient(90deg,transparent_0%,#000_16%)] [mask-image:linear-gradient(90deg,transparent_0%,#000_16%)] lg:w-[46%]"
        style={enter(CUE.portrait, "right")}
      >
        <span key={q.photo} className="animate-fade-in absolute inset-0 block">
          <Image src={q.photo} alt="" fill sizes="50vw" className="object-cover" style={{ objectPosition: q.focus }} />
        </span>

        {/* scrimmed from the left, the same way the hero holds its copy */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(90deg,#000_0%,#000_10%,rgba(0,0,0,0.86)_30%,rgba(0,0,0,0.45)_60%,rgba(0,0,0,0.15)_100%)]"
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(0deg,#000,transparent)]" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-1/4 bg-[linear-gradient(180deg,#000,transparent)]" />
      </div>

      <div className="mx-auto max-w-6xl px-6 sm:px-12">
        <p
          className="flex items-center gap-2.5 font-mono text-[10.5px] uppercase tracking-[0.3em] text-white/40"
          style={enter(CUE.label)}
        >
          <span className="animate-blink h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px_rgba(229,9,20,0.9)]" />
          Partner log · {String(i + 1).padStart(2, "0")} / {String(QUOTES.length).padStart(2, "0")}
        </p>

        <h2
          className="mt-4 max-w-xl text-[1.9rem] font-black leading-[1.12] tracking-[-0.02em] sm:text-[2.4rem]"
          style={enter(CUE.claim)}
        >
          Trusted by studios
          <span className="mt-2 block">
            <span
              className="box-decoration-clone bg-brand px-3 py-1 text-white"
              style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
            >
              that bring their whole slate
            </span>
          </span>
        </h2>

        <blockquote
          key={q.name}
          className="mt-12 max-w-xl border-l-2 border-brand/70 pl-6 text-[17px] leading-[1.6] text-white/90 sm:text-[20px]"
          style={enter(CUE.quote)}
        >
          {q.quote}
        </blockquote>

        <div className="mt-8 max-w-xl" style={enter(CUE.by)}>
          <p className="text-[14px] font-bold">{q.name}</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">
            {q.role}
            <span className="px-2 text-brand/60">/</span>
            {q.company}
            <span className="px-2 text-brand/60">/</span>
            {q.titles}
          </p>
        </div>

        {/* segmented position, and the controls that drive it */}
        <div className="mt-10 flex max-w-xl items-center gap-5" style={enter(CUE.rule, "below")}>
          <div className="flex flex-1 gap-1.5">
            {QUOTES.map((entry, n) => (
              <button
                key={entry.name}
                type="button"
                onClick={() => setI(n)}
                aria-label={`Entry ${n + 1}`}
                aria-current={n === i}
                className={`h-[3px] flex-1 transition-all duration-500 ${
                  n === i ? "bg-brand shadow-[0_0_10px_rgba(229,9,20,0.9)]" : "bg-white/12 hover:bg-white/25"
                }`}
              />
            ))}
          </div>
          <div className="flex shrink-0 gap-1.5">
            {([-1, 1] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => step(dir)}
                aria-label={dir === -1 ? "Previous entry" : "Next entry"}
                className="flex h-9 w-9 items-center justify-center border border-white/15 bg-white/[0.04] text-white/60 backdrop-blur-md transition duration-300 hover:border-brand/70 hover:bg-brand/10 hover:text-white"
                style={{ clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))" }}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={dir === -1 ? "m15 18-6-6 6-6" : "m9 6 6 6-6 6"} />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
