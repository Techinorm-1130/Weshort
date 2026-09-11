"use client";

import { useEffect, useRef, useState } from "react";

export type SpecRow = {
  label: string;
  /** The one-line answer, shown while the row is closed. */
  summary: string;
  /** The full requirement, revealed when it is opened. */
  value: string;
};

/** The beats, in milliseconds from the section coming into view. */
const CUE = { copy: 0, panel: 220, rows: 380, stagger: 70 };

const EASE = "cubic-bezier(.22,.61,.36,1)";

/** The chamfer shared by every panel on this page. */
const NOTCH =
  "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))";

/**
 * Delivery requirements as a spec sheet that opens a line at a time.
 *
 * Closed, every row states its answer in a few words, so the whole spec can be
 * skimmed in one screen; open, it gives the full requirement. A post team
 * checking one detail should not have to read the other five, and a producer
 * deciding whether to bother should not face six paragraphs.
 *
 * One row at a time: opening a line closes the last, and clicking the open one
 * shuts the sheet completely.
 */
export default function DeliverySpec({
  rows,
  note,
  id = "delivery",
  eyebrow = "Delivery",
  title = "What we need from your post team",
  lede = "Send the title list first — none of this is needed until terms are agreed. Open a line for the full requirement.",
  sheet = "Delivery specification",
}: {
  rows: SpecRow[];
  note: string;
  /** Anchor id, so each page can link to its own copy of the sheet. */
  id?: string;
  eyebrow?: string;
  title?: string;
  lede?: string;
  /** What the sheet calls itself in its header bar. */
  sheet?: string;
}) {
  const section = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);
  const [still, setStill] = useState(false);
  const [open, setOpen] = useState(0);

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
      threshold: 0.15,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const shown = live || still;
  const enter = (delay: number, from: "left" | "below" = "left") => ({
    opacity: shown ? 1 : 0,
    transform: shown
      ? "translate(0,0)"
      : from === "left"
        ? "translateX(-44px)"
        : "translateY(26px)",
    transition: still
      ? "none"
      : `opacity 600ms linear ${delay}ms, transform 820ms ${EASE} ${delay}ms`,
  });

  /** -1 closes the sheet entirely, so a row can also be shut again. */
  const toggle = (i: number) => setOpen((prev) => (prev === i ? -1 : i));

  return (
    <section ref={section} id={id} className="relative scroll-mt-32 px-6 py-14 sm:px-12 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute right-[12%] top-1/3 h-[36vmin] w-[36vmin] rounded-full bg-[radial-gradient(circle,rgba(229,9,20,0.12),transparent_70%)] blur-[90px]"
      />

      <div className="relative mx-auto max-w-5xl">
        <div style={enter(CUE.copy)}>
          <p className="flex items-center gap-2.5 font-mono text-[10.5px] uppercase tracking-[0.3em] text-brand">
            <span className="h-px w-8 bg-brand" />
            {eyebrow}
          </p>
          <h2 className="mt-3.5 text-[1.6rem] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[2rem]">
            {title}
          </h2>
          <p className="mt-3.5 max-w-lg text-[13.5px] leading-relaxed text-white/50">{lede}</p>
        </div>

        {/* the sheet */}
        <div className="mt-8" style={enter(CUE.panel, "below")}>
          <div
            className="relative border border-edge/40 bg-[linear-gradient(150deg,rgba(229,9,20,0.06),rgba(9,9,11,0.92)_42%)]"
            style={{ clipPath: NOTCH }}
          >
            {["left-2.5 top-2.5 border-l border-t", "right-2.5 bottom-2.5 border-r border-b"].map((pos) => (
              <span key={pos} aria-hidden className={`pointer-events-none absolute h-4 w-4 border-edge/50 ${pos}`} />
            ))}

            <div className="flex items-center justify-between gap-4 border-b border-edge/40 px-6 py-3.5 pr-10 sm:px-8 sm:pr-12">
              <p className="flex items-center gap-2.5 font-mono text-[10.5px] uppercase tracking-[0.24em] text-white/55">
                <span className="animate-blink h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px_rgba(229,9,20,0.9)]" />
                {sheet}
              </p>
              <p className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/30">
                Rev 2.4 · {rows.length} lines
              </p>
            </div>

            <div className="divide-y divide-edge/25">
              {rows.map((r, i) => {
                const isOpen = open === i;
                return (
                  <div key={r.label} style={enter(CUE.rows + i * CUE.stagger, "below")}>
                    <button
                      type="button"
                      onClick={() => toggle(i)}
                      aria-expanded={isOpen}
                      className="group relative flex w-full items-center gap-4 px-6 py-3 text-left transition-colors duration-300 hover:bg-white/[0.03] sm:gap-6 sm:px-8"
                    >
                      <span
                        aria-hidden
                        className={`absolute inset-y-0 left-0 w-[2px] bg-brand transition-transform duration-300 ${
                          isOpen ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
                        }`}
                      />

                      <span
                        className={`shrink-0 font-mono text-[10.5px] tabular-nums tracking-[0.18em] transition-colors duration-300 ${
                          isOpen ? "text-brand" : "text-white/25 group-hover:text-brand"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <span className="w-[7rem] shrink-0 font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/50 sm:w-[10rem]">
                        {r.label}
                      </span>

                      {/* the answer in short, so a closed sheet is still readable */}
                      <span
                        className={`min-w-0 flex-1 truncate text-[13.5px] transition-colors duration-300 ${
                          isOpen ? "text-white/35" : "text-white/70"
                        }`}
                      >
                        {r.summary}
                      </span>

                      <svg
                        viewBox="0 0 24 24"
                        className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-brand" : "text-white/35"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>

                    {/* grid-rows 0fr -> 1fr opens to the content's real height,
                        which a max-height guess never quite matches */}
                    <div
                      className="grid transition-[grid-template-rows] duration-500 ease-out"
                      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <p className="border-l-2 border-brand/60 px-6 pb-4 pl-6 text-[13.5px] leading-relaxed text-white/85 sm:ml-[16rem] sm:px-8 sm:pl-6">
                          {r.value}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-edge/40 px-6 py-3.5 pb-5 pl-10 sm:px-8 sm:pb-5 sm:pl-12">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/35">{note}</p>
              <span className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-brand">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4v12M7 11l5 5 5-5" />
                  <path d="M4 20h16" />
                </svg>
                Full sheet on request
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
