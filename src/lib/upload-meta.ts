/* ---------------------------------------------------------------------------
 * Labels, formatting and the fast client-side check for the upload field.
 *
 * Mirrors the admin's src/lib/upload/uploadMeta.ts so both apps describe the
 * same upload in the same words.
 * ------------------------------------------------------------------------ */

import type { UploadConfig, UploadStatus } from "@/types/upload";

export const UPLOAD_STATUS_LABELS: Record<UploadStatus, string> = {
  waiting: "Waiting",
  uploading: "Uploading",
  uploaded: "Uploaded",
  processing: "Processing",
  ready: "Ready",
  failed: "Failed",
  cancelled: "Cancelled",
};

export const uploadStatusLabel = (status: UploadStatus) => UPLOAD_STATUS_LABELS[status];

/** Still moving — the field keeps polling while the asset is in one of these. */
export const IN_FLIGHT: UploadStatus[] = ["waiting", "uploading", "uploaded", "processing"];

export const extensionOf = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";

/* ------------------------------ formatting ------------------------------ */

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}

/** "12.4 MB/s" from a raw byte rate. */
export function formatSpeed(bytesPerSecond: number): string {
  if (!bytesPerSecond || !Number.isFinite(bytesPerSecond)) return "";
  const units = ["B/s", "KB/s", "MB/s", "GB/s"];
  let value = bytesPerSecond;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

/** "3 min left" — only ever shown when the number has actually been measured. */
export function formatEta(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds) || seconds < 0) return "";
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))}s left`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min left`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m left`;
}

/** "1:42:05" / "18:24". */
export function formatDuration(totalSeconds: number): string {
  if (!totalSeconds) return "";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/* ------------------------------ validation ------------------------------ */

/**
 * The quick check, so a wrong file is refused before a byte moves. The API runs
 * the same rules again — this one only saves the waiting time.
 */
export function fileProblem(file: File, config: UploadConfig | null): string | null {
  const ext = extensionOf(file.name);

  if (config && !config.allowedExtensions.includes(ext)) {
    return `Not a supported video format (.${ext}). Send ${config.allowedExtensions
      .map((e) => e.toUpperCase())
      .join(", ")}.`;
  }
  if (file.size === 0) return "That file is empty.";
  if (config && file.size > config.maxSizeBytes) {
    return `Larger than the ${formatBytes(config.maxSizeBytes)} limit.`;
  }
  return null;
}

/**
 * "MP4, MOV, MKV, WEBM, M4V up to 4 MB" — straight from the server's limits.
 *
 * Formatted by size rather than always in gigabytes: the ceiling is not always
 * a large round number, and rounding 4 MB to whole GB announced "up to 0 GB".
 */
export function formatLimits(config: UploadConfig | null): string {
  if (!config) return "Checking upload limits…";
  const formats = config.allowedExtensions.map((e) => e.toUpperCase()).join(", ");
  return `${formats} up to ${formatBytes(config.maxSizeBytes)}`;
}
