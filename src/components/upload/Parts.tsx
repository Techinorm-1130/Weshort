import Link from "next/link";
import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";

/**
 * Shared furniture for the two upload landing pages. Both pages are the same
 * shape — pitch, reasons, process, requirements, close — so the difference
 * between them is content and one accent colour, passed down as `accent`.
 */

export type Accent = { line: string; soft: string; text: string };

/** Weshort red — the film-maker's route in. */
export const RED: Accent = { line: "#e50914", soft: "rgba(229,9,20,0.12)", text: "#ff5a63" };
/** The champagne gold used by the pricing panel — the partnership route. */
export const GOLD: Accent = { line: "#d9c08a", soft: "rgba(217,192,138,0.12)", text: "#e8d5a8" };

export function Eyebrow({ children, accent }: { children: ReactNode; accent: Accent }) {
  return (
    <p
      className="text-[11px] font-semibold uppercase tracking-[0.32em]"
      style={{ color: accent.text }}
    >
      {children}
    </p>
  );
}

/** Page opener: eyebrow, headline, standfirst, two calls to action, proof row. */
export function Hero({
  eyebrow,
  title,
  lede,
  primary,
  secondary,
  stats,
  accent,
}: {
  eyebrow: string;
  title: ReactNode;
  lede: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  stats: { value: string; label: string }[];
  accent: Accent;
}) {
  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-32 sm:px-12 sm:pb-20 sm:pt-40">
      {/* a single wash of the page's accent, thrown from the top left */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-10%] top-[-30%] h-[70vmin] w-[70vmin] rounded-full blur-[110px]"
        style={{ background: `radial-gradient(circle, ${accent.soft}, transparent 70%)` }}
      />

      <div className="relative mx-auto max-w-5xl">
        <Reveal>
          <Eyebrow accent={accent}>{eyebrow}</Eyebrow>
          <h1 className="mt-5 max-w-3xl text-[2.4rem] font-bold leading-[1.08] tracking-[-0.025em] sm:text-[3.4rem]">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-muted">{lede}</p>
        </Reveal>

        <Reveal delay={120} className="mt-9 flex flex-wrap items-center gap-3.5">
          <Link
            href={primary.href}
            className="group inline-flex items-center gap-2 rounded-lg px-6 py-3 text-[14px] font-semibold text-white transition duration-300 active:scale-[0.99]"
            style={{ background: accent.line, boxShadow: `0 16px 36px -14px ${accent.line}` }}
          >
            {primary.label}
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <Link
            href={secondary.href}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-6 py-3 text-[14px] font-semibold text-white/85 backdrop-blur-sm transition duration-300 hover:border-white/35 hover:text-white"
          >
            {secondary.label}
          </Link>
        </Reveal>

        <Reveal delay={200} className="mt-14 flex flex-wrap gap-x-14 gap-y-6 border-t border-white/10 pt-8">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-[1.9rem] font-bold leading-none tracking-tight tabular-nums">{s.value}</p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/40">{s.label}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/** Section heading used by every block below the hero. */
export function Heading({
  eyebrow,
  title,
  lede,
  accent,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  accent: Accent;
}) {
  return (
    <Reveal className="max-w-2xl">
      <Eyebrow accent={accent}>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-[1.7rem] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[2.2rem]">
        {title}
      </h2>
      {lede ? <p className="mt-4 text-[15px] leading-relaxed text-muted">{lede}</p> : null}
    </Reveal>
  );
}

/** Reasons grid. */
export function Cards({
  items,
  accent,
}: {
  items: { title: string; body: string; icon: ReactNode }[];
  accent: Accent;
}) {
  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-2">
      {items.map((c, i) => (
        <Reveal key={c.title} delay={i * 90}>
          <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.05]">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-xl border"
              style={{ borderColor: `${accent.line}55`, background: accent.soft, color: accent.text }}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                {c.icon}
              </svg>
            </span>
            <h3 className="mt-5 text-[17px] font-semibold">{c.title}</h3>
            <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{c.body}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/**
 * The process. Numbered because it genuinely is a sequence — each step only
 * happens after the one before it, and knowing the order is the point.
 */
export function Steps({
  items,
  accent,
}: {
  items: { title: string; body: string; meta: string }[];
  accent: Accent;
}) {
  return (
    <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s, i) => (
        <Reveal key={s.title} as="li" delay={i * 90} className="bg-background-dark p-6">
          <span
            className="font-mono text-[11px] font-semibold tracking-[0.2em]"
            style={{ color: accent.text }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-4 text-[16px] font-semibold">{s.title}</h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{s.body}</p>
          <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-white/35">{s.meta}</p>
        </Reveal>
      ))}
    </ol>
  );
}

/** Requirements table — the detail people scroll down looking for. */
export function Specs({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <Reveal delay={80} className="mt-10 overflow-hidden rounded-2xl border border-white/10">
      <dl className="divide-y divide-white/[0.07]">
        {rows.map((r) => (
          <div key={r.label} className="grid gap-1 bg-white/[0.02] px-6 py-4 sm:grid-cols-[13rem_1fr] sm:gap-6">
            <dt className="text-[13px] uppercase tracking-[0.14em] text-white/40">{r.label}</dt>
            <dd className="text-[14.5px] text-white/85">{r.value}</dd>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}

/** Closing call to action. */
export function Cta({
  title,
  lede,
  action,
  note,
  accent,
}: {
  title: string;
  lede: string;
  action: { label: string; href: string };
  note: string;
  accent: Accent;
}) {
  return (
    <section className="px-6 py-20 sm:px-12">
      <Reveal scale distance={30}>
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/12 px-8 py-12 sm:px-14 sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(80% 140% at 12% 0%, ${accent.soft}, transparent 65%)` }}
          />
          <div className="relative flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-lg">
              <h2 className="text-[1.7rem] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[2.1rem]">
                {title}
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">{lede}</p>
            </div>
            <div className="shrink-0">
              <Link
                href={action.href}
                className="group inline-flex items-center gap-2 rounded-lg px-6 py-3 text-[14px] font-semibold text-white transition duration-300 active:scale-[0.99]"
                style={{ background: accent.line, boxShadow: `0 16px 36px -14px ${accent.line}` }}
              >
                {action.label}
                <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <p className="mt-3 text-[12px] text-white/40">{note}</p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/** Wraps a block with the page's standard rhythm. */
export function Block({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-24 px-6 py-16 sm:px-12 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-5xl">{children}</div>
    </section>
  );
}
