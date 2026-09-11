"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { submissionApi, taxonomyApi } from "@/lib/api/resources";
import { useMutation, useQuery } from "@/lib/api/hooks";
import { actorOf, useSession } from "@/lib/session";
import { ROUTES } from "@/lib/constants";
import { errorsForStep, FIELD_STEP, validate } from "@/lib/submission-validation";
import {
  emptySubmission, type ContentItem, type SubmitterKind, type UploadState,
} from "@/types/upload";
import { ChipSelect, Field, Segmented, Select, TextArea, TextInput, Toggle } from "./form/Fields";
import { ImageDrop, SubtitleList, VideoUploader } from "./form/MediaFields";
import SubmitPreview from "./SubmitPreview";
import Poster from "@/components/ui/Poster";

const STEPS = [
  { label: "The film", hint: "Title, description, genre" },
  { label: "Media", hint: "Video and artwork" },
  { label: "Audio & subtitles", hint: "Languages and tracks" },
  { label: "You", hint: "Who is submitting" },
  { label: "Review", hint: "Check and send" },
];

const KIND_LABEL: Record<SubmitterKind, string> = {
  producer: "Producer",
  director: "Director",
  "production-house": "Production house",
};

/** How the review step names each stage of the upload. */
const VIDEO_STATE_LABEL: Record<UploadState, string> = {
  idle: "Waiting",
  uploading: "Uploading",
  processing: "Processing",
  ready: "Ready",
  failed: "Failed",
};

/** Whether the visitor has asked the system for less movement. */
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Back to the top of the page.
 *
 * For when the whole view is replaced rather than swapped step for step — the
 * page keeps its scroll position through that, so a confirmation that replaces
 * a long form opens somewhere below the fold.
 */
const scrollToTop = () => {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, behavior: "auto" });
};

/**
 * The review step, grouped the way the form asked for it — so what is being
 * sent reads back in the same order it was filled in.
 */
function SUMMARY(
  draft: ContentItem,
  stateLabel: Record<UploadState, string>,
): { heading: string; rows: [string, string][] }[] {
  const video = draft.video;
  return [
    {
      heading: "The film",
      rows: [
        ["Type", draft.type === "movie" ? "Short film" : draft.type],
        ["Release", draft.releaseDate],
        ["Language", draft.language],
        ["Country", draft.country],
        ["Genres", draft.genres.join(", ")],
        ["Age rating", draft.ageRating],
      ],
    },
    {
      heading: "Media",
      rows: [
        ["Film", video?.name ?? ""],
        ["Status", video ? stateLabel[video.state] : ""],
        ["Resolution", video?.width && video?.height ? `${video.width} × ${video.height}` : ""],
        ["Trailer", draft.trailer?.name ?? ""],
        ["Audio", draft.audioLanguages.join(", ")],
        ["Subtitles", draft.subtitles.length ? `${draft.subtitles.length} file(s)` : ""],
      ],
    },
    {
      heading: "You",
      rows: [
        ["Name", draft.submitter.name],
        ["Company", draft.submitter.company],
        ["Email", draft.submitter.email],
        ["Phone", draft.submitter.phone],
      ],
    },
  ];
}

/**
 * The public submission flow: fills the same `ContentItem` the admin's own
 * upload wizard fills and hands it over with `POST /contents/:id/submit`, which
 * is what puts it in the admin's "Waiting for approval" view.
 *
 * The draft is created on the backend at the first step change rather than at
 * the end, so a part-finished submission is recoverable and the video has an id
 * to attach to. Everything selectable is loaded from `/taxonomies`.
 */
