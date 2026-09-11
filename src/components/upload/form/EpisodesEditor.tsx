"use client";

import { useState } from "react";
import type { EpisodeItem, SeasonItem, VideoAsset } from "@/types/upload";
import { formatDuration } from "@/lib/upload-meta";
import { Field, TextArea, TextInput } from "./Fields";
import { VideoUploader } from "./MediaFields";

let seq = 0;
const nextId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${seq++}`;

/**
 * The next number in a list, taken from the highest already used.
 *
 * Not the count: delete episode 2 of three and the count says the next one is
 * 3, which already exists. Two episodes numbered 3 is worse than a gap.
 */
const nextNumber = (used: number[]) => (used.length ? Math.max(...used) + 1 : 1) || 1;

/** A season opened straight away, so adding an episode is one press. */
export const firstSeason = (): SeasonItem => ({
  id: nextId("sea"),
  number: 1,
  title: "Season 1",
  episodes: [],
});

function newEpisode(season: SeasonItem): EpisodeItem {
  const number = nextNumber(season.episodes.map((e) => e.episodeNumber));
  return {
    id: nextId("ep"),
    seasonNumber: season.number,
    episodeNumber: number,
    title: "",
    description: "",
    durationSec: 0,
    releaseDate: "",
    thumbnail: null,
    video: null,
  };
}

/* -------------------------------- episode ------------------------------- */

function Episode({
  episode,
  onChange,
  onRemove,
}: {
  episode: EpisodeItem;
  onChange: (next: EpisodeItem) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(!episode.video && !episode.title);
  const ready = episode.video?.state === "ready";

  return (
    <li className="rounded-lg border border-white/10 bg-white/[0.02]">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] font-mono text-[11px] font-bold tabular-nums">
          {episode.episodeNumber}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-medium">
            {episode.title || <span className="text-white/30">Untitled episode</span>}
          </p>
          <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/35">
            {[
              episode.durationSec ? formatDuration(episode.durationSec) : "",
              ready ? "film ready" : episode.video ? "film uploading" : "no film yet",
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 text-[12px] font-semibold text-white/50 transition hover:text-white"
        >
          {open ? "Close" : "Edit"}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 text-[12px] font-semibold text-white/40 transition hover:text-brand"
        >
          Remove
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-6 border-t border-white/[0.07] px-4 py-5">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Episode title" required>
              <TextInput
                value={episode.title}
                onChange={(title) => onChange({ ...episode, title })}
                placeholder="What this one is called"
              />
            </Field>
            <Field label="Episode number">
              <TextInput
                type="number"
                value={String(episode.episodeNumber)}
                onChange={(v) => onChange({ ...episode, episodeNumber: Number(v) || 1 })}
              />
            </Field>
          </div>

          <Field label="What happens" hint="Optional. One or two lines.">
            <TextArea
              rows={3}
              value={episode.description}
              onChange={(description) => onChange({ ...episode, description })}
            />
          </Field>

          <VideoUploader
            label="The episode"
            hint="Same specification as a single film."
            required
            value={episode.video}
            onChange={(video: VideoAsset | null) =>
              onChange(
                // the runtime read off the file fills the episode length once
                video?.durationSec && !episode.durationSec
                  ? { ...episode, video, durationSec: video.durationSec }
                  : { ...episode, video },
              )
            }
          />
        </div>
      )}
    </li>
  );
}

/* --------------------------------- seasons ------------------------------ */

/**
 * Seasons and their episodes.
 *
 * A series is a list of films, so this is a list of uploaders: press + and the
 * next episode appears, ready for its own file. Numbers come from the highest
 * already used rather than the count, so removing one from the middle cannot
 * produce two episodes with the same number.
 */
export default function EpisodesEditor({
  seasons,
  onChange,
}: {
  seasons: SeasonItem[];
  onChange: (next: SeasonItem[]) => void;
}) {
  const patch = (id: string, next: Partial<SeasonItem>) =>
    onChange(seasons.map((s) => (s.id === id ? { ...s, ...next } : s)));

  const addSeason = () =>
    onChange([
      ...seasons,
      {
        id: nextId("sea"),
        number: nextNumber(seasons.map((s) => s.number)),
        title: `Season ${nextNumber(seasons.map((s) => s.number))}`,
        episodes: [],
      },
    ]);

  return (
    <div className="flex flex-col gap-6">
      {seasons.map((season) => (
        <div key={season.id} className="rounded-lg border border-white/12 bg-white/[0.02] p-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-0 flex-1">
              <Field label="Season title">
                <TextInput
                  value={season.title}
                  onChange={(title) => patch(season.id, { title })}
                />
              </Field>
            </div>
            <div className="w-28">
              <Field label="Number">
                <TextInput
                  type="number"
                  value={String(season.number)}
                  onChange={(v) => {
                    const number = Number(v) || 1;
                    // the episodes belong to this season, so they move with it
                    patch(season.id, {
                      number,
                      episodes: season.episodes.map((e) => ({ ...e, seasonNumber: number })),
                    });
                  }}
                />
              </Field>
            </div>
            {seasons.length > 1 && (
              <button
                type="button"
                onClick={() => onChange(seasons.filter((s) => s.id !== season.id))}
                className="pb-3 text-[12px] font-semibold text-white/40 transition hover:text-brand"
              >
                Remove season
              </button>
            )}
          </div>

          {season.episodes.length > 0 && (
            <ul className="mt-5 flex flex-col gap-2.5">
              {season.episodes.map((episode) => (
                <Episode
                  key={episode.id}
                  episode={episode}
                  onChange={(next) =>
                    patch(season.id, {
                      episodes: season.episodes.map((e) => (e.id === next.id ? next : e)),
                    })
                  }
                  onRemove={() =>
                    patch(season.id, {
                      episodes: season.episodes.filter((e) => e.id !== episode.id),
                    })
                  }
                />
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={() =>
              patch(season.id, { episodes: [...season.episodes, newEpisode(season)] })
            }
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 px-4 py-3.5 text-[13px] font-semibold text-white/55 transition hover:border-brand/60 hover:bg-brand/[0.06] hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add episode {nextNumber(season.episodes.map((e) => e.episodeNumber))}
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addSeason}
        className="self-start text-[13px] font-semibold text-white/45 transition hover:text-white"
      >
        + Add another season
      </button>
    </div>
  );
}
