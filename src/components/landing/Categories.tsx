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

/** Copies of the genre list laid end-to-end so the roll can run forever. */
const COPIES = 3;
/** Idle roll speed, px per second. */
const SPEED = 16;
/**
 * One cell of the roll: a single poster, the frame line, keycode edge marking
 * and — on hover — the projector treatment (the rest of the reel dims, this
 * frame lifts into the light with gate marks and a sweep across the emulsion).
 */
function Frame({ item, index }: { item: (typeof CATEGORIES)[number]; index: number }) {
  const src = item.posters.find(Boolean) ?? null;
  const [from, to] = PLACEHOLDERS[index % PLACEHOLDERS.length];
  const no = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={item.href}
      data-frame
      data-index={index}
      className="group relative flex w-[9.75rem] shrink-0 flex-col px-[5px] transition-[opacity,filter,transform] duration-500 ease-out hover:z-20 sm:w-[11rem] lg:w-[11.75rem]"
    >
      {/* frame line — the hairline that separates two cells on real stock */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-2 left-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"
      />

      {/* keycode / edge marking above the cell */}
      <span className="mb-1.5 flex items-center justify-between font-mono text-[8px] uppercase leading-none tracking-[0.18em] text-[#d9c08a]/45 transition-colors duration-300 group-hover:text-[#d9c08a]/85">
        <span>WS·{no}A</span>
        <span className="tracking-normal">▸▸</span>
      </span>

      {/* the exposed frame — lifts into the light on hover */}
      <div
        className="relative aspect-[2/3] w-full overflow-hidden rounded-[2px] ring-1 ring-white/10 transition-[transform,box-shadow,--tw-ring-color] duration-[600ms] ease-out group-hover:-translate-y-[5px] group-hover:shadow-[0_18px_38px_-12px_rgba(0,0,0,0.9),0_0_26px_-4px_rgba(217,192,138,0.45)] group-hover:ring-[#d9c08a]/55"
        style={{ background: src ? "#04060b" : `linear-gradient(160deg, ${from}, ${to})` }}
      >
        {src ? (
          <Image
            src={src}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 40vw, 190px"
            className="object-cover brightness-[0.82] saturate-[0.85] transition duration-[900ms] ease-out group-hover:scale-[1.07] group-hover:brightness-105 group-hover:saturate-100"
          />
        ) : (
          <span className="absolute left-2 top-2 text-sm font-black text-brand">W</span>
        )}

        {/* vignette + floor so the caption always reads */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 30%, transparent 40%, rgba(0,0,0,0.55) 100%), linear-gradient(to top, rgba(2,6,16,0.95) 0%, rgba(2,6,16,0.45) 26%, transparent 55%)",
          }}
        />

        {/* gate marks — the registration brackets of a projector gate close in on hover */}
        {[
          "left-2 top-2 border-l border-t -translate-x-1 -translate-y-1",
          "right-2 top-2 border-r border-t translate-x-1 -translate-y-1",
          "left-2 bottom-2 border-l border-b -translate-x-1 translate-y-1",
          "right-2 bottom-2 border-r border-b translate-x-1 translate-y-1",
        ].map((pos) => (
          <span
            key={pos}
            aria-hidden
            className={`pointer-events-none absolute h-3.5 w-3.5 border-[#d9c08a]/80 opacity-0 transition duration-500 ease-out group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 ${pos}`}
          />
        ))}

        {/* light sweeps across the emulsion once, as the frame enters the gate */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/2 -translate-x-[220%] skew-x-[-18deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent)] transition-transform duration-[1100ms] ease-out group-hover:translate-x-[420%]"
        />

        {/* gold play seal on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[42%] flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 scale-75 items-center justify-center rounded-full border border-[#d9c08a]/70 bg-black/35 opacity-0 shadow-[0_0_20px_-4px_rgba(217,192,138,0.6)] backdrop-blur-sm transition duration-500 group-hover:scale-100 group-hover:opacity-100"
        >
          <svg viewBox="0 0 24 24" className="ml-[2px] h-4 w-4 fill-[#d9c08a]">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>

        {/* caption inside the frame */}
        <span className="absolute inset-x-2.5 bottom-2.5">
          <span className="block h-px w-6 bg-[#d9c08a]/70 transition-all duration-500 group-hover:w-full" />
          <span className="mt-1.5 flex items-center justify-between">
            <span className="text-[12.5px] font-medium leading-none tracking-wide text-white">
              {item.name}
            </span>
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 -translate-x-1 text-[#d9c08a] opacity-0 transition duration-500 group-hover:translate-x-0 group-hover:opacity-100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </span>
      </div>

      {/* frame counter below the cell */}
      <span className="mt-1.5 font-mono text-[8px] uppercase leading-none tracking-[0.18em] text-white/20 transition-colors duration-300 group-hover:text-white/45">
        FRAME {no}
      </span>
    </Link>
  );
}

