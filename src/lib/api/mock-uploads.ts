/* ---------------------------------------------------------------------------
 * Stand-in video pipeline.
 *
 * The admin runs a real one: bytes stream to storage, a processing pass checks
 * what landed, and only then is the asset READY. There is no such endpoint for
 * the public site yet, so this module stands in — and it stands in honestly:
 *
 *   - the file is genuinely read, chunk by chunk, so the percentage, the byte
 *     counter and the speed are all measured rather than ticked forward;
 *   - processing runs the same checks the admin's server runs (did every byte
 *     arrive, is the container one we accept), so a failure here is a real one.
 *
 * The one invented number is the pace: there is no network to be the slow part,
 * so the read is throttled to SIMULATED_BPS. That constant, and this whole file,
 * disappear the day the real /uploads endpoints exist — lib/api/uploads.ts
 * already speaks to them and simply stops routing through here.
 * ------------------------------------------------------------------------ */

import type { UploadAsset, UploadConfig, UploadMedia } from "@/types/upload";
import { extensionOf, formatBytes } from "@/lib/upload-meta";

/** Mirrors the admin's defaults in src/server/uploads/store.ts. */
const CONFIG: UploadConfig = {
  // the stand-in reads the file itself; nothing travels anywhere
  transport: "stream",
  maxSizeBytes: 10 * 1024 ** 3,
  allowedExtensions: ["mp4", "mov", "mkv", "webm", "m4v"],
  allowedMimeTypes: ["video/mp4", "video/quicktime", "video/x-matroska", "video/webm"],
  maxParallelUploads: 3,
};

/** The only made-up figure here: how fast the stand-in pretends the wire is. */
const SIMULATED_BPS = 8 * 1024 * 1024;
const CHUNK_BYTES = 256 * 1024;
const PROCESSING_MS = 2400;

/** A file named like this fails processing on purpose, to exercise the path. */
const FAIL_MARKER = "fail-processing";

/* --------------------------------- store -------------------------------- */

const assets = new Map<string, UploadAsset>();
/** The File stays in the tab so the preview and a retry have something to use. */
const files = new Map<string, File>();
const previews = new Map<string, string>();

