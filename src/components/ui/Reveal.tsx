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
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (once) io.disconnect();
        } else if (!once) {
          setShown(false);
        }
      },
      // threshold 0 so it resets only when fully out of view, and reveals as soon as any part enters
      { threshold: 0, rootMargin: "0px 0px 0px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
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
