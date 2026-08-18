"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import Reveal from "@/components/ui/Reveal";

const PLACEHOLDERS = [
  ["#3b4a2b", "#0e120a"],
  ["#1d5d8f", "#0a1f3a"],
  ["#8a5a1e", "#2b1a08"],
  ["#5b2a6b", "#1a0a20"],
];

/** One film frame. */
function Frame({ item, index }: { item: (typeof CATEGORIES)[number]; index: number }) {
  return (
    <Link
      href={item.href}
      data-frame
      className="group relative flex w-[11rem] shrink-0 snap-start flex-col bg-[#0b1224] p-2.5 transition duration-300 hover:bg-[#0f1a33] sm:w-[12rem] lg:w-[12.5rem]"
    >
      {/* subtle inner frame line like a film cell */}
      <span aria-hidden className="pointer-events-none absolute inset-1.5 rounded-sm border border-white/[0.06]" />

      <div className="relative">
        <div className="grid grid-cols-2 gap-1.5">
          {item.posters.slice(0, 4).map((src, i) => {
            const [from, to] = PLACEHOLDERS[(index + i) % PLACEHOLDERS.length];
            return (
              <div
                key={i}
                className="relative aspect-[0.9] overflow-hidden rounded-[3px]"
                style={{ background: src ? "transparent" : `linear-gradient(160deg, ${from}, ${to})` }}
              >
                {src ? (
                  <Image src={src} alt="" fill sizes="120px" className="object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <span className="absolute left-1.5 top-1.5 text-xs font-black text-brand">W</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-[#0b1224]/90 via-[#0b1224]/40 to-transparent group-hover:from-[#0f1a33]/90 group-hover:via-[#0f1a33]/40" />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[13px] font-medium">{item.name}</span>
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 text-white transition group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </div>
    </Link>
  );
}

/** Row of sprocket holes; absolutely positioned so it's clipped to the frames' width. */
function Sprockets({ position }: { position: "top" | "bottom" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 flex h-4 items-center gap-[12px] overflow-hidden px-2 ${
        position === "top" ? "top-0" : "bottom-0"
      }`}
    >
      {Array.from({ length: 200 }).map((_, i) => (
        <span key={i} className="h-2 w-3.5 shrink-0 rounded-[2px] bg-[#e9e4d6] shadow-[inset_0_1px_1px_rgba(0,0,0,0.6)]" />
      ))}
    </div>
  );
}

/** "Explore our wide variety of categories" — full-bleed filmstrip carousel (drag / swipe to explore). */
export default function Categories() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [range, setRange] = useState<[number, number]>([0, 0]); // visible frame indexes (inclusive)

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const frames = el.querySelectorAll<HTMLElement>("[data-frame]");
    const left = el.scrollLeft, right = left + el.clientWidth;
    let first = -1, last = -1;
    frames.forEach((f, i) => {
      const a = f.offsetLeft, b = a + f.offsetWidth;
      const visible = Math.min(b, right) - Math.max(a, left) > f.offsetWidth * 0.5; // >50% in view
      if (visible) { if (first < 0) first = i; last = i; }
    });
    if (first < 0) { first = 0; last = 0; }
    setRange([first, last]);
  }, []);

  useEffect(() => {
    measure();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  // mouse drag-to-scroll (touch already scrolls natively)
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let startX = 0, startLeft = 0, active = false, moved = false;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      active = true; moved = false;
      startX = e.clientX; startLeft = el.scrollLeft;
      el.setPointerCapture(e.pointerId);
      setDragging(true);
    };
    const move = (e: PointerEvent) => {
      if (!active) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startLeft - dx;
    };
    const up = (e: PointerEvent) => {
      if (!active) return;
      active = false;
      setDragging(false);
      try { el.releasePointerCapture(e.pointerId); } catch {}
    };
    // swallow the click that follows a drag so links don't open
    const click = (e: MouseEvent) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("click", click, true);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("click", click, true);
    };
  }, []);

  return (
    <section className="w-full py-8 sm:py-10">
      {/* header — left aligned to the page edge (same gutter as the strip's first frame) */}
      <div className="w-full px-6 sm:px-12">
        {/* centered title-card header */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-white/30" />
            <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px_rgba(229,9,20,0.9)]" />
              Now showing · {String(CATEGORIES.length).padStart(2, "0")} genres
            </span>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-white/30" />
          </div>
          <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-[2.6rem]">
            Explore our wide variety of categories
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Whether you&apos;re looking for a comedy to make you laugh, a drama to make you
            think, or a documentary to learn something new.
          </p>
        </Reveal>
      </div>

      {/* filmstrip — full bleed, edge to edge */}
      <Reveal delay={120} distance={36} className="relative mt-8 w-full">
        <div
          ref={trackRef}
          className={`w-full snap-x snap-proximity overflow-x-auto bg-[#05070d] shadow-[0_30px_80px_rgba(0,0,0,0.6)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            dragging ? "cursor-grabbing select-none [&_a]:pointer-events-none" : "cursor-grab"
          }`}
        >
          {/* width is defined by the frames; sprockets are clipped to it */}
          <div className="relative w-max min-w-full py-5">
            <Sprockets position="top" />
            <div className="flex gap-2">
              {CATEGORIES.map((c, i) => (
                <Frame key={c.name} item={c} index={i} />
              ))}
            </div>
            <Sprockets position="bottom" />
          </div>
        </div>

        {/* film mini-map: one cell per genre, lit when in view + frame readout */}
        <div className="mt-5 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1 rounded-md border border-white/10 bg-black/40 px-1.5 py-1">
            {CATEGORIES.map((c, i) => {
              const on = i >= range[0] && i <= range[1];
              return (
                <span
                  key={c.name}
                  title={c.name}
                  className={`h-2.5 w-4 rounded-[2px] transition-colors duration-200 ${
                    on ? "bg-white/85 shadow-[0_0_6px_rgba(255,255,255,0.5)]" : "bg-white/15"
                  }`}
                />
              );
            })}
          </div>
          <span className="text-[11px] uppercase tracking-[0.22em] text-white/50 tabular-nums">
            Frame <span className="text-white/90">{String(range[0] + 1).padStart(2, "0")}–{String(range[1] + 1).padStart(2, "0")}</span>
            <span className="text-white/30"> / </span>
            {String(CATEGORIES.length).padStart(2, "0")}
          </span>
        </div>
      </Reveal>
    </section>
  );
}
