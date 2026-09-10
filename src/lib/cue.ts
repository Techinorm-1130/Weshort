"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { INTRO_DONE_EVENT } from "@/lib/constants";

export const EASE = "cubic-bezier(.22,.61,.36,1)";

type Options = {
  /**
   * Hold everything until the logo opener has handed over. Only the first
   * section on a page needs this — anything below the fold is scrolled to long
   * after the overlay has gone.
   */
  waitForIntro?: boolean;
  /** How much of the section must be showing before it plays. */
  threshold?: number;
};

/**
 * The entrance used across the site: one observer per section driving every
 * element in it, so the beats stay locked to each other instead of each element
 * deciding independently when it is visible.
 *
 * Returns `ref` for the section and `enter(delay, from)` for the style of any
 * element inside it. Replays whenever the section is scrolled back to, and
 * renders finished under prefers-reduced-motion.
 */
export function useCue({ waitForIntro = false, threshold = 0.15 }: Options = {}) {
  const ref = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(!waitForIntro);
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

    if (!waitForIntro) return;

    const arm = () => setArmed(true);

    // The logo opener covers the page on load; starting underneath it would run
    // the whole sequence out of sight and reveal a finished section.
    if (document.documentElement.classList.contains("intro-playing")) {
      window.addEventListener(INTRO_DONE_EVENT, arm, { once: true });
      return () => window.removeEventListener(INTRO_DONE_EVENT, arm);
    }

    const t = window.setTimeout(arm, 20);
    return () => window.clearTimeout(t);
  }, [waitForIntro]);

  useEffect(() => {
    const el = ref.current;
    if (!el || still) return;

    const io = new IntersectionObserver(([entry]) => setLive(entry.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [still, threshold]);

  const shown = (armed && live) || still;

  const enter = (
    delay: number,
    from: "left" | "right" | "below" = "left",
    distance = 44,
  ): CSSProperties => ({
    opacity: shown ? 1 : 0,
    transform: shown
      ? "translate(0,0)"
      : from === "left"
        ? `translateX(-${distance}px)`
        : from === "right"
          ? `translateX(${distance}px)`
          : `translateY(${distance}px)`,
    transition: still
      ? "none"
      : `opacity 620ms linear ${delay}ms, transform 840ms ${EASE} ${delay}ms`,
    willChange: shown ? "auto" : "opacity, transform",
  });

  return { ref, enter, shown };
}
