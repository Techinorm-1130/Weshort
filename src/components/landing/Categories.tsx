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

function CategoryCard({ item, index }: { item: (typeof CATEGORIES)[number]; index: number }) {
  return (
    <Link
      href={item.href}
      className="group flex w-full flex-col rounded-xl border border-white/10 bg-surface p-4 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
    >
      {/* 2×2 poster grid, bottom row fades into the card */}
      <div className="relative">
        <div className="grid grid-cols-2 gap-2">
          {item.posters.slice(0, 4).map((src, i) => {
            const [from, to] = PLACEHOLDERS[(index + i) % PLACEHOLDERS.length];
            return (
              <div
                key={i}
                className="relative aspect-[0.9] overflow-hidden rounded-md"
                style={{ background: src ? "transparent" : `linear-gradient(160deg, ${from}, ${to})` }}
              >
                {src ? (
                  <Image src={src} alt="" fill sizes="120px" className="object-cover" />
                ) : (
                  <span className="absolute left-1.5 top-1.5 text-xs font-black text-brand">W</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-surface/85 via-surface/35 to-transparent" />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-base font-medium">{item.name}</span>
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 text-white transition group-hover:translate-x-1"
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

/** "Explore our wide variety of categories" — horizontal carousel with arrows + dots. */
export default function Categories() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const total = Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth));
    setPages(total);
    setPage(Math.min(total - 1, Math.round(el.scrollLeft / el.clientWidth)));
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

  function go(dir: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  }

  const arrowBtn =
    "flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/10 disabled:opacity-40";

  return (
    <section className="overflow-hidden bg-background px-6 py-16 sm:px-12 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <Reveal>
            <h2 className="text-2xl font-semibold sm:text-3xl">Explore our wide variety of categories</h2>
            <p className="mt-2 max-w-3xl text-sm text-muted sm:text-base">
              Whether you&apos;re looking for a comedy to make you laugh, a drama to make you
              think, or a documentary to learn something new
            </p>
          </Reveal>

          {/* arrows + dots */}
          <Reveal from="right" delay={150} className="flex w-fit shrink-0 items-center gap-3 self-start rounded-lg border border-white/10 bg-white/[0.04] p-2 sm:self-auto">
            <button type="button" aria-label="Previous" onClick={() => go(-1)} disabled={page === 0} className={arrowBtn}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
            </button>
            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: pages }).map((_, i) => (
                <span
                  key={i}
                  className={`h-0.5 w-4 rounded-full transition-colors ${i === page ? "bg-brand" : "bg-white/20"}`}
                />
              ))}
            </div>
            <button type="button" aria-label="Next" onClick={() => go(1)} disabled={page >= pages - 1} className={arrowBtn}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </Reveal>
        </div>

        {/* track */}
        <div
          ref={trackRef}
          className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {CATEGORIES.map((c, i) => (
            <Reveal
              key={c.name}
              delay={i * 90}
              distance={36}
              className="flex w-[13.5rem] shrink-0 snap-start sm:w-[14.5rem] lg:w-[calc((100%-5rem)/5)]"
            >
              <CategoryCard item={c} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
