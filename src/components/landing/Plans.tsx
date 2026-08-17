"use client";

import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import Reveal from "@/components/ui/Reveal";

const PLANS = [
  {
    name: "Basic Plan",
    desc: "Enjoy an extensive library of movies and shows, featuring a range of content, including recently released titles.",
    monthly: 9.99,
    yearly: 99.99,
  },
  {
    name: "Standard Plan",
    desc: "Access to a wider selection of movies and shows, including most new releases and exclusive content.",
    monthly: 12.99,
    yearly: 129.99,
  },
  {
    name: "Premium Plan",
    desc: "Access to a widest selection of movies and shows, including all new releases and Offline Viewing.",
    monthly: 14.99,
    yearly: 149.99,
  },
];

export default function Plans() {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");

  return (
    <section className="bg-background px-6 py-16 sm:px-12 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <Reveal>
            <h2 className="text-3xl font-bold sm:text-4xl">Choose the plan that&apos;s right for you</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Join Weshort and select from our flexible subscription options tailored to
              suit your viewing preferences. Get ready for non-stop entertainment!
            </p>
          </Reveal>

          {/* Monthly / Yearly toggle */}
          <Reveal from="right" delay={150} className="inline-flex shrink-0 rounded-md border border-white/15 bg-white/[0.04] p-1 backdrop-blur-md">
            {(["monthly", "yearly"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`rounded px-4 py-1.5 text-xs font-semibold capitalize transition ${
                  period === p ? "bg-white/15 text-white shadow" : "text-muted hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </Reveal>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan, i) => {
            const price = period === "monthly" ? plan.monthly : plan.yearly;
            return (
              <Reveal
                key={plan.name}
                delay={i * 120}
                distance={36}
                scale
                className="flex flex-col rounded-xl border border-white/15 bg-white/[0.04] p-7 backdrop-blur-md transition hover:border-white/30 hover:bg-white/[0.07]"
              >
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{plan.desc}</p>

                <p className="mt-6">
                  <span className="text-3xl font-bold">${price.toFixed(2)}</span>
                  <span className="text-sm text-muted">/{period === "monthly" ? "month" : "year"}</span>
                </p>

                <div className="mt-6 flex gap-3">
                  <Link
                    href={ROUTES.signup}
                    className="rounded border border-white/20 bg-transparent px-4 py-2.5 text-xs font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
                  >
                    Start Free Trial
                  </Link>
                  <Link
                    href={ROUTES.signup}
                    className="rounded bg-brand px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-hover"
                  >
                    Choose Plan
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
