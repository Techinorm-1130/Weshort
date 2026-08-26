"use client";

import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import Reveal from "@/components/ui/Reveal";

type Plan = {
  name: string;
  tier: string;
  monthly: number;
  yearly: number;
  blurb: string;
  features: string[];
  featured?: boolean;
  badge?: string;
};

const PLANS: Plan[] = [
  {
    name: "Basic",
    tier: "01",
    monthly: 9.99,
    yearly: 99.99,
    blurb: "Everything worth watching, on the one screen you use most.",
    features: ["Full Weshort catalogue", "Watch on 1 device", "HD · 720p", "Ad-free, always"],
  },
  {
    name: "Standard",
    tier: "02",
    monthly: 12.99,
    yearly: 129.99,
    blurb: "More screens, sharper picture and most new releases as they land.",
    features: ["Everything in Basic", "Watch on 2 devices", "Full HD · 1080p", "Most new releases"],
  },
  {
    name: "Premium",
    tier: "03",
    monthly: 14.99,
    yearly: 149.99,
    featured: true,
    badge: "Best value",
    blurb: "The whole catalogue in its best light — every premiere, on every screen, online or off.",
    features: ["Everything in Standard", "Watch on 4 devices", "4K + HDR", "Offline downloads"],
  },
];

const GOLD = "#d9c08a";