export default function SubmitWizard({
  kind,
  draftId,
}: {
  kind: SubmitterKind;
  /** Set when carrying on with something already started. */
  draftId?: string;
}) {
  const { data: taxonomies } = useQuery(() => taxonomyApi.all());
  const { account } = useSession();

  const [draft, setDraft] = useState<ContentItem>(() => emptySubmission(kind));
  const [step, setStep] = useState(0);
  /** The top of the form column, so a step change can bring it into view. */
  const formTop = useRef<HTMLDivElement>(null);
  /** Steps the person has tried to leave — errors only appear after that. */
  const [touched, setTouched] = useState<number[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [sent, setSent] = useState<ContentItem | null>(null);
  /** A problem of our own, separate from one a request reported. */
  const [problem, setProblem] = useState("");
  /** Briefly acknowledges an explicit save, so it is clear it happened. */
  const [justSaved, setJustSaved] = useState(false);
  /** Set while a half-finished submission is being fetched back. */
  const [loading, setLoading] = useState(Boolean(draftId));

  const create = useMutation((payload: Partial<ContentItem>) => submissionApi.create(payload));
  const update = useMutation((id: string, payload: Partial<ContentItem>) =>
    submissionApi.update(id, payload),
  );
  const send = useMutation((id: string) => submissionApi.submit(id));

  /**
   * Carries on with something already started.
   *
   * The whole submission comes back, so the form opens exactly where it was
   * left — including the film, which stays uploaded and does not have to be
   * sent again.
   */
  useEffect(() => {
    if (!draftId) return;

    let alive = true;
    submissionApi
      .get(draftId)
      .then((found) => {
        if (!alive) return;
        setDraft(found);
        // it was theirs to begin with, so the rights box was already ticked
        setAgreed(true);
      })
      .catch(() => alive && setProblem("That draft could not be opened. It may have been sent already."))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [draftId]);

  /**
   * The signed-in account fills in who is submitting, so nobody retypes what we
   * already know. It only ever fills a blank — anything typed here wins.
   */
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || !account) return;
    seeded.current = true;
    setDraft((d) => ({
      ...d,
      uploadedBy: actorOf(account),
      submitter: {
        kind: d.submitter.kind,
        name: d.submitter.name || account.name,
        company: d.submitter.company || account.company,
        email: d.submitter.email || account.email,
        phone: d.submitter.phone || account.phone,
      },
    }));
  }, [account]);

  /**
   * Moves to a step and puts its start back under the eye.
   *
   * Without this the page keeps whatever scroll position it had, so pressing
   * Continue at the foot of a long step opened the next one already scrolled to
   * its bottom. Every step change goes through here — the markers, Back,
   * Continue, and the jumps from the review step's list of what is missing.
   */
  const goToStep = (index: number) => {
    setStep(index);

    const el = formTop.current;
    if (!el || typeof window === "undefined") return;

    // The header floats over the page, so stopping at the exact top would tuck
    // the step heading underneath it.
    const HEADER = 112;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  /**
   * A safety net for the scroll done in `submit()`.
   *
   * Replacing the form costs the page most of its height, and the browser
   * re-anchors the scroll position when that much content disappears. Landing
   * back at the top has to survive that, so it is asked for again once the
   * confirmation is on screen — instantly, because a smooth scroll starting
   * from a position that no longer exists does not reliably arrive.
   */
  useEffect(() => {
    if (!sent || typeof window === "undefined") return;
    const settle = requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
    return () => cancelAnimationFrame(settle);
  }, [sent]);

  const errors = useMemo(() => validate(draft, agreed), [draft, agreed]);
  const visible = touched.includes(step) || step === STEPS.length - 1 ? errorsForStep(errors, step) : {};
  const set = (patch: Partial<ContentItem>) => setDraft((d) => ({ ...d, ...patch }));

  const pending = create.pending || update.pending || send.pending;
  const failed = create.error ?? update.error ?? send.error;

  /** Keeps the server copy in step as the person moves through the wizard. */
  async function persist(): Promise<ContentItem | null> {
    // `uploadedBy` is the identity the admin reads. Stamping it here as well as
    // on seed means it is on the record even if the session resolved late.
    const payload: ContentItem = account ? { ...draft, uploadedBy: actorOf(account) } : draft;

    if (!payload.id) {
      const created = await create.run(payload);
      if (created) setDraft(created);
      return created;
    }
    const saved = await update.run(payload.id, payload);
    if (saved) setDraft(saved);
    return saved;
  }

  async function next() {
    setTouched((t) => (t.includes(step) ? t : [...t, step]));
    if (Object.keys(errorsForStep(errors, step)).length > 0) return;
    await persist();
    goToStep(Math.min(STEPS.length - 1, step + 1));
  }

  /**
   * Keeps what has been filled in so far and says so.
   *
   * Every step already saves on the way past, so this mostly exists to be
   * visible: it makes leaving a half-finished film an offered choice rather
   * than something to hope for.
   */
  async function saveDraft() {
    setProblem("");
    const saved = await persist();
    if (!saved) return;
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2600);
  }

  async function submit() {
    setTouched(STEPS.map((_, i) => i));
    if (Object.keys(errors).length > 0) {
      // land on the first step that still has a problem
      const first = Math.min(...Object.keys(errors).map((f) => FIELD_STEP[f] ?? 0));
      goToStep(first);
      return;
    }
    setProblem("");
    const saved = await persist();
    if (!saved) return;
    // Without an id there is no draft to hand over, and the call would address
    // /contents//submit. Say so rather than firing a request that cannot work.
    if (!saved.id) {
      setProblem("The draft was not saved properly, so it could not be sent. Try again.");
      return;
    }
    const done = await send.run(saved.id);
    if (!done) return;

    // Go to the top while the form is still standing. Scrolling first and
    // swapping second means there is no tall page to fall back down through —
    // the confirmation simply appears where the eye already is.
    scrollToTop();
    setSent(done);
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-xl py-24 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-brand/50 bg-brand/10 text-brand">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12.5l5 5L20 6.5" />
          </svg>
        </span>
        <h1 className="mt-6 text-[1.8rem] font-bold tracking-[-0.02em]">Sent for review</h1>
        <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-white/55">
          <span className="font-semibold text-white">{sent.title}</span> is with our programmers.
          Two of them watch every submission in full, and you will hear back either way — the reply
          goes to {sent.submitter.email}.
        </p>
        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-white/35">
          Reference {sent.id}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={ROUTES.account}
            className="inline-flex items-center gap-2 rounded bg-brand px-6 py-3 text-[13.5px] font-semibold text-white transition hover:bg-brand-hover"
          >
            Track it in your profile
          </Link>
          <Link
            href={ROUTES.home}
            className="inline-flex items-center gap-2 rounded border border-white/15 px-6 py-3 text-[13.5px] font-semibold text-white/75 transition hover:border-white/35 hover:text-white"
          >
            Back to Weshort
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <p className="py-24 text-center text-[13.5px] text-white/40">
        Opening where you left off…
      </p>
    );
  }

  const tx = taxonomies;

  const current = STEPS[step];

  return (
    <div className="grid gap-12 lg:grid-cols-[19rem_1fr] lg:gap-16">
      {/* --------------------- the film, taking shape ----------------------- */}
      <aside className="order-2 lg:order-1 lg:sticky lg:top-28 lg:self-start">
        <SubmitPreview draft={draft} taxonomies={tx ?? null} />
      </aside>

      {/* -------------------------------- the form -------------------------- */}
      <div ref={formTop} className="order-1 min-w-0 scroll-mt-28 lg:order-2">
        {/* chapter markers — where you are, and what is left */}
        <nav aria-label="Steps" className="flex gap-2">
          {STEPS.map((s, i) => {
            const problems = touched.includes(i) && Object.keys(errorsForStep(errors, i)).length > 0;
            const here = i === step;
            const done = i < step;

            return (
              <button
                key={s.label}
                type="button"
                onClick={() => goToStep(i)}
                aria-current={here ? "step" : undefined}
                className="group min-w-0 flex-1 text-left"
              >
                <span
                  className={`block h-[3px] rounded-full transition-colors duration-300 ${
                    problems
                      ? "bg-brand"
                      : here
                        ? "bg-brand"
                        : done
                          ? "bg-white/70"
                          : "bg-white/[0.12] group-hover:bg-white/25"
                  }`}
                />
                <span
                  className={`mt-2.5 block truncate text-[11px] font-medium transition-colors ${
                    problems
                      ? "text-brand"
                      : here
                        ? "text-white"
                        : "text-white/30 group-hover:text-white/60"
                  }`}
                >
                  {i + 1}. {s.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* the step itself */}
        <div className="mt-10">
          <h2 className="text-[1.6rem] font-bold leading-tight tracking-[-0.03em] sm:text-[1.9rem]">
            {current.label}
          </h2>
          <p className="mt-2 text-[14px] text-white/45">{current.hint}</p>
        </div>

        <div className="mt-9">
        {/* ---------------------------- the film --------------------------- */}
        {step === 0 && (
          <div className="flex flex-col gap-6">
            <Field label="Type" required group>
              <Segmented
                value={draft.type}
                onChange={(v) => set({ type: v as ContentItem["type"] })}
                options={[
                  { value: "movie", label: "Short film" },
                  { value: "documentary", label: "Documentary" },
                  { value: "series", label: "Series" },
                ]}
              />
            </Field>

            <Field label="Title" required error={visible.title}>
              <TextInput
                value={draft.title}
                onChange={(v) => set({ title: v })}
                placeholder="The title as it should appear"
                invalid={Boolean(visible.title)}
              />
            </Field>

            <Field label="Logline" hint="One sentence, shown in listings.">
              <TextInput
                value={draft.shortDescription}
                onChange={(v) => set({ shortDescription: v })}
                placeholder="A caving expedition drops into the deepest cave in Europe…"
              />
            </Field>

            <Field label="Synopsis" required error={visible.description}>
              <TextArea
                value={draft.description}
                onChange={(v) => set({ description: v })}
                placeholder="What happens, and who it is for."
                invalid={Boolean(visible.description)}
              />
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Release date" required error={visible.releaseDate}>
                <TextInput
                  type="date"
                  value={draft.releaseDate}
                  onChange={(v) => set({ releaseDate: v })}
                  invalid={Boolean(visible.releaseDate)}
                />
              </Field>
              <Field label="Runtime (minutes)">
                <TextInput
                  type="number"
                  value={draft.durationSec ? String(Math.round(draft.durationSec / 60)) : ""}
                  onChange={(v) => set({ durationSec: Number(v) * 60 })}
                  placeholder="18"
                />
              </Field>
              <Field label="Original language" required error={visible.language}>
                <Select
                  value={draft.language}
                  onChange={(v) => set({ language: v })}
                  options={tx?.languages ?? []}
                  invalid={Boolean(visible.language)}
                />
              </Field>
              <Field label="Country of production" required error={visible.country}>
                <Select
                  value={draft.country}
                  onChange={(v) => set({ country: v })}
                  options={tx?.countries ?? []}
                  invalid={Boolean(visible.country)}
                />
              </Field>
            </div>

            <Field label="Genres" hint="Up to three." required group error={visible.genres}>
              <ChipSelect
                values={draft.genres}
                onChange={(v) => set({ genres: v })}
                options={tx?.genres ?? []}
                max={3}
              />
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Age rating" required error={visible.ageRating}>
                <Select
                  value={draft.ageRating}
                  onChange={(v) => set({ ageRating: v })}
                  options={tx?.classifications ?? []}
                  invalid={Boolean(visible.ageRating)}
                />
              </Field>
              <Field label="Category">
                <Select
                  value={draft.category}
                  onChange={(v) => set({ category: v })}
                  options={tx?.categories ?? []}
                />
              </Field>
            </div>
          </div>
        )}

        {/* ------------------------------ media ---------------------------- */}
        {step === 1 && (
          <div className="flex flex-col gap-8">
            <VideoUploader
              label="The film"
              hint="ProRes 422 HQ or higher, 1080p minimum. 4K preferred."
              value={draft.video}
              onChange={(v) =>
                // the runtime read off the file fills the field on step one, so
                // nobody types a number we already know
                set(v?.durationSec && !draft.durationSec ? { video: v, durationSec: v.durationSec } : { video: v })
              }
              required
              error={visible.video}
            />

            <VideoUploader
              label="Trailer"
              hint="Optional. A short cut we can run in listings and on the home rails."
              value={draft.trailer}
              onChange={(v) => set({ trailer: v })}
              error={visible.trailer}
            />

            <div className="grid gap-6 sm:grid-cols-3">
              <ImageDrop
                label="Poster"
                value={draft.poster}
                onChange={(v) => set({ poster: v })}
                required
                error={visible.poster}
              />
              <ImageDrop
                label="Thumbnail"
                ratio="aspect-video"
                value={draft.thumbnail}
                onChange={(v) => set({ thumbnail: v })}
              />
              <ImageDrop
                label="Banner"
                ratio="aspect-video"
                value={draft.banner}
                onChange={(v) => set({ banner: v })}
              />
            </div>
          </div>
        )}

        {/* ------------------------ audio & subtitles ---------------------- */}
        {step === 2 && (
          <div className="flex flex-col gap-8">
            <Field
              label="Audio languages"
              hint="Every language the film is spoken or dubbed in."
              required
              group
              error={visible.audioLanguages}
            >
              <ChipSelect
                values={draft.audioLanguages}
                onChange={(v) => set({ audioLanguages: v })}
                options={tx?.languages ?? []}
              />
            </Field>

            <SubtitleList
              tracks={draft.subtitles}
              onChange={(v) => set({ subtitles: v })}
              languages={tx?.languages ?? []}
            />

            <p className="rounded-md border border-white/10 bg-white/[0.02] p-4 text-[13px] leading-relaxed text-white/50">
              Send the source-language track only. We produce, translate and QC every other language
              at our own cost, and send them back for your approval before release.
            </p>
          </div>
        )}

        {/* -------------------------------- you ---------------------------- */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <Field label="Submitting as" group>
              <Segmented
                value={draft.submitter.kind}
                onChange={(v) =>
                  set({ submitter: { ...draft.submitter, kind: v as SubmitterKind } })
                }
                options={[
                  { value: "producer", label: "Producer" },
                  { value: "director", label: "Director" },
                  { value: "production-house", label: "Production house" },
                ]}
              />
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Your name" required error={visible.submitterName}>
                <TextInput
                  value={draft.submitter.name}
                  onChange={(v) => set({ submitter: { ...draft.submitter, name: v } })}
                  invalid={Boolean(visible.submitterName)}
                />
              </Field>
              <Field label="Company" hint="If you are submitting on behalf of one.">
                <TextInput
                  value={draft.submitter.company}
                  onChange={(v) => set({ submitter: { ...draft.submitter, company: v } })}
                />
              </Field>
              <Field label="Email" required error={visible.submitterEmail}>
                <TextInput
                  type="email"
                  value={draft.submitter.email}
                  onChange={(v) => set({ submitter: { ...draft.submitter, email: v } })}
                  invalid={Boolean(visible.submitterEmail)}
                />
              </Field>
              <Field label="Phone">
                <TextInput
                  type="tel"
                  value={draft.submitter.phone}
                  onChange={(v) => set({ submitter: { ...draft.submitter, phone: v } })}
                />
              </Field>
            </div>

            <Toggle
              checked={agreed}
              onChange={setAgreed}
              label="I hold the rights to this film"
              hint="Music and archive included, cleared for streaming for the licence term."
            />
            {visible.rights && <p className="-mt-3 text-[12px] text-brand">{visible.rights}</p>}

            <Toggle
              checked={draft.allowDownload}
              onChange={(v) => set({ allowDownload: v })}
              label="Allow offline downloads"
              hint="Viewers can keep it on their device while the licence runs."
            />
          </div>
        )}

        {/* ------------------------------ review --------------------------- */}
        {step === 4 && (
          <div className="flex flex-col gap-6">
            {/* the title, as it will read on the record */}
            <div className="flex flex-wrap items-start gap-5 rounded-lg border border-white/10 bg-white/[0.03] p-5">
              <div className="flex h-[6.5rem] w-[4.4rem] shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-white/[0.04]">
                <Poster
                  src={draft.poster}
                  className="h-full w-full object-cover"
                  fallback={
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-white/20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <path d="m4 16 5-5 4 4 3-3 4 4" />
                    </svg>
                  }
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand">
                  {KIND_LABEL[draft.submitter.kind]} submission
                </p>
                <h3 className="mt-2 text-[1.35rem] font-bold leading-tight tracking-[-0.02em]">
                  {draft.title || "Untitled"}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-white/50">
                  {draft.shortDescription || draft.description || "No description yet."}
                </p>
              </div>
            </div>

            {/* everything being sent, grouped the way it was asked for */}
            {SUMMARY(draft, VIDEO_STATE_LABEL).map((section) => (
              <div key={section.heading}>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">
                  {section.heading}
                </p>
                <dl className="mt-3 rounded-lg border border-white/10">
                  {section.rows.map(([label, value], i) => (
                    <div
                      key={label}
                      className={`flex items-baseline gap-4 px-4 py-2.5 ${
                        i ? "border-t border-white/[0.06]" : ""
                      }`}
                    >
                      <dt className="w-28 shrink-0 text-[12.5px] text-white/40">{label}</dt>
                      <dd className="min-w-0 flex-1 truncate text-[13px] text-white/85">
                        {value || "—"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}

            {Object.keys(errors).length > 0 && (
              <div className="rounded-lg border border-brand/40 bg-brand/[0.07] p-4">
                <p className="text-[13px] font-semibold">Still missing</p>
                <ul className="mt-2 flex flex-col gap-1">
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field}>
                      <button
                        type="button"
                        onClick={() => goToStep(FIELD_STEP[field] ?? 0)}
                        className="text-left text-[13px] text-white/70 underline-offset-4 hover:text-white hover:underline"
                      >
                        {message}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-[13px] leading-relaxed text-white/45">
              Submitting sends the film to our programmers for review. Nothing is published until it
              has been approved, and you will hear back either way.
            </p>
          </div>
        )}

        {(failed ?? problem) && (
          <p className="mt-6 flex items-start gap-2.5 rounded-lg border border-brand/40 bg-brand/[0.07] p-3.5 text-[13px] leading-relaxed text-white/85">
            <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7.5v5M12 16.2v.01" />
            </svg>
            {failed ?? problem}
          </p>
        )}
        </div>

        {/* ------------------------------ controls ------------------------- */}
        <div className="mt-12 flex items-center justify-between gap-4 border-t border-white/[0.08] pt-7">
          <button
            type="button"
            onClick={() => goToStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="group inline-flex items-center gap-2 text-[13px] font-semibold text-white/45 transition hover:text-white disabled:pointer-events-none disabled:opacity-0"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 6-6 6 6 6" />
            </svg>
            Back
          </button>

          <div className="flex items-center gap-4">
            {/*
              Leaving half-finished is an offered choice, not something to hope
              for. What is here is kept, including the film, and the profile
              lists it as not sent yet with a way back in.
            */}
            <button
              type="button"
              onClick={saveDraft}
              disabled={pending}
              className="text-[13px] font-semibold text-white/45 transition hover:text-white disabled:opacity-40"
            >
              {justSaved ? "Saved — finish it any time" : "Save as draft"}
            </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              disabled={pending}
              className="group inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3 text-[13.5px] font-semibold text-black transition duration-300 hover:bg-white/90 disabled:opacity-50"
            >
              {pending ? "Saving…" : "Continue"}
              <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="inline-flex items-center gap-2.5 rounded-full bg-brand px-8 py-3 text-[13.5px] font-semibold text-white shadow-[0_18px_40px_-16px_rgba(229,9,20,0.95)] transition duration-300 hover:bg-brand-hover disabled:opacity-60"
            >
              {pending ? "Sending…" : "Submit for review"}
            </button>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