/** Punched sprocket rail (top or bottom edge of the stock). */
function Rail({ position }: { position: "top" | "bottom" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 flex h-6 items-center gap-[14px] overflow-hidden px-3 ${
        position === "top" ? "top-0" : "bottom-0"
      }`}
    >
      {/* hairline where the rail meets the frames */}
      <span
        className={`absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#d9c08a]/20 to-transparent ${
          position === "top" ? "bottom-0" : "top-0"
        }`}
      />
      {Array.from({ length: 240 }).map((_, i) => (
        <span
          key={i}
          className="h-[9px] w-[15px] shrink-0 rounded-[2px]"
          style={{
            background: "linear-gradient(180deg,#f2ece0 0%,#d8d0be 55%,#b9b1a0 100%)",
            boxShadow:
              "inset 0 1px 1px rgba(0,0,0,0.45), inset 0 -1px 0 rgba(255,255,255,0.35), 0 0 6px rgba(217,192,138,0.12)",
          }}
        />
      ))}
    </div>
  );
}

/** "Explore our wide variety of categories" — a premium 35mm roll that runs by itself (drag to scrub). */
export default function Categories() {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [range, setRange] = useState<[number, number]>([0, 0]); // visible genre indexes (inclusive, may wrap)

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const frames = el.querySelectorAll<HTMLElement>("[data-frame]");
    const left = el.scrollLeft, right = left + el.clientWidth;
    let first = -1, last = -1;
    frames.forEach((f) => {
      const a = f.offsetLeft, b = a + f.offsetWidth;
      const visible = Math.min(b, right) - Math.max(a, left) > f.offsetWidth * 0.5; // >50% in view
      if (visible) {
        const idx = Number(f.dataset.index ?? 0);
        if (first < 0) first = idx;
        last = idx;
      }
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

  // the roll: drifts on its own, wraps seamlessly, pauses on hover / drag / hidden tab
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const setWidth = () => el.scrollWidth / COPIES;
    el.scrollLeft = setWidth(); // start inside the middle copy so it scrubs both ways

    let raf = 0, last = 0;
    const step = (t: number) => {
      raf = requestAnimationFrame(step);
      const w = setWidth();
      if (w <= 0) { last = t; return; }
      if (last && !pausedRef.current && !reduce && !document.hidden) {
        el.scrollLeft += (SPEED * Math.min(t - last, 64)) / 1000;
      }
      last = t;
      if (el.scrollLeft > w * 1.5) el.scrollLeft -= w;
      else if (el.scrollLeft < w * 0.5) el.scrollLeft += w;
    };
    raf = requestAnimationFrame(step);

    const hold = () => { pausedRef.current = true; };
    const release = () => { pausedRef.current = false; };
    el.addEventListener("pointerenter", hold);
    el.addEventListener("pointerleave", release);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", hold);
      el.removeEventListener("pointerleave", release);
    };
  }, []);

  // mouse drag-to-scrub (touch already scrolls natively)
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

  const reel = Array.from({ length: COPIES }).flatMap((_, c) =>
    CATEGORIES.map((item, i) => ({ item, i, key: `${c}-${item.name}` })),
  );

  return (
    <section className="w-full py-8 sm:py-10">
      {/* header — centered title card */}
      <div className="w-full px-6 sm:px-12">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#d9c08a]/40" />
            <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px_rgba(229,9,20,0.9)]" />
              Now showing · {String(CATEGORIES.length).padStart(2, "0")} genres
            </span>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#d9c08a]/40" />
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

      {/* the roll — full bleed, edge to edge */}
      <Reveal delay={120} distance={36} className="relative mt-9 w-full">
        {/* gold hairlines above / below the stock */}
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#d9c08a]/35 to-transparent" />
        <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-px bg-gradient-to-r from-transparent via-[#d9c08a]/35 to-transparent" />

        <div
          ref={trackRef}
          className={`film-stock w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            dragging ? "cursor-grabbing select-none [&_a]:pointer-events-none" : "cursor-grab"
          }`}
        >
          {/* width is defined by the frames; the rails are clipped to it */}
          <div className="relative w-max min-w-full py-9">
            <Rail position="top" />
            <div className="film-reel flex">
              {reel.map(({ item, i, key }) => (
                <Frame key={key} item={item} index={i} />
              ))}
            </div>
            <Rail position="bottom" />
          </div>
        </div>

        {/* emulsion grain + the curve of the celluloid */}
        <span aria-hidden className="film-grain pointer-events-none absolute inset-0 z-10" />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            boxShadow:
              "inset 0 22px 34px -22px rgba(0,0,0,0.95), inset 0 -22px 34px -22px rgba(0,0,0,0.95)",
            background:
              "linear-gradient(100deg, transparent 34%, rgba(255,255,255,0.045) 48%, transparent 62%)",
          }}
        />
        {/* the roll runs off into the dark on both sides */}
        <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#020a1c] to-transparent sm:w-28" />
        <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#020a1c] to-transparent sm:w-28" />

        {/* reel readout: one cell per genre, lit when in view */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1 rounded-md border border-[#d9c08a]/20 bg-black/40 px-1.5 py-1">
            {CATEGORIES.map((c, i) => {
              const on =
                range[0] <= range[1]
                  ? i >= range[0] && i <= range[1]
                  : i >= range[0] || i <= range[1];
              return (
                <span
                  key={c.name}
                  title={c.name}
                  className={`h-2.5 w-4 rounded-[2px] transition-colors duration-200 ${
                    on ? "bg-[#d9c08a] shadow-[0_0_8px_rgba(217,192,138,0.55)]" : "bg-white/15"
                  }`}
                />
              );
            })}
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45 tabular-nums">
            35mm · <span className="text-[#d9c08a]/80">Premium</span> reel
          </span>
        </div>
      </Reveal>
    </section>
  );
}
