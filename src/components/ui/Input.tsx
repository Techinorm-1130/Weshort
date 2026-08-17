"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  /** Leading icon (mail, lock, user...). */
  icon?: ReactNode;
  /** Optional element on the right of the label row (e.g. "Forgot password?"). */
  labelAction?: ReactNode;
};

/** Glass input with label above, optional icon, and show/hide toggle for passwords. */
export default function Input({
  label,
  error,
  icon,
  labelAction,
  id,
  type = "text",
  className = "",
  ...rest
}: Props) {
  const inputId = id ?? rest.name ?? label.toLowerCase().replace(/\s+/g, "-");
  const isPassword = type === "password";
  const [show, setShow] = useState(false);

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={inputId} className="text-sm font-medium text-white/85">
          {label}
        </label>
        {labelAction}
      </div>

      <div
        className={`group relative flex items-center rounded-lg border bg-white/[0.05] transition
          ${error
            ? "border-orange-500/80"
            : "border-white/15 hover:border-white/30 focus-within:border-white/60 focus-within:bg-white/[0.08] focus-within:ring-2 focus-within:ring-white/10"}`}
      >
        {icon ? (
          <span className="pointer-events-none absolute left-3.5 text-white/45 transition group-focus-within:text-white/80">
            {icon}
          </span>
        ) : null}
        <input
          id={inputId}
          type={isPassword && show ? "text" : type}
          className={`w-full bg-transparent py-3 text-base text-white placeholder:text-white/35 outline-none
            ${icon ? "pl-11" : "pl-4"} ${isPassword ? "pr-11" : "pr-4"} ${className}`}
          {...rest}
        />
        {isPassword ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 rounded p-1 text-white/45 transition hover:text-white"
          >
            {show ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10 10 0 0 1 12 5c5 0 9 4 10 7-.4 1.2-1.2 2.5-2.3 3.6M6.2 6.2C4.3 7.5 2.8 9.4 2 12c1 3 5 7 10 7 1.6 0 3.1-.4 4.4-1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M2 12c1-3 5-7 10-7s9 4 10 7c-1 3-5 7-10 7S3 15 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        ) : null}
      </div>

      {error ? <p className="mt-1.5 text-sm text-orange-400">{error}</p> : null}
    </div>
  );
}

/* ---- ready-made icons for the auth forms ---- */
const iconProps = {
  viewBox: "0 0 24 24",
  className: "h-5 w-5",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const MailIcon = (
  <svg {...iconProps}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="M3.5 7.5l8.5 6 8.5-6" />
  </svg>
);

export const LockIcon = (
  <svg {...iconProps}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export const UserIcon = (
  <svg {...iconProps}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c1-3.5 4.2-5.5 8-5.5s7 2 8 5.5" />
  </svg>
);
