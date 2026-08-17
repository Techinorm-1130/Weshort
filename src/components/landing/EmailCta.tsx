"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { validateEmail } from "@/lib/validators";

type Props = {
  /** "hero" = large; "compact" = smaller (FAQ / secondary CTAs). */
  variant?: "hero" | "compact";
  className?: string;
};

/** Email + "Get Started" — sends the user to /signup with the email prefilled. */
export default function EmailCta({ variant = "hero", className = "" }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();

  function submit(e: FormEvent) {
    e.preventDefault();
    const err = validateEmail(email);
    setError(err);
    if (err) return;
    router.push(`${ROUTES.signup}?email=${encodeURIComponent(email)}`);
  }

  const large = variant === "hero";

  return (
    <form onSubmit={submit} noValidate className={className}>
      <div className={`flex ${large ? "flex-col gap-3 sm:flex-row" : "gap-2.5"}`}>
        {/* input */}
        <label
          className={`group relative flex flex-1 items-center rounded-lg border bg-white/[0.06] backdrop-blur-md transition
            ${error ? "border-orange-500/80" : "border-white/15 hover:border-white/30 focus-within:border-white/60 focus-within:bg-white/[0.09] focus-within:ring-2 focus-within:ring-white/10"}`}
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className={`pointer-events-none absolute text-white/50 transition group-focus-within:text-white/80 ${large ? "left-4 h-5 w-5" : "left-3 h-4 w-4"}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <rect x="3" y="5" width="18" height="14" rx="2.5" />
            <path d="M3.5 7.5l8.5 6 8.5-6" />
          </svg>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder={large ? "Email address" : "Email address..."}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full bg-transparent text-white placeholder:text-white/45 outline-none
              ${large ? "py-3.5 pl-12 pr-4 text-base sm:min-w-[20rem]" : "py-2.5 pl-9 pr-3 text-sm"}`}
          />
        </label>

        {/* button */}
        <button
          type="submit"
          className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand font-semibold text-white shadow-lg shadow-brand/25 transition
            hover:bg-brand-hover hover:shadow-brand/40 active:scale-[0.98]
            ${large ? "px-6 py-3.5 text-base" : "px-4 py-2.5 text-sm"}`}
        >
          Get Started
          <svg
            viewBox="0 0 24 24"
            className={large ? "h-5 w-5" : "h-4 w-4"}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-orange-400">{error}</p> : null}
    </form>
  );
}
