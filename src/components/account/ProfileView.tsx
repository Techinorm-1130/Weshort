"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { submissionApi } from "@/lib/api/resources";
import { ROUTES } from "@/lib/constants";
import { signOut, updateAccount, useSession, type Account } from "@/lib/session";
import type { ApprovalState, ContentItem, SubmitterKind } from "@/types/upload";
import { Field, Segmented, TextInput } from "@/components/upload/form/Fields";
import Poster from "@/components/ui/Poster";

const KIND_LABEL: Record<SubmitterKind, string> = {
  producer: "Producer",
  director: "Director",
  "production-house": "Production house",
};

/** The same four states the admin reviews against. */
const APPROVAL: Record<ApprovalState, { label: string; tone: string }> = {
  draft: { label: "Not sent yet", tone: "border-white/15 bg-white/[0.05] text-white/60" },
  pending: { label: "Waiting for approval", tone: "border-amber-400/40 bg-amber-400/10 text-amber-300" },
  approved: { label: "Approved", tone: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
  rejected: { label: "Rejected", tone: "border-brand/50 bg-brand/12 text-brand" },
};

/*
 * What happened after the yes.
 *
 * Approval and publication are two different things, and the gap between them
 * is the bit people actually ask about: a film can be approved on Tuesday and
 * not appear until its release date. Approval says the programmers said yes;
 * this says whether anyone can watch it yet.
 */
function liveStateOf(item: ContentItem): { label: string; tone: string; live: boolean } | null {
  if (item.approval.state !== "approved") return null;

  if (item.status === "published") {
    return {
      label: "Live on Weshort",
      tone: "border-emerald-400/70 bg-emerald-400/15 text-emerald-200",
      live: true,
    };
  }
  if (item.status === "scheduled") {
    return {
      label: item.publishAt ? `Live ${dateOf(item.publishAt)}` : "Scheduled",
      tone: "border-sky-400/50 bg-sky-400/10 text-sky-200",
      live: false,
    };
  }
  // approved, but taken down again or not released — say so rather than imply
  // it is out there
  return {
    label: item.status === "archived" ? "Taken down" : "Not live yet",
    tone: "border-white/25 bg-white/[0.05] text-white/60",
    live: false,
  };
}

const dateOf = (iso: string) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    : "—";

/* ------------------------------- sub-parts ------------------------------ */

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="font-display text-[1.5rem] font-bold leading-none tabular-nums">{value}</p>
      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{label}</p>
    </div>
  );
}

