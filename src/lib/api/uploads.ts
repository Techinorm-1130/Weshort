/* ---------------------------------------------------------------------------
 * The browser half of a video upload.
 *
 * Mirrors the admin's src/lib/upload/client.ts, endpoint for endpoint, so the
 * public submission and the admin's own wizard drive the same pipeline:
 *
 *   POST /uploads              register the asset before any bytes move
 *   PUT  /uploads/{id}/file    the bytes, with progress reported by the request
 *   GET  /uploads/{id}         poll while the server processes it
 *   POST /uploads/{id}/cancel  stop, and clear the partial file
 *   POST /uploads/{id}/retry   rerun processing on bytes already stored
 *
 * While NEXT_PUBLIC_API_BASE_URL is empty the calls are answered by the local
 * stand-in (./mock-uploads.ts). Pointing at the real backend is one env var, and
 * no screen changes.
 * ------------------------------------------------------------------------ */

import { upload as blobUpload } from "@vercel/blob/client";
import type { UploadAsset, UploadConfig, UploadMedia } from "@/types/upload";
import { API_BASE, USING_MOCK } from "./http";
import {
  mockCancel, mockConfig, mockCreate, mockGet, mockPreviewUrl, mockRetryProcessing, mockSend,
} from "./mock-uploads";

const BASE = `${API_BASE}/uploads`;

async function json<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { cache: "no-store", ...init });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export interface CreateAssetInput {
  fileName: string;
  sizeBytes: number;
  contentType: string;
  media: UploadMedia;
}

export const uploadApi = {
  /** Limits and accepted formats, so nothing on screen hardcodes them. */
  config: async (): Promise<UploadConfig> =>
    USING_MOCK ? mockConfig() : json<UploadConfig>(`${BASE}/config`),

  /** Tells the API where the bytes landed once they went straight to storage. */
  attach: async (id: string, url: string, sizeBytes: number): Promise<UploadAsset> =>
    json<UploadAsset>(`${BASE}/${id}/attach`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, sizeBytes }),
    }),

  create: async (input: CreateAssetInput): Promise<UploadAsset> =>
    USING_MOCK
      ? mockCreate(input)
      : json<UploadAsset>(BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }),

  get: async (id: string): Promise<UploadAsset> =>
    USING_MOCK ? mockGet(id) : json<UploadAsset>(`${BASE}/${id}`),

  cancel: async (id: string): Promise<UploadAsset> =>
    USING_MOCK ? mockCancel(id) : json<UploadAsset>(`${BASE}/${id}/cancel`, { method: "POST" }),

  retryProcessing: async (id: string): Promise<UploadAsset> =>
    USING_MOCK
      ? mockRetryProcessing(id)
      : json<UploadAsset>(`${BASE}/${id}/retry`, { method: "POST" }),

  /** What the preview player plays. */
  streamUrl: (id: string): string => (USING_MOCK ? mockPreviewUrl(id) : `${BASE}/${id}/stream`),

  /**
   * Artwork — poster, thumbnail, banner.
   *
   * The URL this returns is what goes on the record. It has to be a real one:
   * `URL.createObjectURL` only resolves inside the tab that made it, so a poster
   * stored that way showed as a broken image in the admin and again here after
   * a reload. Standing alone with no backend there is nothing better to offer,
   * so the object URL remains the fallback.
   */
  uploadImage: async (file: File): Promise<string> => {
    if (USING_MOCK) return URL.createObjectURL(file);

    const res = await fetch(`${API_BASE}/images`, {
      method: "POST",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "X-File-Name": file.name,
      },
      body: file,
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { message?: string } | null;
      throw new Error(body?.message ?? `Could not upload the image (${res.status})`);
    }
    return ((await res.json()) as { url: string }).url;
  },
};

/* ------------------------------ the transfer ---------------------------- */

export interface TransferProgress {
  loaded: number;
  total: number;
  percent: number;
  /** Bytes per second over the last sample, 0 until there are two samples. */
  speedBps: number;
  /** Seconds left at the current speed, null while it cannot be measured. */
  etaSec: number | null;
}

export interface Transfer {
  promise: Promise<UploadAsset>;
  abort: () => void;
}

/**
 * Sends the file. Against the real API this is XMLHttpRequest — the only
 * transport that reports upload progress in every browser we target — so every
 * number the field shows comes from bytes the browser has actually handed to
 * the network.
 */
/**
 * Sends the file straight to object storage, then tells the API where it went.
 *
 * This exists because a serverless request body is capped at a few megabytes —
 * far below a film — and the rejection happens before any of our code runs. The
 * bytes never touch the API; only the short token exchange and the small note
 * at the end do.
 */
