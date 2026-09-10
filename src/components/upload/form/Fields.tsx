"use client";

import type { ReactNode } from "react";
import type { Option } from "@/types/upload";

/**
 * One labelled control.
 *
 * `group` swaps the wrapping <label> for a labelled group. A <label> around a
 * set of buttons is actively wrong — clicking the word "Type" would press the
 * first option — so anything built from buttons passes it.
 */
export function Field({
  label,
  hint,
  error,
  required,
  group,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  group?: boolean;
  children: ReactNode;
}) {
  const Wrapper = group ? "div" : "label";

  return (
    <Wrapper
      className="block"
      {...(group ? { role: "group", "aria-label": label } : {})}
    >
      <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-white/70">
        {label}
        {required && <span className="text-brand/90">*</span>}
      </span>
      {hint && <span className="mt-1 block text-[12px] leading-relaxed text-white/35">{hint}</span>}
      {/* a div, not a span: the controls it holds are flow content */}
      <div className="mt-2">{children}</div>
      {error && (
        <span className="mt-1.5 flex items-center gap-1.5 text-[12px] text-brand">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.5v5M12 16.2v.01" />
          </svg>
          {error}
        </span>
      )}
    </Wrapper>
  );
}

/* --------------------------------- inputs -------------------------------- */

const control =
  "w-full rounded-lg border bg-white/[0.03] text-[14px] text-white outline-none transition " +
  "placeholder:text-white/25 focus:bg-white/[0.05]";

const tone = (invalid?: boolean) =>
  invalid
    ? "border-brand/60 bg-brand/[0.04] focus:border-brand"
    : "border-white/10 hover:border-white/20 focus:border-brand/60";

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  invalid?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${control} h-11 px-3.5 ${tone(invalid)} [color-scheme:dark]`}
    />
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  invalid?: boolean;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${control} resize-y px-3.5 py-3 leading-relaxed ${tone(invalid)}`}
    />
  );
}

/**
 * Re-exported so the forms keep one import, but the control itself lives in
 * components/ui — every dropdown on the site is meant to be this one.
 */
export { default as Select } from "@/components/ui/Select";

/**
 * Multi-select as toggleable chips rather than a native multiple-select, which
 * is close to unusable on a touch screen and hides everything not scrolled to.
 */
export function ChipSelect({
  values,
  onChange,
  options,
  max,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  options: Option[];
  max?: number;
}) {
  const toggle = (value: string) => {
    if (values.includes(value)) return onChange(values.filter((v) => v !== value));
    if (max && values.length >= max) return;
    onChange([...values, value]);
  };

  return (
    <span className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = values.includes(o.value);
        const full = Boolean(max && values.length >= max && !on);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => toggle(o.value)}
            aria-pressed={on}
            disabled={full}
            className={`h-8 rounded-full border px-3.5 text-[12.5px] font-medium transition duration-200 ${
              on
                ? "border-brand/70 bg-brand/15 text-white"
                : full
                  ? "cursor-not-allowed border-white/[0.07] text-white/25"
                  : "border-white/10 text-white/55 hover:border-white/25 hover:text-white/90"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </span>
  );
}

/** Two or three mutually exclusive choices, shown as a segmented control. */
export function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
}) {
  return (
    <span className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`rounded-md px-4 py-2 text-[13px] font-semibold transition duration-200 ${
            value === o.value
              ? "bg-brand text-white shadow-[0_8px_20px_-10px_rgba(229,9,20,0.9)]"
              : "text-white/50 hover:text-white"
          }`}
        >
          {o.label}
        </button>
      ))}
    </span>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`flex w-full items-start gap-3.5 rounded-lg border p-4 text-left transition ${
        checked
          ? "border-brand/40 bg-brand/[0.06]"
          : "border-white/10 bg-white/[0.02] hover:border-white/20"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition ${
          checked ? "bg-brand" : "bg-white/15"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-[13.5px] font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-[12px] leading-relaxed text-white/40">{hint}</span>}
      </span>
    </button>
  );
}
