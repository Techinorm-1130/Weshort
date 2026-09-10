"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const POINTS = [
  {
    title: "One agreement, the whole catalogue",
    body:
      "License a slate under a single deal instead of negotiating film by film. New titles join the same terms as they finish, so your back catalogue and your next release are handled the same way.",
    icon: (
      <>
        <path d="M4 7h11a2 2 0 0 1 2 2v9H6a2 2 0 0 1-2-2Z" />
        <path d="M7 4h11a2 2 0 0 1 2 2v9" />
      </>
    ),
  },
  {
    title: "Delivered once, not title by title",
    body:
      "Send masters over Aspera or S3 and metadata by sheet or API, in one batch. Encoding, subtitling and QC happen on our side — your post team hands over the files and is done.",
    icon: (
      <>
        <path d="M12 16V4M7 9l5-5 5 5" />
        <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
      </>
    ),
  },
  {
    title: "Reporting you can hand upstream",
    body:
      "Monthly statements per title, per territory, down to the minute watched — exportable in full. Detailed enough to pass straight to your own rights holders and co-producers.",
    icon: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </>
    ),
  },
];

const TRUSTED = [
  "/images/backgrounds/posters/poster4.jpg",
  "/images/backgrounds/object1.png",
  "/images/backgrounds/posters/poster2.jpg",
];

/**
 * The case for bringing a slate here: the argument on the left, the three things
 * it rests on stacked to the right.
 *
 * It arrives on the same cue sheet as the rest of the page: the argument comes
 * in from the left, then the three cards rise up out of the baseline one after
 * another. One observer drives all four beats, so they stay in step.
 *
 * Black ground, brand red as the only colour. Only one card is lit at a time —
 * the lit one takes a red edge and a red bloom from its top-left corner, the
 * others sit back in near-black. The eye is given one thing to read rather than
 * three competing blocks; pointing at a card brings it forward. It starts on the
 * middle card, which is the claim a production house cares about most.
 */
/** The beats, in milliseconds from the section coming into view. */
const CUE = { copy: 0, cards: 320, stagger: 140 };

const EASE = "cubic-bezier(.22,.61,.36,1)";

export default function SlatePitch() {
  const [active, setActive] = useState(1);
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
  const enter = (delay: number, from: "left" | "below") => ({
    opacity: shown ? 1 : 0,
    transform: shown
      ? "translate(0,0)"
      : from === "left"
        ? "translateX(-52px)"
        : "translateY(30px)",
    transition: still
      ? "none"
      : `opacity 640ms linear ${delay}ms, transform 860ms ${EASE} ${delay}ms`,
  });

  return (
    <section ref={section} className="px-6 py-20 sm:px-12 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* the argument — first, from the left */}
        <div style={enter(CUE.copy, "left")}>
          <h2 className="text-[2.1rem] font-bold leading-[1.12] tracking-[-0.025em] sm:text-[2.9rem]">
            Built for slates —
            <span className="block">not for one film at a time</span>
          </h2>

          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-muted">
            Weshort is where production houses place a catalogue rather than chase individual
            placements. One deal covers the library, one delivery covers the files, and every title
            is programmed into collections across the year instead of being dumped at once.
          </p>

          <div className="mt-14 flex items-center gap-4">
            <div className="flex -space-x-3">
              {TRUSTED.map((src) => (
                <span
                  key={src}
                  className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-black"
                >
                  <Image src={src} alt="" fill sizes="40px" className="object-cover" />
                </span>
              ))}
            </div>
            <div>
              <p className="text-[13px] text-white/45">Trusted by :</p>
              <p className="text-[15px] font-bold text-brand">40+ production houses</p>
            </div>
          </div>
        </div>

        {/* the three things it rests on */}
        <ul className="flex flex-col gap-4">
          {POINTS.map((p, i) => {
            const lit = i === active;
            return (
              <li key={p.title} style={enter(CUE.cards + i * CUE.stagger, "below")}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-expanded={lit}
                  className={`w-full rounded-2xl border p-6 text-left transition-all duration-500 sm:p-7 ${
                    lit
                      ? "scale-[1.02] border-brand/55 bg-[radial-gradient(120%_160%_at_0%_0%,rgba(229,9,20,0.16),rgba(8,6,8,0.9)_58%)] shadow-[0_0_50px_-18px_rgba(229,9,20,0.75),0_30px_70px_-45px_rgba(0,0,0,1)]"
                      : "border-white/[0.06] bg-black/40"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-6 w-6 shrink-0 transition-colors duration-500 ${lit ? "text-brand" : "text-white/20"}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {p.icon}
                    </svg>
                    <h3
                      className={`text-[17px] font-bold tracking-[-0.01em] transition-colors duration-500 sm:text-[19px] ${
                        lit ? "text-white" : "text-white/28"
                      }`}
                    >
                      {p.title}
                    </h3>
                  </div>
                  <p
                    className={`mt-3.5 text-[14px] leading-relaxed transition-colors duration-500 ${
                      lit ? "text-white/72" : "text-white/18"
                    }`}
                  >
                    {p.body}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
