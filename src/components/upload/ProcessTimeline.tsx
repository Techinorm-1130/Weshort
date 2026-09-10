"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type Step = { title: string; body: string; meta: string };

/**
 * Where each stage sits along the track, as a share of the four weeks it takes
 * end to end. Placed by elapsed time rather than spaced evenly: the gap between
 * sending a film and hearing back is most of the wait, and a timeline that
 * flattens that is telling a comfortable lie.
 */
const AT = [0, 36, 75, 100];

/** The beats, in milliseconds from the section coming into view. */
const CUE = { copy: 0, track: 220, marks: 520, stagger: 110, note: 900 };

const EASE = "cubic-bezier(.22,.61,.36,1)";

export default function ProcessTimeline({ steps }: { steps: Step[] }) {
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
      threshold: 0.25,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const shown = live || still;
  const fade = (delay: number) => ({
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : "translateY(14px)",
    transition: still
      ? "none"
      : `opacity 560ms linear ${delay}ms, transform 700ms ${EASE} ${delay}ms`,
  });

  return (
    <section ref={section} className="px-6 pb-24 pt-4 sm:px-12">
      <div className="mx-auto max-w-4xl text-center">
        {/* the track */}
        <div className="relative mt-16 pb-4 pt-16 sm:pt-20">
          {/* the labels sit above their own marker, so the timing is read off the
              position rather than from a legend */}
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="absolute top-0 -translate-x-1/2 px-1"
              style={{ left: `${AT[i]}%`, ...fade(CUE.marks + i * CUE.stagger) }}
            >
              <p
                className={`text-[10.5px] font-semibold uppercase tracking-[0.16em] ${
                  i === 0 ? "text-brand" : "text-white/40"
                }`}
              >
                Step {i + 1}
              </p>
              <p className="mt-1 whitespace-nowrap text-[13px] font-bold">{s.meta}</p>
              <p className="mt-0.5 hidden whitespace-nowrap text-[11.5px] text-white/45 sm:block">
                {s.title}
              </p>
            </div>
          ))}

          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/10">
            {/* red for the part you control, grey for the part we do */}
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#ff2d3a,#e50914_40%,#5a1116_100%)]"
              style={{
                width: shown ? "100%" : "0%",
                transition: still ? "none" : `width 1100ms ${EASE} ${CUE.track}ms`,
              }}
            />
          </div>

          {/* the markers */}
          {steps.map((s, i) => (
            <span
              key={`${s.title}-dot`}
              aria-hidden
              className={`absolute top-16 mt-[1px] h-4 w-4 -translate-x-1/2 rounded-full border-2 sm:top-20 ${
                i === 0 ? "border-brand bg-white" : "border-black bg-white"
              }`}
              style={{
                left: `${AT[i]}%`,
                ...fade(CUE.marks + i * CUE.stagger),
              }}
            />
          ))}

          {/* the promise that hangs off the track, as the reference hangs its
              reminder off the trial */}
          <div
            className="absolute left-[36%] top-[calc(4rem+1.75rem)] -translate-x-1/2 sm:top-[calc(5rem+1.75rem)]"
            style={fade(CUE.note)}
          >
            <span className="flex items-center gap-2 whitespace-nowrap rounded border border-white/15 bg-white/[0.06] px-2.5 py-1.5 text-[11.5px] text-white/75 backdrop-blur-sm">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-brand" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3.5 7 8.5 6 8.5-6" />
              </svg>
              A person replies either way
            </span>
          </div>
        </div>

        <p className="mx-auto mt-20 max-w-md text-[13.5px] leading-relaxed text-white/55" style={fade(CUE.note)}>
          Two programmers watch every submission in full. If it is a yes you get the territories,
          term and split in writing before anything is signed.
        </p>

        <Link
          href="#submit"
          className="group mt-7 inline-flex items-center gap-2 rounded bg-brand px-7 py-3.5 text-[13.5px] font-semibold uppercase tracking-[0.06em] text-white shadow-[0_16px_40px_-16px_rgba(229,9,20,0.95)] transition duration-300 hover:bg-brand-hover active:scale-[0.99]"
          style={fade(CUE.note + 120)}
        >
          Start a submission
          <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
