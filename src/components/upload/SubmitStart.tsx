"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import PosterStack from "@/components/landing/PosterStack";

/** The beats, in milliseconds from the section coming into view. */
const CUE = { title: 0, lede: 140, form: 300, note: 420, stack: 200 };

const EASE = "cubic-bezier(.22,.61,.36,1)";

/**
 * The start of a submission, laid out like the landing page's sign-up: the ask on
 * the left, the fanned posters on the right.
 *
 * The field takes a screener link rather than an email. A film-maker deciding
 * whether to bother has the link already — asking for it first turns "read the
 * whole page, then find the form" into one paste, and we can ask for their
 * details after there is something to talk about.
 */
export default function SubmitStart() {
  const section = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);
  const [still, setStill] = useState(false);
  const [sent, setSent] = useState(false);

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
  const enter = (delay: number, from: "left" | "right" = "left") => ({
    opacity: shown ? 1 : 0,
    transform: shown ? "translate(0,0)" : from === "left" ? "translateX(-46px)" : "translateX(46px)",
    transition: still
      ? "none"
      : `opacity 620ms linear ${delay}ms, transform 860ms ${EASE} ${delay}ms`,
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: post the link to the submissions endpoint
    setSent(true);
  }

  return (
    <section ref={section} id="submit" className="relative scroll-mt-24 overflow-hidden px-6 py-20 sm:px-12 sm:py-24">
      {/* the red bloom low-left, the way the landing hero is lit */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-20%] left-[-8%] h-[52vmin] w-[52vmin] rounded-full bg-[radial-gradient(circle,rgba(229,9,20,0.22),transparent_70%)] blur-[100px]"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <h2
            className="text-[2.1rem] font-bold leading-[1.1] tracking-[-0.025em] sm:text-[2.9rem]"
            style={enter(CUE.title)}
          >
            One film, one link,
            <span className="block">one answer in three weeks</span>
          </h2>

          <p className="mt-4 text-[15px] text-white/60" style={enter(CUE.lede)}>
            No submission fee. No exclusivity. Ever.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 flex flex-wrap gap-3" style={enter(CUE.form)}>
            <label className="relative min-w-[16rem] flex-1">
              <span className="sr-only">Link to your film</span>
              <input
                type="url"
                required
                placeholder="Link to your film…"
                className="w-full rounded border border-edge/45 bg-white/[0.06] py-3 pl-4 pr-11 text-[14px] text-white outline-none backdrop-blur-sm transition placeholder:text-white/40 focus:border-white focus:bg-white/[0.09]"
              />
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                className="pointer-events-none absolute right-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1 1" />
                <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1-1" />
              </svg>
            </label>

            <button
              type="submit"
              className="group inline-flex shrink-0 items-center gap-2 rounded bg-brand px-6 py-3 text-[14px] font-semibold text-white shadow-[0_16px_36px_-16px_rgba(229,9,20,0.95)] transition duration-300 hover:bg-brand-hover active:scale-[0.99]"
            >
              {sent ? "Sent" : "Start submission"}
              <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          </form>

          <p className="mt-4 max-w-md text-[13px] leading-relaxed text-white/45" style={enter(CUE.note)}>
            {sent
              ? "Got it — two programmers will watch it in full, and you'll hear from a person either way."
              : "Vimeo, Frame.io or any private link with a password. We'll ask for the master only if the film is taken."}
          </p>
        </div>

        <div style={enter(CUE.stack, "right")}>
          <PosterStack />
        </div>
      </div>
    </section>
  );
}