function SubmissionRow({ item }: { item: ContentItem }) {
  const state = APPROVAL[item.approval.state] ?? APPROVAL.draft;
  const published = liveStateOf(item);

  return (
    <li className="flex flex-wrap items-center gap-4 border-b border-white/[0.07] py-4 last:border-0">
      <div className="flex h-16 w-11 shrink-0 items-center justify-center overflow-hidden rounded border border-white/10 bg-white/[0.04]">
        <Poster
          src={item.poster}
          className="h-full w-full object-cover"
          fallback={
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/25" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="m4 16 5-5 4 4 3-3 4 4" />
            </svg>
          }
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold">{item.title || "Untitled"}</p>
        <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white/35">
          {[
            item.type === "movie" ? "Short film" : item.type,
            item.approval.submittedAt ? `sent ${dateOf(item.approval.submittedAt)}` : "not sent",
            item.id,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {item.approval.state === "rejected" && item.approval.note ? (
          <p className="mt-2 rounded border border-brand/30 bg-brand/[0.07] px-3 py-2 text-[12.5px] leading-relaxed text-white/75">
            <span className="font-semibold text-white">Why: </span>
            {item.approval.note}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {/* Half-finished films are worth an obvious way back into them. */}
        {item.approval.state === "draft" ? (
          <Link
            href={`${ROUTES.submit}?draft=${encodeURIComponent(item.id)}`}
            className="rounded border border-white/15 px-3 py-1.5 text-[12px] font-semibold text-white/70 transition hover:border-white/35 hover:text-white"
          >
            Continue
          </Link>
        ) : null}

        <div className="flex flex-col items-end gap-1.5">
          <span className={`rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${state.tone}`}>
            {state.label}
          </span>

          {published ? (
            <span
              className={`flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${published.tone}`}
            >
              {/* the dot only breathes for something actually playing */}
              <span className="relative flex h-1.5 w-1.5">
                {published.live && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                    published.live ? "bg-emerald-400" : "bg-current opacity-60"
                  }`}
                />
              </span>
              {published.label}
            </span>
          ) : null}
        </div>
      </div>
    </li>
  );
}

/* -------------------------------- routes -------------------------------- */

/** The two ways in, and what each is for. */
const ROUTES_IN = [
  {
    href: ROUTES.uploadProducer,
    label: "Producer & Director",
    note: "You made the film. Send it, keep your rights, hear back either way.",
    icon: (
      <>
        <path d="M4 6.5h11a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 16V8A1.5 1.5 0 0 1 4 6.5Z" />
        <path d="m16.5 13 4 2.5v-7L16.5 11" />
      </>
    ),
  },
  {
    href: ROUTES.uploadProductionHouse,
    label: "Production House",
    note: "A whole slate at once, with delivery specs and terms set out up front.",
    icon: (
      <>
        <path d="M3 20.5V6l7-3v17.5" />
        <path d="M10 9.5h8a1 1 0 0 1 1 1v10" />
        <path d="M2 20.5h20M6 9v.01M6 13v.01M14 13v.01M14 17v.01" />
      </>
    ),
  },
];

/**
 * The two upload routes, as pages to read rather than buttons to press.
 *
 * They are not actions — they describe what Weshort takes and on what terms —
 * so they sit apart from "Submit a film" instead of beside it, where a row of
 * similar-looking buttons made all three look like the same kind of thing.
 */
function Routes() {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">
        How you work with us
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {ROUTES_IN.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className="group rounded-lg border border-white/10 bg-white/[0.03] p-5 transition duration-200 hover:border-white/25 hover:bg-white/[0.05]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-white/65 transition duration-200 group-hover:border-brand/50 group-hover:text-brand">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                {route.icon}
              </svg>
            </span>

            <h3 className="mt-3.5 text-[14.5px] font-semibold">{route.label}</h3>
            <p className="mt-1 text-[12.5px] leading-relaxed text-white/45">{route.note}</p>

            <span className="mt-3.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/35 transition duration-200 group-hover:text-white">
              See the page
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- details ------------------------------- */

function Details({ account }: { account: Account }) {
  const [form, setForm] = useState({
    name: account.name,
    company: account.company,
    phone: account.phone,
    kind: account.kind,
  });
  const [saved, setSaved] = useState(false);

  const dirty =
    form.name !== account.name ||
    form.company !== account.company ||
    form.phone !== account.phone ||
    form.kind !== account.kind;

  const save = () => {
    updateAccount(form);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="rounded-lg border border-white/12 bg-white/[0.03] p-6">
      <h2 className="text-[15px] font-semibold">Your details</h2>
      <p className="mt-1 text-[13px] text-white/45">
        These are filled in for you on every submission, so you never retype them.
      </p>

      <div className="mt-6 flex flex-col gap-6">
        <Field label="Submitting as">
          <Segmented
            value={form.kind}
            onChange={(v) => setForm({ ...form, kind: v as SubmitterKind })}
            options={[
              { value: "producer", label: "Producer" },
              { value: "director", label: "Director" },
              { value: "production-house", label: "Production house" },
            ]}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Full name">
            <TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          </Field>
          <Field label="Company" hint="If you submit on behalf of one.">
            <TextInput value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
          </Field>
          <Field label="Phone">
            <TextInput type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          </Field>
          <Field label="Email" hint="Sign-in address — the reply to a submission goes here.">
            <TextInput value={account.email} onChange={() => undefined} />
          </Field>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={!dirty}
          className="rounded bg-brand px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-brand-hover disabled:opacity-40"
        >
          Save changes
        </button>
        {saved ? <span className="text-[12.5px] text-emerald-300">Saved</span> : null}
      </div>
    </div>
  );
}

/* --------------------------------- page --------------------------------- */

export default function ProfileView() {
  const { account, ready } = useSession();
  const [items, setItems] = useState<ContentItem[] | null>(null);
  const [error, setError] = useState("");

  const accountId = account?.id ?? "";

  useEffect(() => {
    if (!accountId) return;
    let alive = true;
    submissionApi
      .mine(accountId)
      .then((page) => alive && setItems(page.items))
      .catch((cause: Error) => alive && setError(cause.message));
    return () => {
      alive = false;
    };
  }, [accountId]);

  if (!ready) {
    return <div className="py-24 text-center text-[13.5px] text-white/40">Loading your profile…</div>;
  }

  if (!account) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-white/12 bg-white/[0.03] p-10 text-center">
        <h2 className="text-[1.3rem] font-bold tracking-[-0.02em]">You are signed out</h2>
        <p className="mt-3 text-[14px] leading-relaxed text-white/50">
          Sign in to see your profile and the films you have sent us.
        </p>
        <Link
          href={ROUTES.login}
          className="mt-7 inline-flex rounded bg-brand px-6 py-3 text-[13.5px] font-semibold text-white transition hover:bg-brand-hover"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const submissions = items ?? [];
  // approved and actually out there — the two are not the same number
  const live = submissions.filter((c) => c.status === "published").length;
  const count = (state: ApprovalState) =>
    submissions.filter((s) => s.approval.state === state).length;

  return (
    <div className="flex flex-col gap-8">
      {/* ------------------------------ identity ----------------------------- */}
      <div className="rounded-lg border border-white/12 bg-white/[0.03] p-6">
        <div className="flex flex-wrap items-center gap-6">
        <span
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-[1.6rem] font-bold text-white ring-1 ring-white/20"
          style={{ background: account.color }}
        >
          {account.initials}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[1.6rem] font-bold tracking-[-0.02em]">{account.name}</h1>
            <span className="rounded border border-brand/40 bg-brand/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-brand">
              {KIND_LABEL[account.kind]}
            </span>
          </div>
          <p className="mt-1.5 text-[13.5px] text-white/50">
            {[account.email, account.company].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-white/30">
            Member since {dateOf(account.joinedAt)} · {account.id}
          </p>
        </div>

        <button
          type="button"
          onClick={signOut}
          className="shrink-0 rounded border border-white/15 px-4 py-2.5 text-[13px] font-semibold text-white/70 transition hover:border-white/35 hover:text-white"
        >
          Sign out
        </button>
        </div>

        {/* The one thing a member came here to do, kept with who they are. */}
        <div className="mt-6 border-t border-white/[0.08] pt-5">
          <Link
            href={ROUTES.submit}
            className="inline-flex items-center gap-2 rounded bg-brand px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-brand-hover"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 16V4M7 9l5-5 5 5" />
              <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
            </svg>
            Submit a film
          </Link>
        </div>
      </div>

      {/* -------------------------------- routes ----------------------------- */}
      <Routes />

      {/* ------------------------------- totals ------------------------------ */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="Submitted" value={submissions.length} />
        <Stat label="In review" value={count("pending")} />
        <Stat label="Approved" value={count("approved")} />
        <Stat label="Published" value={live} />
        <Stat label="Rejected" value={count("rejected")} />
      </div>

      <Details account={account} />

      {/* ---------------------------- submissions ---------------------------- */}
      <div className="rounded-lg border border-white/12 bg-white/[0.03] p-6">
        <div>
          <h2 className="text-[15px] font-semibold">Your submissions</h2>
          <p className="mt-1 text-[13px] text-white/45">
            Every film sent from this account, and where it is in review.
          </p>
        </div>

        {error ? (
          <p className="mt-6 rounded border border-brand/40 bg-brand/[0.07] p-4 text-[13px] text-white/80">
            {error}
          </p>
        ) : items === null ? (
          <p className="mt-6 text-[13.5px] text-white/40">Loading your submissions…</p>
        ) : submissions.length === 0 ? (
          <p className="mt-6 rounded border border-dashed border-white/15 px-4 py-10 text-center text-[13.5px] text-white/40">
            Nothing sent yet. Anything you submit shows up here with its review status.
          </p>
        ) : (
          <ul className="mt-4">
            {submissions.map((item) => (
              <SubmissionRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
