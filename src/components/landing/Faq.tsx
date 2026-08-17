"use client";

import { useState } from "react";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

const FAQS = [
  {
    q: "What is Weshort?",
    a: "Weshort is a streaming service that allows you to watch short movies, series and documentaries on demand.",
  },
  {
    q: "How much does Weshort cost?",
    a: "Plans start at €7.99 a month. No extra costs, no contracts — cancel anytime.",
  },
  {
    q: "What content is available on Weshort?",
    a: "Award-winning short films, original series, festival selections and exclusive premieres, with new titles added every week.",
  },
  {
    q: "How can I watch Weshort?",
    a: "Watch on the web, or on your phone, tablet, Smart TV and streaming devices with the Weshort app.",
  },
  {
    q: "How do I sign up for Weshort?",
    a: "Enter your email, pick a plan and create your account — it takes less than a minute.",
  },
  {
    q: "What is the Weshort free trial?",
    a: "New members can try Weshort free for 7 days. You won't be charged until the trial ends and you can cancel anytime.",
  },
  {
    q: "How do I contact Weshort customer support?",
    a: "Reach us any time from the Help Centre or by email — our team usually replies within 24 hours.",
  },
  {
    q: "What are the Weshort payment methods?",
    a: "We accept major credit and debit cards, PayPal, Apple Pay and Google Pay.",
  },
];

function Item({
  index,
  q,
  a,
  open,
  onToggle,
}: {
  index: number;
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="relative py-4">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start gap-4 text-left"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-surface text-sm font-semibold text-white ring-1 ring-white/10">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="flex flex-1 items-center justify-between gap-4 pt-2.5">
          <span className="text-base font-semibold sm:text-lg">{q}</span>
          <span className="shrink-0 text-2xl leading-none text-white/90">
            {open ? "–" : "+"}
          </span>
        </span>
      </button>
      <div
        className={`grid pl-[3.75rem] transition-[grid-template-rows] duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <p className="overflow-hidden pr-8 text-sm leading-relaxed text-muted">
          <span className="block pt-2">{a}</span>
        </p>
      </div>
      {/* red-to-transparent divider */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/70 to-transparent"
      />
    </li>
  );
}

/** Numbered two-column FAQ with "Ask a Question" button. */
export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const half = Math.ceil(FAQS.length / 2);
  const cols = [FAQS.slice(0, half), FAQS.slice(half)];

  return (
    <section className="px-6 py-12 sm:px-12 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <Reveal>
            <h2 className="text-3xl font-bold sm:text-4xl">Frequently Asked Questions</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Got questions? We&apos;ve got answers! Check out our FAQ section to find
              answers to the most common questions about Weshort.
            </p>
          </Reveal>
          <Reveal from="right" delay={150}>
            <Link
              href="#"
              className="inline-flex shrink-0 items-center justify-center rounded bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
            >
              Ask a Question
            </Link>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-x-12 lg:grid-cols-2">
          {cols.map((col, c) => (
            <ul key={c}>
              {col.map((item, i) => {
                const idx = c * half + i;
                return (
                  <Reveal key={item.q} as="div" delay={i * 90 + c * 60} distance={20}>
                    <Item
                      index={idx}
                      q={item.q}
                      a={item.a}
                      open={open === idx}
                      onToggle={() => setOpen(open === idx ? null : idx)}
                    />
                  </Reveal>
                );
              })}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
