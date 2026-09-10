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

      <span className={`shrink-0 rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${state.tone}`}>
        {state.label}
      </span>
    </li>
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
  const count = (state: ApprovalState) =>
    submissions.filter((s) => s.approval.state === state).length;

  return (
    <div className="flex flex-col gap-8">
      {/* ------------------------------ identity ----------------------------- */}
      <div className="flex flex-wrap items-center gap-6 rounded-lg border border-white/12 bg-white/[0.03] p-6">
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

      {/* ------------------------------- totals ------------------------------ */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Submitted" value={submissions.length} />
        <Stat label="In review" value={count("pending")} />
        <Stat label="Approved" value={count("approved")} />
        <Stat label="Rejected" value={count("rejected")} />
      </div>

      <Details account={account} />

      {/* ---------------------------- submissions ---------------------------- */}
      <div className="rounded-lg border border-white/12 bg-white/[0.03] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold">Your submissions</h2>
            <p className="mt-1 text-[13px] text-white/45">
              Every film sent from this account, and where it is in review.
            </p>
          </div>
          <Link
            href={ROUTES.submit}
            className="rounded bg-brand px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-brand-hover"
          >
            Submit a film
          </Link>
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
