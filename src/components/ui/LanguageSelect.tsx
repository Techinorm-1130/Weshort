"use client";

import { useEffect, useRef, useState } from "react";
import { LANGUAGES } from "@/lib/constants";
import Flag from "@/components/ui/Flag";

type Props = {
  className?: string;
  size?: "sm" | "md";
  /** "pill" = glassy pill with globe (header). "plain" = text + flag + up-chevron (footer). */
  variant?: "pill" | "plain";
  /** Hide the label on small screens (globe + chevron only). */
  compact?: boolean;
};

/** Custom language picker with animated dropdown. */
export default function LanguageSelect({ className = "", size = "md", variant = "pill", compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<(typeof LANGUAGES)[number]>(LANGUAGES[0]);
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const sm = size === "sm";
  const plain = variant === "plain";

  const triggerClass = plain
    ? "group inline-flex items-center gap-2 text-sm font-medium text-white transition hover:text-white/80 focus:outline-none"
    : `group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] font-medium text-white/90 backdrop-blur-md transition
       hover:border-white/30 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40
       ${sm ? "px-3 py-1.5 text-xs" : compact ? "px-2.5 py-1.5 text-sm sm:px-3.5 sm:py-2" : "px-3.5 py-2 text-sm"}`;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
        onClick={() => setOpen((v) => !v)}
        className={triggerClass}
      >
        {!plain && (
          <svg aria-hidden viewBox="0 0 24 24" className={sm ? "h-3.5 w-3.5" : "h-4 w-4"} fill="none" stroke="currentColor" strokeWidth="1.7">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
          </svg>
        )}
        <span className={compact ? "hidden sm:inline" : ""}>{lang.label}</span>
        {plain && <Flag code={lang.flag} />}
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className={`transition-transform duration-200 ${plain ? (open ? "" : "rotate-180") : open ? "rotate-180" : ""} ${sm ? "h-3 w-3" : "h-3.5 w-3.5"} ${plain ? "text-white" : "text-white/70 group-hover:text-white"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* dropdown */}
      <ul
        role="listbox"
        className={`absolute z-50 min-w-[10rem] overflow-hidden rounded-xl border border-white/10 bg-surface/95 p-1 shadow-2xl shadow-black/60 backdrop-blur-xl transition-all duration-150
          ${plain ? "bottom-full right-0 mb-2 origin-bottom-right" : "right-0 mt-2 origin-top-right"}
          ${open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}`}
      >
        {LANGUAGES.map((l) => {
          const active = l.code === lang.code;
          return (
            <li key={l.code} role="option" aria-selected={active}>
              <button
                type="button"
                onClick={() => {
                  setLang(l);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition
                  ${active ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/[0.06] hover:text-white"}`}
              >
                <Flag code={l.flag} />
                <span className="flex-1">{l.label}</span>
                {active && (
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