function sendViaBlob(
  assetId: string,
  file: File,
  onProgress: (progress: TransferProgress) => void,
): Transfer {
  const controller = new AbortController();
  let lastAt = Date.now();
  let lastLoaded = 0;
  let speedBps = 0;

  const promise = (async () => {
    const result = await blobUpload(file.name, file, {
      access: "public",
      handleUploadUrl: `${BASE}/blob`,
      contentType: file.type || "application/octet-stream",
      // large files go up in parts, retried individually
      multipart: true,
      abortSignal: controller.signal,
      onUploadProgress: ({ loaded, total, percentage }) => {
        const now = Date.now();
        const elapsed = (now - lastAt) / 1000;
        if (elapsed >= 0.25) {
          speedBps = (loaded - lastLoaded) / elapsed;
          lastAt = now;
          lastLoaded = loaded;
        }
        const remaining = total - loaded;
        onProgress({
          loaded,
          total,
          percent: Math.floor(percentage),
          speedBps: Math.max(0, speedBps),
          etaSec: speedBps > 0 ? Math.round(remaining / speedBps) : null,
        });
      },
    });

    return uploadApi.attach(assetId, result.url, file.size);
  })();

  return { promise, abort: () => controller.abort() };
}

export function sendFile(
  assetId: string,
  file: File,
  onProgress: (progress: TransferProgress) => void,
  config?: UploadConfig | null,
): Transfer {
  if (USING_MOCK) return mockSend(assetId, file, onProgress);
  if (config?.transport === "blob") return sendViaBlob(assetId, file, onProgress);

  const xhr = new XMLHttpRequest();
  let lastAt = Date.now();
  let lastLoaded = 0;
  let speedBps = 0;

  const promise = new Promise<UploadAsset>((resolve, reject) => {
    xhr.open("PUT", `${BASE}/${assetId}/file`, true);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const now = Date.now();
      const elapsed = (now - lastAt) / 1000;
      if (elapsed >= 0.25) {
        speedBps = (event.loaded - lastLoaded) / elapsed;
        lastAt = now;
        lastLoaded = event.loaded;
      }
      const remaining = event.total - event.loaded;
      onProgress({
        loaded: event.loaded,
        total: event.total,
        percent: event.total ? Math.floor((event.loaded / event.total) * 100) : 0,
        speedBps: Math.max(0, speedBps),
        etaSec: speedBps > 0 ? Math.round(remaining / speedBps) : null,
      });
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as UploadAsset);
        } catch {
          reject(new Error("The server returned an unreadable response"));
        }
        return;
      }
      let message = `Upload failed (${xhr.status})`;
      try {
        message = (JSON.parse(xhr.responseText) as { message?: string }).message ?? message;
      } catch {
        /* keep the status message */
      }
      reject(new Error(message));
    };

    xhr.onerror = () => reject(new Error("The connection dropped during the upload"));
    xhr.ontimeout = () => reject(new Error("The upload timed out"));
    xhr.onabort = () => reject(new DOMException("Upload cancelled", "AbortError"));

    xhr.send(file);
  });

  return { promise, abort: () => xhr.abort() };
}

/* -------------------------------- probing ------------------------------- */

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

/** "1920x1080" -> "16:9". */
export function aspectRatioOf(width: number, height: number): string {
  if (!width || !height) return "";
  const divisor = gcd(width, height) || 1;
  return `${Math.round(width / divisor)}:${Math.round(height / divisor)}`;
}

/**
 * Reads what the browser can genuinely tell us about the file before it is
 * sent: duration and pixel size. Codecs and frame rate need a demuxer, so they
 * stay empty and the UI says so rather than inventing a value.
 */
export function probeVideo(file: File): Promise<UploadMedia> {
  const container = (file.name.split(".").pop() ?? "").toUpperCase();
  const empty: UploadMedia = {
    durationSec: 0,
    width: 0,
    height: 0,
    aspectRatio: "",
    container,
    videoCodec: "",
    audioCodec: "",
    frameRate: 0,
  };

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    let settled = false;

    const done = (media: UploadMedia) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      resolve(media);
    };

    video.preload = "metadata";
    video.muted = true;
    video.onloadedmetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      done({
        ...empty,
        durationSec: Number.isFinite(video.duration) ? Math.round(video.duration) : 0,
        width,
        height,
        aspectRatio: aspectRatioOf(width, height),
      });
    };
    // A container the browser cannot open (MKV in Safari, say) is still a valid
    // upload — the server decides. We just have nothing to report about it.
    video.onerror = () => done(empty);
    setTimeout(() => done(empty), 10_000);
    video.src = url;
  });
}
