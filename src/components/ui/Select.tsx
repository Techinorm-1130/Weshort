"use client";

import { useEffect, useId, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * The site's dropdown.
 *
 * A native <select> paints its option list with the operating system — the blue
 * highlight and the bare panel in it cannot be styled at all — so the list is
 * ours: a button and a listbox, in the same glassy language as the header menus.
 *
 * It keeps what the native control gives you for free: click outside or Escape
 * to dismiss, arrow keys and Home/End to move, Enter or Space to choose, and
 * typing a letter jumps to the next option starting with it.
 */
export default function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
  invalid,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  invalid?: boolean;
  ariaLabel?: string;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const selected = options.findIndex((o) => o.value === value);
  const chosen = selected >= 0 ? options[selected] : null;

  /** Typing letters in quick succession jumps to a match, as a native list does. */
  const typed = useRef({ text: "", at: 0 });

  useEffect(() => {
    if (!open) return;

    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  // Keep the highlighted option in view while arrowing through a long list.
  useEffect(() => {
    if (!open) return;
    list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({
      block: "nearest",
    });
  }, [open, active]);

  const openAt = (index: number) => {
    setActive(Math.max(0, index));
    setOpen(true);
  };

  const choose = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        openAt(selected);
      }
      return;
    }

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        setOpen(false);
        return;
      case "Tab":
        setOpen(false);
        return;
      case "ArrowDown":
        event.preventDefault();
        setActive((i) => Math.min(options.length - 1, i + 1));
        return;
      case "ArrowUp":
        event.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        return;
      case "Home":
        event.preventDefault();
        setActive(0);
        return;
      case "End":
        event.preventDefault();
        setActive(options.length - 1);
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(active);
        return;
      default:
        break;
    }

    if (event.key.length === 1 && /\S/.test(event.key)) {
      const now = Date.now();
      typed.current.text = now - typed.current.at > 600 ? event.key : typed.current.text + event.key;
      typed.current.at = now;

      const needle = typed.current.text.toLowerCase();
      const hit = options.findIndex((o) => o.label.toLowerCase().startsWith(needle));
      if (hit >= 0) setActive(hit);
    }
  };

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={`${id}-list`}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openAt(selected))}
        onKeyDown={onKeyDown}
        className={`flex h-11 w-full items-center justify-between gap-3 rounded-lg border bg-white/[0.03] px-3.5 text-left text-[14px] transition ${
          invalid
            ? "border-brand bg-brand/[0.04]"
            : open
              ? "border-white bg-white/[0.05]"
              : "border-edge/55 hover:border-edge/85"
        }`}
      >
        <span className={`truncate ${chosen ? "text-white" : "text-white/35"}`}>
          {chosen?.label ?? placeholder}
        </span>
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className={`h-4 w-4 shrink-0 text-white/35 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/*
        The list, in the page's own blue-black rather than a neutral dark.
        A near-black panel on a navy form reads as a window cut out of the
        page; this is the same navy running to the same blue-black the form
        sits on, so it reads as part of it.
      */}
      <ul
        ref={list}
        id={`${id}-list`}
        role="listbox"
        aria-activedescendant={open ? `${id}-option-${active}` : undefined}
        className={`scroll-slim absolute left-0 right-0 z-50 mt-2 max-h-64 origin-top overflow-y-auto rounded-xl border border-edge/40 p-1 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.95)] backdrop-blur-xl transition-all duration-150 ${
          open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
        style={{ background: "linear-gradient(180deg, rgba(7,32,74,0.97) 0%, rgba(2,10,28,0.96) 100%)" }}
      >
        {options.length === 0 ? (
          <li className="px-3 py-2.5 text-[13px] text-white/35">Nothing to choose yet</li>
        ) : (
          options.map((option, index) => {
            const isChosen = option.value === value;
            const isActive = index === active;

            return (
              <li key={option.value}>
                <button
                  type="button"
                  id={`${id}-option-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={isChosen}
                  onClick={() => choose(index)}
                  onPointerMove={() => setActive(index)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13.5px] transition ${
                    isActive ? "bg-white/[0.10] text-white" : "text-white/65"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {isChosen && (
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12.5l5 5L20 6.5" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