const nowIso = () => new Date().toISOString();
const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const makeId = () =>
  `vid_${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;

function patch(id: string, values: Partial<UploadAsset>): UploadAsset | undefined {
  const asset = assets.get(id);
  if (!asset) return undefined;
  const next = { ...asset, ...values };
  assets.set(id, next);
  return next;
}

export function mockConfig(): UploadConfig {
  return CONFIG;
}

export function mockGet(id: string): UploadAsset {
  const asset = assets.get(id);
  if (!asset) throw new Error("Video not found");
  return asset;
}

/** The preview source: the local file, since nothing was really sent anywhere. */
export function mockPreviewUrl(id: string): string {
  const cached = previews.get(id);
  if (cached) return cached;
  const file = files.get(id);
  if (!file) return "";
  const url = URL.createObjectURL(file);
  previews.set(id, url);
  return url;
}

/* -------------------------------- create -------------------------------- */

/** Same rules, same wording, as the admin's POST /uploads. */
export function mockCreate(input: {
  fileName: string;
  sizeBytes: number;
  contentType: string;
  media: UploadMedia;
}): UploadAsset {
  const fileName = input.fileName.trim();
  if (!fileName) throw new Error("A file name is required");

  const ext = extensionOf(fileName);
  if (!CONFIG.allowedExtensions.includes(ext)) {
    throw new Error(
      `Unsupported video format ".${ext}". Supported: ${CONFIG.allowedExtensions.join(", ")}.`,
    );
  }
  if (input.sizeBytes <= 0) throw new Error("The file is empty");
  if (input.sizeBytes > CONFIG.maxSizeBytes) {
    throw new Error(
      `The file is larger than the ${formatBytes(CONFIG.maxSizeBytes)} limit`,
    );
  }

  const asset: UploadAsset = {
    id: makeId(),
    fileName,
    internalName: fileName.replace(/\.[^.]+$/, ""),
    displayName: "",
    description: "",
    contentType: input.contentType,
    sizeBytes: input.sizeBytes,
    receivedBytes: 0,
    status: "waiting",
    failedStage: "",
    error: "",
    media: input.media,
    hasThumbnail: false,
    checksum: "",
    duplicateOf: null,
    createdAt: nowIso(),
    uploadedAt: "",
    readyAt: "",
  };

  assets.set(asset.id, asset);
  return asset;
}

/* --------------------------------- bytes -------------------------------- */

export interface MockProgress {
  loaded: number;
  total: number;
  percent: number;
  speedBps: number;
  etaSec: number | null;
}

/**
 * Reads the file through, reporting as it goes. Aborting rejects with the same
 * AbortError an aborted XHR produces, so the caller handles one shape either way.
 */
export function mockSend(
  id: string,
  file: File,
  onProgress: (progress: MockProgress) => void,
): { promise: Promise<UploadAsset>; abort: () => void } {
  let aborted = false;

  const promise = (async () => {
    if (!assets.has(id)) throw new Error("Video not found");

    files.set(id, file);
    patch(id, { status: "uploading", receivedBytes: 0, error: "", failedStage: "" });

    let loaded = 0;
    let lastAt = Date.now();
    let lastLoaded = 0;
    let speedBps = 0;

    while (loaded < file.size) {
      if (aborted) {
        files.delete(id);
        throw new DOMException("Upload cancelled", "AbortError");
      }

      const end = Math.min(loaded + CHUNK_BYTES, file.size);
      // a real read of real bytes — this is what the counter is counting
      const chunk = await file.slice(loaded, end).arrayBuffer();
      loaded += chunk.byteLength;

      // and the pacing, which is the part that goes away with the real endpoint
      await wait((chunk.byteLength / SIMULATED_BPS) * 1000);

      const now = Date.now();
      const elapsed = (now - lastAt) / 1000;
      if (elapsed >= 0.25) {
        speedBps = (loaded - lastLoaded) / elapsed;
        lastAt = now;
        lastLoaded = loaded;
      }

      const remaining = file.size - loaded;
      onProgress({
        loaded,
        total: file.size,
        percent: file.size ? Math.floor((loaded / file.size) * 100) : 0,
        speedBps: Math.max(0, speedBps),
        etaSec: speedBps > 0 ? Math.round(remaining / speedBps) : null,
      });
    }

    const uploaded = patch(id, {
      status: "uploaded",
      receivedBytes: loaded,
      uploadedAt: nowIso(),
    });

    // Processing runs on its own, exactly as it does server-side; the field
    // polls for the result rather than being handed it here.
    void runProcessing(id);
    return uploaded as UploadAsset;
  })();

  return {
    promise,
    abort: () => {
      aborted = true;
    },
  };
}

/* ------------------------------ processing ------------------------------ */

function fail(id: string, error: string) {
  patch(id, { status: "failed", failedStage: "processing", error });
}

/** The admin's checks, run against what this tab actually read. */
async function runProcessing(id: string): Promise<void> {
  const asset = assets.get(id);
  if (!asset) return;

  patch(id, { status: "processing", failedStage: "", error: "" });

  if (asset.receivedBytes === 0) {
    fail(id, "No file was stored for this upload. Upload the video again.");
    return;
  }
  if (asset.sizeBytes > 0 && asset.receivedBytes !== asset.sizeBytes) {
    fail(
      id,
      `Upload incomplete — ${mb(asset.receivedBytes)} of ${mb(asset.sizeBytes)} arrived. Retry the upload.`,
    );
    return;
  }

  const ext = extensionOf(asset.fileName);
  if (!CONFIG.allowedExtensions.includes(ext)) {
    fail(id, `Unsupported container ".${ext}". Supported: ${CONFIG.allowedExtensions.join(", ")}.`);
    return;
  }
  if (asset.fileName.toLowerCase().includes(FAIL_MARKER)) {
    fail(id, "Invalid video codec — the pipeline could not decode the video track.");
    return;
  }

  await wait(PROCESSING_MS);

  // A cancel or a replace during processing wins.
  const current = assets.get(id);
  if (!current || current.status !== "processing") return;

  patch(id, { status: "ready", readyAt: nowIso(), failedStage: "", error: "" });
}

/* -------------------------------- actions ------------------------------- */

export function mockCancel(id: string): UploadAsset {
  const asset = assets.get(id);
  if (!asset) throw new Error("Video not found");

  const preview = previews.get(id);
  if (preview) URL.revokeObjectURL(preview);
  previews.delete(id);
  files.delete(id);

  return patch(id, {
    status: "cancelled",
    receivedBytes: 0,
    failedStage: "",
    error: "",
  }) as UploadAsset;
}

/** Reruns the processing pass on bytes that are already here. */
export function mockRetryProcessing(id: string): UploadAsset {
  const asset = assets.get(id);
  if (!asset) throw new Error("Video not found");
  if (!files.has(id)) {
    throw new Error("There is no stored file to process. Upload the video again.");
  }

  patch(id, { status: "uploaded", failedStage: "", error: "" });
  void runProcessing(id);
  return assets.get(id) as UploadAsset;
}
