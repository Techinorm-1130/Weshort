"use client";

import type { ContentItem, Taxonomies } from "@/types/upload";
import { formatDuration } from "@/lib/upload-meta";

/** Turns a stored code back into the word the person picked. */
const labelOf = (options: { value: string; label: string }[] | undefined, value: string) =>
  options?.find((o) => o.value === value)?.label ?? value;

const TYPE_LABEL: Record<ContentItem["type"], string> = {
  movie: "Short film",
  documentary: "Documentary",
  series: "Series",
};

/**
 * The film as Weshort will show it, built while the form is filled in.
 *
 * It is the reason the artwork and the logline matter, and it turns a long form
 * into something with a subject: every field typed changes the thing on the
 * left. Nothing here is decoration — every value shown is a field being sent.
 */
export default function SubmitPreview({
  draft,
  taxonomies,
}: {
  draft: ContentItem;
  taxonomies: Taxonomies | null;
}) {
  // A leftover object URL resolves nowhere; treat it as no poster at all.
  const poster = draft.poster && !draft.poster.startsWith("blob:") ? draft.poster : null;

  const meta = [
    TYPE_LABEL[draft.type],
    draft.releaseDate ? draft.releaseDate.slice(0, 4) : "",
    draft.durationSec ? formatDuration(draft.durationSec) : "",
    draft.ageRating,
  ].filter(Boolean);

  const genres = draft.genres.slice(0, 3).map((g) => labelOf(taxonomies?.genres, g));
  const ready = draft.video?.state === "ready";

  return (
    <div className="relative">
      {/* the stage light, the way the landing hero is lit */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 bg-[radial-gradient(60%_45%_at_50%_25%,rgba(229,9,20,0.16),transparent_75%)] blur-[60px]"
      />

      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/25">
        How it will look
      </p>

      <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-[0_40px_80px_-40px_rgba(0,0,0,1)]">
        {/* poster */}
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-white/[0.03]">
          {poster ? (
            // served by the uploads API; next/image adds nothing over a remote URL here
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white/15">
              <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="m4 16 5-5 4 4 3-3 4 4" />
                <circle cx="9" cy="9" r="1.2" />
              </svg>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Poster</span>
            </div>
          )}

          {/* the play affordance only makes sense once there is a film behind it */}
          {ready && (
            <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/45 backdrop-blur-sm">
              <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 text-white" fill="currentColor">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </span>
          )}

          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 to-transparent"
          />
        </div>

        {/* the card foot */}
        <div className="px-4 pb-4 pt-3.5">
          <h3 className="truncate text-[15px] font-bold tracking-[-0.01em]">
            {draft.title || <span className="text-white/25">Untitled</span>}
          </h3>

          <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-white/45">
            {draft.shortDescription || draft.description || "Your logline appears here."}
          </p>

          {meta.length > 0 && (
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
              {meta.map((m, i) => (
                <span key={m} className="flex items-center gap-2">
                  {i > 0 && <span className="text-brand/50">·</span>}
                  {m}
                </span>
              ))}
            </p>
          )}

          {genres.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] text-white/55"
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 flex items-center gap-2 text-[12px] text-white/30">
        <span
          className={`h-1.5 w-1.5 rounded-full ${ready ? "bg-emerald-400" : "bg-white/25"}`}
        />
        {ready ? "Film uploaded and ready" : "Nothing sent yet — this is only a preview"}
      </p>
    </div>
  );
}
