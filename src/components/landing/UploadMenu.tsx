"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ROUTES } from "@/lib/constants";

const OPTIONS = [
  {
    label: "Production House",
    note: "License a whole slate",
    href: ROUTES.uploadProductionHouse,
    icon: (
      <>
        <path d="M3 20.5V6l7-3v17.5" />
        <path d="M10 9.5h8a1 1 0 0 1 1 1v10" />
        <path d="M2 20.5h20M6 9v.01M6 13v.01M14 13v.01M14 17v.01" />
      </>
    ),
  },
  {
    label: "Producer & Director",
    note: "Submit your own film",
    href: ROUTES.uploadProducer,
    icon: (
      <>
        <path d="M4 6.5h11a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 16V8A1.5 1.5 0 0 1 4 6.5Z" />
        <path d="m16.5 13 4 2.5v-7L16.5 11" />
      </>
    ),
  },
];

/** Header "Upload" control: a dropdown offering the two submission routes. */
export default function UploadMenu() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointer = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-semibold transition duration-300 ${
          open
            ? "border-white/30 bg-white/[0.12] text-white"
            : "border-white/15 bg-white/[0.06] text-white/85 hover:border-white/30 hover:text-white"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 16V4M7 9l5-5 5 5" />
          <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
        </svg>
        Upload
        <svg
          viewBox="0 0 24 24"
          className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="animate-fade-up absolute right-0 top-[calc(100%+0.6rem)] w-[19rem] overflow-hidden rounded-2xl border border-white/12 p-1.5 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.95)] backdrop-blur-xl"
          style={{ background: "linear-gradient(180deg, rgba(18,18,20,0.95) 0%, rgba(6,6,8,0.92) 100%)" }}
        >
          {OPTIONS.map((o) => (
            <Link
              key={o.href}
              href={o.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="group flex items-center gap-3.5 rounded-xl px-3 py-3 transition duration-200 hover:bg-white/[0.08]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-white/70 transition duration-200 group-hover:border-brand/50 group-hover:text-brand">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  {o.icon}
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-[13.5px] font-semibold text-white">{o.label}</span>
                <span className="block text-[12px] text-white/50">{o.note}</span>
              </span>
              <svg
                viewBox="0 0 24 24"
                className="ml-auto h-4 w-4 shrink-0 text-white/25 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white/60"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
