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

/** Reveals children with a fade + slide when they scroll into view. */
export default function Reveal({
  children,
  delay = 0,
  from = "up",
  distance = 28,
  duration = 700,
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

    // Fallback check (also covers programmatic scrolls / anchors / environments
    // where IntersectionObserver notifications are delayed). Kept synchronous
    // and cheap: one getBoundingClientRect per element per scroll event.
    const check = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      apply(r.bottom > 0 && r.top < vh && r.right > 0 && r.left < window.innerWidth);
    };

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(([entry]) => apply(entry.isIntersecting), { threshold: 0 });
      io.observe(el);
    }
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    window.addEventListener("hashchange", check);
    check();

    function cleanup() {
      io?.disconnect();
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
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
        transition: shown
          ? `opacity ${duration}ms cubic-bezier(.22,.61,.36,1) ${delay}ms, transform ${duration}ms cubic-bezier(.22,.61,.36,1) ${delay}ms`
          : "none",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}
