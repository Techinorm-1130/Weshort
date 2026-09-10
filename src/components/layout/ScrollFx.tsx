"use client";

import { useEffect } from "react";

/**
 * Scroll effects engine.
 *
 * Elements opt in with `data-fx`, and every effect is tied to the same thing:
 * how far that element has travelled through the viewport, 0 (just appearing at
 * the bottom) to 1 (just leaving at the top). Nothing fires once — they all stay
 * linked to the scrollbar.
 *
 *   parallax  drifts against the page                        data-amount px
 *   zoom      grows into place as it arrives                 data-amount scale delta
 *   rotate    turns into square as it arrives                data-amount deg
 *   spiral    3D turn on two axes                            data-amount deg
 *   shiftx    slides sideways across its pass (ticker)       data-amount px
 *   fey       falls back and blurs as the section leaves     data-amount scale delta
 *   words     reveals word by word                           (splits its own text)
 *   stagger   reveals its children one after another
 *
 * One rAF per scroll; only transform, opacity and filter are written.
 */

type Fx = {
  el: HTMLElement;
  kind: string;
  amount: number;
  parts?: HTMLElement[];
};

const clamp = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Replaces an element's text with one span per word, so they can be revealed in turn. */
function splitWords(el: HTMLElement): HTMLElement[] {
  const text = el.textContent ?? "";
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  el.textContent = "";
  return words.map((word, i) => {
    const span = document.createElement("span");
    span.textContent = i === words.length - 1 ? word : `${word} `;
    span.style.display = "inline-block";
    span.style.whiteSpace = "pre";
    span.style.willChange = "transform, opacity";
    el.appendChild(span);
    return span;
  });
}

export default function ScrollFx() {
  useEffect(() => {
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-fx]"));
    if (reduced || nodes.length === 0) return;

    const items: Fx[] = nodes.map((el) => {
      const kind = el.dataset.fx ?? "";
      const amount = Number(el.dataset.amount);
      const item: Fx = {
        el,
        kind,
        amount: Number.isFinite(amount) ? amount : 0,
      };

      if (kind === "words") item.parts = splitWords(el);
      if (kind === "stagger") item.parts = Array.from(el.children) as HTMLElement[];
      if (kind !== "words" && kind !== "stagger") el.style.willChange = "transform, opacity";

      return item;
    });

    let frame = 0;

    const paint = () => {
      frame = 0;
      const vh = window.innerHeight || document.documentElement.clientHeight;

      for (const { el, kind, amount, parts } of items) {
        const { top, height } = el.getBoundingClientRect();

        // 0 as it appears at the bottom, 1 once it has fully left at the top
        const pass = clamp((vh - top) / (vh + height));
        // 0 -> 1 across the arrival half only, for effects that settle and stay
        const arrive = clamp((vh - top) / (vh * 0.85));

        switch (kind) {
          case "parallax":
            el.style.transform = `translate3d(0, ${((0.5 - pass) * 2 * amount).toFixed(1)}px, 0)`;
            break;

          case "zoom":
            el.style.transform = `scale(${(1 - amount + amount * arrive).toFixed(4)})`;
            break;

          case "rotate":
            el.style.transform = `rotate(${((1 - arrive) * amount).toFixed(2)}deg)`;
            break;

          case "spiral":
            el.style.transform =
              `perspective(1200px) rotateY(${((1 - arrive) * amount).toFixed(2)}deg)` +
              ` rotateX(${((1 - arrive) * amount * 0.4).toFixed(2)}deg)` +
              ` scale(${(0.94 + 0.06 * arrive).toFixed(4)})`;
            break;

          case "shiftx":
            el.style.transform = `translate3d(${((0.5 - pass) * 2 * amount).toFixed(1)}px, 0, 0)`;
            break;

          case "fey": {
            // only once the section starts leaving: fall back and go soft
            const leaving = clamp((pass - 0.55) / 0.45);
            el.style.transform = `scale(${(1 - leaving * amount).toFixed(4)})`;
            el.style.filter = leaving > 0.01 ? `blur(${(leaving * 6).toFixed(1)}px)` : "";
            el.style.opacity = (1 - leaving * 0.55).toFixed(3);
            break;
          }

          case "words":
          case "stagger": {
            if (!parts || parts.length === 0) break;
            const lead = kind === "words" ? 0.55 : 0.7;
            for (let i = 0; i < parts.length; i++) {
              const start = (i / parts.length) * lead;
              const p = clamp((arrive - start) / (1 - lead));
              const eased = 1 - (1 - p) * (1 - p) * (1 - p);
              parts[i].style.opacity = eased.toFixed(3);
              parts[i].style.transform = `translate3d(0, ${((1 - eased) * 26).toFixed(1)}px, 0)`;
            }
            break;
          }
        }
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    paint();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      for (const { el, parts } of items) {
        el.style.transform = "";
        el.style.opacity = "";
        el.style.filter = "";
        el.style.willChange = "";
        parts?.forEach((p) => {
          p.style.opacity = "";
          p.style.transform = "";
        });
      }
    };
  }, []);

  return null;
}
