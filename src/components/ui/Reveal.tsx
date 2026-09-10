"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Delay in ms before the animation starts (for staggering). */
  delay?: number;
  /** Direction the element slides in from. */
  from?: "up" | "down" | "left" | "right" | "none";
  /** Distance in px. */
  distance?: number;
  /** Duration in ms. */
  duration?: number;
  /** Start scaled down slightly. */
  scale?: boolean;
  /** Replay every time it enters the viewport (default) or only once. */
  once?: boolean;
  className?: string;
  as?: ElementType;
  style?: CSSProperties;
};

/**
 * Reveals children with a fade + slide when they scroll into view.
 *
 * Timings match the cue sheet in lib/cue.ts, so the sections that animate
 * element-by-element and the ones that reveal as a block move at the same speed.
 */
export default function Reveal({
  children,
  delay = 0,
  from = "up",
  distance = 44,
  duration = 840,
  scale = false,
  once = false,
  className = "",
  as: Tag = "div",
  style,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let done = false;
    const apply = (visible: boolean) => {
      if (done) return;
      if (visible) {
        setShown(true);
        if (once) {
          done = true;
          cleanup();
        }
      } else if (!once) {
        setShown(false);
      }
    };

    // Visibility comes from the observer alone. There used to be a scroll
    // listener here as a fallback, measuring the element on every scroll event —
    // with ~23 of these on the landing page that is 23 forced layouts per event,
    // which is what made scrolling stutter. The observer reports the same thing
    // off the main thread.
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(([entry]) => apply(entry.isIntersecting), { threshold: 0 });
      io.observe(el);
    } else {
      // no observer (very old browser): show it and leave it shown
      apply(true);
    }

    // anchors jump without firing the observer in some browsers
    const check = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      apply(r.bottom > 0 && r.top < vh);
    };
    window.addEventListener("hashchange", check);

    function cleanup() {
      io?.disconnect();
      window.removeEventListener("hashchange", check);
    }
    return cleanup;
  }, [once]);

  const offset = {
    up: `translate3d(0, ${distance}px, 0)`,
    down: `translate3d(0, -${distance}px, 0)`,
    left: `translate3d(-${distance}px, 0, 0)`,
    right: `translate3d(${distance}px, 0, 0)`,
    none: "translate3d(0,0,0)",
  }[from];

  const hidden = `${offset}${scale ? " scale(0.96)" : ""}`;

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? "translate3d(0,0,0) scale(1)" : hidden,
        // animate in; reset instantly when it leaves the viewport (no visible fade-out)
        // opacity lands before the movement does, so the element is fully present
        // while it is still gliding — the same curve the upload pages use
        transition: shown
          ? `opacity 620ms linear ${delay}ms, transform ${duration}ms cubic-bezier(.22,.61,.36,1) ${delay}ms`
          : "none",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}
