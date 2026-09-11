"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { SubtitleTrack, UploadAsset, UploadConfig, UploadState, VideoAsset } from "@/types/upload";
import { probeVideo, sendFile, uploadApi, type Transfer } from "@/lib/api/uploads";
import Select from "@/components/ui/Select";
import {
  fileProblem, formatBytes, formatDuration, formatEta, formatLimits, formatSpeed,
  uploadStatusLabel,
} from "@/lib/upload-meta";

const makeId = (p: string) => `${p}_${Math.random().toString(36).slice(2, 9)}`;

/** How often we ask the server whether processing has finished. */
const POLL_MS = 1200;

/* ------------------------------ small parts ----------------------------- */

function StatusPill({ state }: { state: UploadState }) {
  const tone =
    state === "ready"
      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
      : state === "failed"
        ? "border-brand/50 bg-brand/12 text-brand"
        : state === "processing"
          ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
          : "border-white/15 bg-white/[0.05] text-white/60";

  return (
    <span className={`shrink-0 rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${tone}`}>
      {uploadStatusLabel(state === "idle" ? "waiting" : state)}
    </span>
  );
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ----------------------------- video upload ----------------------------- */

/**
 * The film itself, on the same pipeline the WeShort admin runs.
 *
 * Choosing a file registers the asset, sends the bytes with progress measured
 * from the transfer, and then waits on the server while it is processed — the
 * same states, the same words and the same retries as the dashboard. Nothing
 * advances on a timer, and a failure says which step failed so the right retry
 * can be offered: a broken transfer needs the file again, a rejected file does
 * not.
 */
export function VideoUploader({
  label,
  hint,
  value,
  onChange,
  required,
  error,
}: {
  label: string;
  hint?: string;
  value: VideoAsset | null;
  onChange: (asset: VideoAsset | null) => void;
  required?: boolean;
  error?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const transfer = useRef<Transfer | null>(null);
  const latest = useRef(onChange);
  const [config, setConfig] = useState<UploadConfig | null>(null);
  const [dragging, setDragging] = useState(false);
  /** A file refused before anything was sent — wrong format, too big, empty. */
  const [refused, setRefused] = useState("");

  useEffect(() => {
    latest.current = onChange;
  });

  useEffect(() => {
    let alive = true;
    uploadApi
      .config()
      .then((value) => alive && setConfig(value))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  /** Everything the field knows about a video comes from one asset record. */
  const fromAsset = (asset: UploadAsset): VideoAsset => ({
    id: asset.id,
    name: asset.fileName,
    sizeBytes: asset.sizeBytes,
    progress: asset.status === "ready" || asset.status === "processing" ? 100 : 0,
    state:
      asset.status === "ready"
        ? "ready"
        : asset.status === "failed"
          ? "failed"
          : asset.status === "uploading" || asset.status === "waiting"
            ? "uploading"
            : "processing",
    qualities: [],
    previewUrl: uploadApi.streamUrl(asset.id),
    error: asset.error || undefined,
    failedStage: asset.failedStage,
    durationSec: asset.media.durationSec,
    width: asset.media.width,
    height: asset.media.height,
  });

  /* ------------------------- waiting on the server ----------------------- */

  const assetId = value?.id ?? "";
  const watching = value?.state === "processing";

  useEffect(() => {
    if (!watching || !assetId) return;

    let alive = true;
    const tick = async () => {
      try {
        const asset = await uploadApi.get(assetId);
        if (!alive) return;

        /*
         * Only an outcome is worth acting on. Anything else means the pipeline
         * is still working — and the answer may simply be out of date, because
         * a record read moments after it was written can still be the version
         * from before.
         *
         * Reacting to those put the field back to "uploading, 0%" for a film
         * that had already arrived, and because that is no longer the state
         * this is watching, the polling stopped and it stayed there.
         */
        if (asset.status !== "ready" && asset.status !== "failed") return;

        latest.current(fromAsset(asset));
      } catch {
        /* a dropped poll is not worth surfacing; the next one will land */
      }
    };

    const timer = window.setInterval(tick, POLL_MS);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [watching, assetId]);

  /* -------------------------------- upload ------------------------------- */

  const upload = async (file: File) => {
    const problem = fileProblem(file, config);
    if (problem) {
      setRefused(`${file.name} — ${problem}`);
      return;
    }
    setRefused("");

    let created: UploadAsset;
    try {
      // What the browser can read off the file before it is sent.
      const media = await probeVideo(file);
      created = await uploadApi.create({
        fileName: file.name,
        sizeBytes: file.size,
        contentType: file.type,
        media,
      });
    } catch (cause) {
      setRefused(cause instanceof Error ? cause.message : "Could not start the upload");
      return;
    }

    const base: VideoAsset = {
      id: created.id,
      name: file.name,
      sizeBytes: file.size,
      progress: 0,
      state: "uploading",
      qualities: [],
      previewUrl: null,
      durationSec: created.media.durationSec,
      width: created.media.width,
      height: created.media.height,
    };
    onChange(base);

    /** Guards against a late progress event landing after the transfer is done. */
    let finished = false;

    // the API decides how the bytes travel; the field just follows it
    const sending = sendFile(created.id, file, (progress) => {
      if (finished) return;
      latest.current({
        ...base,
        progress: progress.percent,
        loadedBytes: progress.loaded,
        speedBps: progress.speedBps,
        etaSec: progress.etaSec,
      });
    }, config);
    transfer.current = sending;

    try {
      const uploaded = await sending.promise;
      finished = true;

      /*
       * The bytes are in. If the record does not yet say so — it may have been
       * read back before the write settled — the honest state is still
       * "processing", not "uploading from the start again".
       */
      const settled = uploaded.status === "ready" || uploaded.status === "failed";
      latest.current(
        settled ? fromAsset(uploaded) : { ...fromAsset(uploaded), state: "processing", progress: 100 },
      );
    } catch (cause) {
      // An abort is a cancel, not a failure — the field simply empties.
      finished = true;
      if (cause instanceof DOMException && cause.name === "AbortError") {
        latest.current(null);
        return;
      }
      latest.current({
        ...base,
        state: "failed",
        failedStage: "upload",
        error: cause instanceof Error ? cause.message : "Upload failed",
      });
    } finally {
      transfer.current = null;
    }
  };

  /** Processing is the only step that can be rerun on its own. */
  const retry = async () => {
    if (!value) return;
    if (value.failedStage === "processing" && value.id) {
      try {
        const asset = await uploadApi.retryProcessing(value.id);
        onChange(fromAsset(asset));
      } catch (cause) {
        setRefused(cause instanceof Error ? cause.message : "Could not retry processing");
      }
      return;
    }
    input.current?.click();
  };

  const clear = () => {
    transfer.current?.abort();
    transfer.current = null;
    if (value?.id && value.state !== "ready") {
      void uploadApi.cancel(value.id).catch(() => undefined);
    }
    setRefused("");
    onChange(null);
  };

  const accept = config?.allowedExtensions.map((e) => `.${e}`).join(",") ?? "video/*";

  /** size · duration · resolution, as far as the file has told us. */
  const meta = value
    ? [
        formatBytes(value.sizeBytes),
        value.durationSec ? formatDuration(value.durationSec) : "",
        value.width && value.height ? `${value.width}×${value.height}` : "",
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <div>
      <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-white/70">
        {label}
        {required && <span className="text-brand/90">*</span>}
      </p>
      {hint && !value && <p className="mt-1 text-[12px] text-white/35">{hint}</p>}

      <input
        ref={input}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void upload(file);
        }}
      />

      {!value ? (
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) void upload(file);
          }}
          className={`mt-2 flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-9 transition ${
            dragging
              ? "border-brand bg-brand/10"
              : error || refused
                ? "border-brand/60 bg-white/[0.02]"
                : "border-white/15 bg-white/[0.02] hover:border-white/35"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-white/45" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V4M7 9l5-5 5 5" />
            <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
          </svg>
          <span className="text-[13.5px] font-medium">Drop the file here, or browse</span>
          <span className="text-[12px] text-white/35">{formatLimits(config)}</span>
        </button>
      ) : (
        <div className="mt-2 rounded-lg border border-white/12 bg-white/[0.03] p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-medium">{value.name}</p>
              <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">
                {meta}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <StatusPill state={value.state} />
              {value.state === "ready" || value.state === "failed" ? (
                <button
                  type="button"
                  onClick={() => input.current?.click()}
                  className="text-[12px] font-semibold text-white/50 transition hover:text-white"
                >
                  Replace
                </button>
              ) : null}
              <button
                type="button"
                onClick={clear}
                className="text-[12px] font-semibold text-white/50 transition hover:text-white"
              >
                {value.state === "uploading" ? "Cancel" : "Remove"}
              </button>
            </div>
          </div>

          {value.state === "uploading" && (
            <div className="mt-3">
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-brand transition-[width] duration-200"
                  style={{ width: `${value.progress}%` }}
                />
              </div>
              <p className="mt-1.5 truncate font-mono text-[11px] text-white/40">
                {[
                  `${value.progress}%`,
                  value.loadedBytes !== undefined
                    ? `${formatBytes(value.loadedBytes)} / ${formatBytes(value.sizeBytes)}`
                    : "",
                  formatSpeed(value.speedBps ?? 0),
                  formatEta(value.etaSec),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          )}

          {value.state === "processing" && (
            // The pipeline reports no percentage, so none is shown.
            <p className="mt-3 flex items-center gap-2 text-[12px] text-amber-300">
              <Spinner />
              Checking the file and preparing it for streaming…
            </p>
          )}

          {value.state === "failed" && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-brand/40 bg-brand/[0.07] px-3.5 py-2.5">
              <span className="min-w-0 text-[12.5px] text-white/80">
                {value.error ?? "The upload failed"}
              </span>
              <button
                type="button"
                onClick={() => void retry()}
                className="shrink-0 rounded border border-white/20 px-3 py-1.5 text-[12px] font-semibold text-white transition hover:border-white/45"
              >
                {value.failedStage === "processing" ? "Retry processing" : "Retry upload"}
              </button>
            </div>
          )}

          {value.state === "ready" && value.previewUrl && (
            <video
              controls
              preload="metadata"
              src={value.previewUrl}
              className="mt-3 w-full rounded-md bg-black"
            />
          )}
        </div>
      )}

      {refused && <p className="mt-1.5 text-[12px] text-brand">{refused}</p>}
      {error && !refused && <p className="mt-1.5 text-[12px] text-brand">{error}</p>}
    </div>
  );
}

/* -------------------------------- artwork ------------------------------- */

/** Artwork slot. Holds a local object URL until the backend returns a real one. */
export function ImageDrop({
  label,
  ratio = "aspect-[2/3]",
  value,
  onChange,
  required,
  error,
}: {
  label: string;
  ratio?: string;
  value: string | null;
  onChange: (v: string | null) => void;
  required?: boolean;
  error?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");

  /** Sends the file and keeps the URL the server gives back, never a blob one. */
  const accept = async (file: File | undefined) => {
    if (!file) return;
    setProblem("");
    setBusy(true);
    try {
      onChange(await uploadApi.uploadImage(file));
    } catch (cause) {
      setProblem(cause instanceof Error ? cause.message : "Could not upload that image");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-white/70">
        {label}
        {required && <span className="text-brand/90">*</span>}
      </p>

      <button
        type="button"
        onClick={() => input.current?.click()}
        className={`group relative mt-2 block w-full overflow-hidden rounded-lg border border-dashed transition ${ratio} ${
          error || problem ? "border-brand/60" : "border-white/15 hover:border-white/35"
        } ${value ? "border-solid border-white/12" : "bg-white/[0.02]"}`}
      >
        {busy ? (
          <span className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/50">
            <Spinner />
            <span className="text-[12px]">Uploading…</span>
          </span>
        ) : value ? (
          <>
            <Image src={value} alt="" fill sizes="220px" className="object-cover" unoptimized />
            <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-[12px] font-semibold opacity-0 transition group-hover:opacity-100">
              Replace
            </span>
          </>
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-white/40">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="m4 16 5-5 4 4 3-3 4 4" />
              <circle cx="9" cy="9" r="1.4" />
            </svg>
            <span className="text-[12px]">Add image</span>
          </span>
        )}
      </button>

      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void accept(file);
        }}
      />
      {problem && <p className="mt-1.5 text-[12px] text-brand">{problem}</p>}
      {error && !problem && <p className="mt-1.5 text-[12px] text-brand">{error}</p>}
    </div>
  );
}

/* ------------------------------- subtitles ------------------------------ */

/** Subtitle tracks — a language, a label and the file itself. */
export function SubtitleList({
  tracks,
  onChange,
  languages,
}: {
  tracks: SubtitleTrack[];
  onChange: (t: SubtitleTrack[]) => void;
  languages: { value: string; label: string }[];
}) {
  const input = useRef<HTMLInputElement>(null);

  return (
    <div>
      <p className="text-[12.5px] font-medium text-white/70">Subtitle files</p>
      <p className="mt-1 text-[12px] text-white/35">SRT or VTT. One per language.</p>

      {tracks.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {tracks.map((t) => (
            <li key={t.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5">
              <span className="w-36 shrink-0">
                <Select
                  ariaLabel={`Language for ${t.fileName}`}
                  value={t.language}
                  onChange={(language) =>
                    onChange(tracks.map((x) => (x.id === t.id ? { ...x, language } : x)))
                  }
                  options={languages}
                />
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] text-white/70">{t.fileName}</span>
              <span className="shrink-0 font-mono text-[11px] text-white/35">{formatBytes(t.sizeBytes)}</span>
              <button
                type="button"
                onClick={() => onChange(tracks.filter((x) => x.id !== t.id))}
                className="shrink-0 text-[12px] font-semibold text-white/45 transition hover:text-white"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => input.current?.click()}
        className="mt-3 inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/[0.04] px-4 py-2 text-[13px] font-semibold text-white/85 transition hover:border-white/35"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add subtitle file
      </button>

      <input
        ref={input}
        type="file"
        accept=".srt,.vtt"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          onChange([
            ...tracks,
            {
              id: makeId("sub"),
              language: languages[0]?.value ?? "en",
              label: languages[0]?.label ?? "English",
              fileName: file.name,
              sizeBytes: file.size,
            },
          ]);
        }}
      />
    </div>
  );
}