function Tick({ gold }: { gold: boolean }) {
  return (
    <span
      aria-hidden
      className={`mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-1 ${
        gold ? "bg-[#d9c08a]/12 ring-[#d9c08a]/45" : "bg-white/[0.06] ring-white/15"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-2.5 w-2.5 ${gold ? "text-[#d9c08a]" : "text-white/65"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 12.5l5 5L20 6.5" />
      </svg>
    </span>
  );
}

export default function Plans() {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [picked, setPicked] = useState(2); // Premium is on show by default
  const yearly = period === "yearly";
  const plan = PLANS[picked];
  const gold = Boolean(plan.featured);

  const perMonth = (p: Plan) => (yearly ? p.yearly / 12 : p.monthly);
  const [whole, cents] = perMonth(plan).toFixed(2).split(".");
  const save = Math.round((1 - plan.yearly / (plan.monthly * 12)) * 100);

  return (
    <section className="relative px-6 py-8 sm:px-12">
      {/* ambient light behind the panel */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[22rem] max-w-4xl"
        style={{
          background:
            "radial-gradient(55% 55% at 50% 0%, rgba(217,192,138,0.11) 0%, rgba(10,47,102,0.18) 45%, transparent 76%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl">
        {/* header */}
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="flex items-center justify-center gap-3 text-[10.5px] font-semibold uppercase tracking-[0.34em] text-white/55">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#d9c08a]/50" />
            Membership
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#d9c08a]/50" />
          </span>
          <h2 className="mt-3.5 text-[1.85rem] font-bold leading-[1.1] tracking-tight sm:text-[2.25rem]">
            Choose the plan that&apos;s right for you
          </h2>
          <p className="mx-auto mt-2.5 max-w-lg text-[13px] leading-relaxed text-muted">
            Every tier includes the full Weshort catalogue. Upgrade, downgrade or cancel
            whenever you like.
          </p>
        </Reveal>

        {/* billing toggle */}
        <Reveal delay={140} className="mt-6 flex items-center justify-center gap-2.5">
          <div className="relative inline-flex rounded-full border border-white/12 bg-white/[0.05] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md">
            <span
              aria-hidden
              className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full transition-transform duration-500 ease-out"
              style={{
                transform: yearly ? "translateX(100%)" : "translateX(0)",
                background:
                  "linear-gradient(180deg, rgba(217,192,138,0.30) 0%, rgba(217,192,138,0.10) 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.28), 0 0 0 1px rgba(217,192,138,0.45), 0 6px 18px -8px rgba(217,192,138,0.7)",
              }}
            />
            {(["monthly", "yearly"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`relative z-10 flex-1 basis-1/2 rounded-full px-7 py-1.5 text-[11.5px] font-semibold capitalize transition-colors duration-300 ${
                  period === p ? "text-white" : "text-white/50 hover:text-white/80"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <span
            className={`rounded-full border border-[#d9c08a]/40 bg-[#d9c08a]/10 px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#d9c08a] transition-opacity duration-300 ${
              yearly ? "opacity-100" : "opacity-45"
            }`}
          >
            Save 17%
          </span>
        </Reveal>

        {/* the panel: tier list on the left, the picked plan on show to the right */}
        <Reveal delay={220} distance={30} scale className="relative mt-8">
          <div
            className="rounded-[22px] p-px"
            style={{
              background:
                "linear-gradient(150deg, rgba(217,192,138,0.6) 0%, rgba(255,255,255,0.12) 28%, rgba(255,255,255,0.04) 60%, rgba(217,192,138,0.45) 100%)",
              boxShadow:
                "0 40px 90px -40px rgba(0,0,0,0.95), 0 0 60px -30px rgba(217,192,138,0.45)",
            }}
          >
            <div
              className="grid overflow-hidden rounded-[21px] backdrop-blur-xl md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.6fr)]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(9,28,60,0.88) 0%, rgba(2,7,20,0.96) 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
              }}
            >
              {/* ---- tier selector ---- */}
              <div
                role="radiogroup"
                aria-label="Subscription tier"
                className="flex flex-col border-b border-white/[0.07] md:border-b-0 md:border-r md:border-white/[0.07]"
              >
                {PLANS.map((p, i) => {
                  const on = i === picked;
                  const lit = on && Boolean(p.featured);
                  return (
                    <button
                      key={p.name}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setPicked(i)}
                      className={`group relative flex flex-1 items-center gap-3.5 px-6 py-5 text-left transition-colors duration-300 ${
                        i > 0 ? "border-t border-white/[0.06]" : ""
                      } ${on ? "" : "hover:bg-white/[0.035]"}`}
                      style={
                        on
                          ? {
                              background: lit
                                ? "linear-gradient(90deg, rgba(217,192,138,0.16) 0%, rgba(217,192,138,0.03) 70%, transparent 100%)"
                                : "linear-gradient(90deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 70%, transparent 100%)",
                            }
                          : undefined
                      }
                    >
                      {/* lit bar on the selected tier */}
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-0 w-[3px] transition-all duration-300"
                        style={{
                          background: on ? (lit ? GOLD : "rgba(255,255,255,0.75)") : "transparent",
                          boxShadow: on && lit ? `0 0 16px ${GOLD}` : "none",
                        }}
                      />

                      {/* selector dot */}
                      <span
                        aria-hidden
                        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ring-1 transition-all duration-300 ${
                          on
                            ? lit
                              ? "ring-[#d9c08a]"
                              : "ring-white/80"
                            : "ring-white/25 group-hover:ring-white/45"
                        }`}
                      >
                        <span
                          className="h-2 w-2 rounded-full transition-all duration-300"
                          style={{
                            background: on ? (lit ? GOLD : "#fff") : "transparent",
                            boxShadow: on && lit ? `0 0 10px ${GOLD}` : "none",
                          }}
                        />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                          <span
                            className={`font-mono text-[9.5px] tracking-[0.24em] transition-colors ${
                              on ? (lit ? "text-[#d9c08a]/90" : "text-white/55") : "text-white/25"
                            }`}
                          >
                            {p.tier}
                          </span>
                          <span
                            className={`text-[15px] font-semibold transition-colors ${
                              on ? (lit ? "text-[#f6ecd6]" : "text-white") : "text-white/65"
                            }`}
                          >
                            {p.name}
                          </span>
                        </span>
                        <span className="mt-1 block text-[11.5px] tabular-nums text-white/40">
                          ${perMonth(p).toFixed(2)}
                          <span className="text-white/25">/mo</span>
                        </span>
                      </span>

                      {p.badge && (
                        <span
                          className={`shrink-0 rounded-full border px-2 py-[3px] text-[8px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 ${
                            on
                              ? "border-[#d9c08a]/60 bg-[#d9c08a]/12 text-[#d9c08a]"
                              : "border-[#d9c08a]/25 bg-transparent text-[#d9c08a]/55"
                          }`}
                        >
                          {p.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ---- the plan on show ---- */}
              <div
                className="relative px-7 py-8 sm:px-9"
                style={
                  gold
                    ? {
                        background:
                          "radial-gradient(100% 60% at 100% 0%, rgba(217,192,138,0.16) 0%, rgba(217,192,138,0.03) 45%, transparent 78%)",
                      }
                    : undefined
                }
              >
                {gold && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d9c08a] to-transparent"
                  />
                )}

                {/* everything re-animates when the tier or the period changes */}
                <div
                  key={`${picked}-${period}`}
                  className="animate-fade-up relative"
                  style={{ animationDuration: "460ms" }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-[9.5px] uppercase tracking-[0.32em] ${
                        gold ? "text-[#d9c08a]/85" : "text-white/35"
                      }`}
                    >
                      Tier {plan.tier}
                    </span>
                    {plan.badge && (
                      <span className="rounded-full border border-[#d9c08a]/50 bg-[#d9c08a]/10 px-2.5 py-[3px] text-[8.5px] font-semibold uppercase tracking-[0.18em] text-[#d9c08a] shadow-[0_0_18px_-6px_rgba(217,192,138,0.8)]">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                    <div>
                      <h3
                        className={`text-[1.75rem] font-bold leading-none tracking-tight ${
                          gold ? "text-[#f6ecd6]" : "text-white"
                        }`}
                      >
                        {plan.name}
                      </h3>
                      <p className="mt-2.5 max-w-sm text-[12.5px] leading-relaxed text-muted">
                        {plan.blurb}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <div className="flex items-start gap-1">
                        <span className="mt-[7px] text-base font-medium text-white/45">$</span>
                        <span
                          className={`font-display text-[3.1rem] font-black leading-[0.78] tracking-tight tabular-nums ${
                            gold ? "text-[#f3e6c8]" : "text-white"
                          }`}
                        >
                          {whole}
                        </span>
                        <span
                          className={`mt-[3px] text-[17px] font-bold tabular-nums ${
                            gold ? "text-[#f3e6c8]/85" : "text-white/85"
                          }`}
                        >
                          .{cents}
                        </span>
                        <span className="mt-[15px] ml-0.5 text-[11px] font-medium text-white/40">
                          /mo
                        </span>
                      </div>
                      <p className="mt-2 text-right text-[10.5px] uppercase leading-none tracking-[0.1em] text-white/35">
                        {yearly ? (
                          <>
                            ${plan.yearly.toFixed(2)} yearly
                            <span className="ml-1.5 font-bold text-[#d9c08a]">−{save}%</span>
                          </>
                        ) : (
                          "billed monthly"
                        )}
                      </p>
                    </div>
                  </div>

                  <span
                    aria-hidden
                    className={`mt-6 block h-px w-full ${
                      gold
                        ? "bg-gradient-to-r from-[#d9c08a]/50 via-[#d9c08a]/15 to-transparent"
                        : "bg-gradient-to-r from-white/18 via-white/6 to-transparent"
                    }`}
                  />

                  <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2.5 text-[12.5px] leading-snug text-white/80">
                        <Tick gold={gold} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <Link
                      href={ROUTES.signup}
                      className={`group/btn relative flex items-center justify-center gap-2 overflow-hidden rounded-[10px] px-7 py-[11px] text-[12.5px] font-semibold transition duration-300 ${
                        gold
                          ? "bg-brand text-white shadow-[0_12px_30px_-12px_rgba(229,9,20,0.95),0_0_0_1px_rgba(217,192,138,0.55),inset_0_1px_0_rgba(255,255,255,0.28)] hover:bg-brand-hover"
                          : "bg-brand text-white shadow-[0_12px_30px_-14px_rgba(229,9,20,0.95),inset_0_1px_0_rgba(255,255,255,0.22)] hover:bg-brand-hover"
                      }`}
                    >
                      <span
                        aria-hidden
                        className="absolute inset-y-0 -left-1/3 w-1/3 -translate-x-[220%] skew-x-[-20deg] bg-white/25 transition-transform duration-[900ms] ease-out group-hover/btn:translate-x-[520%]"
                      />
                      <span className="relative">Choose {plan.name}</span>
                      <svg
                        viewBox="0 0 24 24"
                        className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </Link>

                    <Link
                      href={ROUTES.signup}
                      className="group flex items-center gap-1.5 text-[12px] font-medium text-white/55 transition hover:text-white"
                    >
                      Start free trial
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* reflected glow under the panel */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-16 -bottom-6 h-10 rounded-[50%] blur-2xl"
            style={{ background: "radial-gradient(50% 100% at 50% 0%, rgba(217,192,138,0.22), transparent 70%)" }}
          />
        </Reveal>

        {/* reassurance */}
        <Reveal delay={340} className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-white/40">
          {["No hidden fees", "Cancel anytime", "Secure payment", "New titles every week"].map((t) => (
            <span key={t} className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-[#d9c08a]/70" />
              {t}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
