/* ---------------------------------------------------------------------------
 * Submission types.
 *
 * These mirror `ContentItem` and friends in the WeShort admin (see its
 * src/types/index.ts). The public site fills the same object the admin's own
 * upload wizard fills, and posts it to the same endpoints — so a submission from
 * here lands in the admin's "Waiting for approval" view with nothing to
 * translate in between. Keep the two in step when either changes.
 * ------------------------------------------------------------------------ */

export type ID = string;

export interface Actor {
  id: ID;
  name: string;
  initials: string;
  color: string;
}

/** The list envelope the admin returns for every collection. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
}

export interface Option {
  value: string;
  label: string;
}

/** Everything the form offers as a choice comes from the backend, not from us. */
export interface Taxonomies {
  categories: Option[];
  classifications: Option[];
  genres: Option[];
  languages: Option[];
  countries: Option[];
}

export type ContentType = "movie" | "series" | "documentary";
export type ContentStatus = "draft" | "published" | "scheduled" | "archived";
export type ContentAccess = "free" | "premium";

/* ---------------------------- video uploads ----------------------------- */

/**
 * The real lifecycle of a video asset, exactly as the admin defines it. The
 * server owns this value and the UI only mirrors it — nothing here is ever
 * advanced on the client's own initiative.
 */
export type UploadStatus =
  | "waiting"
  | "uploading"
  | "uploaded"
  | "processing"
  | "ready"
  | "failed"
  | "cancelled";

/** Which step failed, so the field can offer the matching retry. */
export type UploadStage = "upload" | "processing" | "";

/** Read off the file itself. Never editable by hand. */
export interface UploadMedia {
  durationSec: number;
  width: number;
  height: number;
  /** "16:9" — derived from the real pixel dimensions. */
  aspectRatio: string;
  container: string;
  /** Empty when nothing could determine it — shown as "Not detected". */
  videoCodec: string;
  audioCodec: string;
  frameRate: number;
}

/** One stored video, as the uploads API returns it. */
export interface UploadAsset {
  id: ID;
  fileName: string;
  internalName: string;
  displayName: string;
  description: string;
  contentType: string;
  /** What the browser announced. */
  sizeBytes: number;
  /** What actually landed in storage. */
  receivedBytes: number;
  status: UploadStatus;
  failedStage: UploadStage;
  /** Why it failed, in words the person can act on. */
  error: string;
  media: UploadMedia;
  hasThumbnail: boolean;
  checksum: string;
  duplicateOf: ID | null;
  createdAt: string;
  uploadedAt: string;
  readyAt: string;
}

/** Upload limits, owned by the backend so no screen hardcodes them. */
export interface UploadConfig {
  maxSizeBytes: number;
  allowedExtensions: string[];
  allowedMimeTypes: string[];
  maxParallelUploads: number;
}

/** The narrower state a form field shows, matching the admin's `VideoAsset`. */
export type UploadState = "idle" | "uploading" | "processing" | "ready" | "failed";
export type QualityLevel = "360p" | "480p" | "720p" | "1080p" | "4k";

/**
 * Kept because the admin's `VideoAsset` still carries it, so the two objects
 * stay identical on the wire. The pipeline no longer builds a ladder, so this
 * is always empty — resolution is reported instead.
 */
export interface QualityRendition {
  level: QualityLevel;
  state: UploadState;
}

export interface VideoAsset {
  id: ID;
  name: string;
  sizeBytes: number;
  /** 0-100 while uploading. */
  progress: number;
  state: UploadState;
  qualities: QualityRendition[];
  /** Streams from the uploads API once the asset exists. */
  previewUrl?: string | null;
  error?: string;
  /** Which step failed, so the field offers the matching retry. */
  failedStage?: UploadStage;
  /* Detected from the file by the upload pipeline — display only. */
  durationSec?: number;
  width?: number;
  height?: number;
  /* Live transfer figures, measured from the request in flight. */
  loadedBytes?: number;
  speedBps?: number;
  etaSec?: number | null;
}

export interface SubtitleTrack {
  id: ID;
  language: string;
  label: string;
  fileName: string;
  sizeBytes: number;
}

/** Who supplied the title — set by the page the submission came in from. */
export type SubmitterKind = "producer" | "director" | "production-house";

export interface Submitter {
  kind: SubmitterKind;
  name: string;
  company: string;
  email: string;
  phone: string;
}

export type ApprovalState = "draft" | "pending" | "approved" | "rejected";

export interface Approval {
  state: ApprovalState;
  submittedAt: string;
  reviewedAt: string;
  reviewedBy: Actor | null;
  /** The admin's note — the reason shown back on a rejection. */
  note: string;
}

export interface ContentItem {
  id: ID;
  type: ContentType;
  uploadedBy: Actor;
  submitter: Submitter;
  approval: Approval;
  title: string;
  shortDescription: string;
  description: string;
  poster: string | null;
  thumbnail: string | null;
  banner: string | null;
  releaseDate: string;
  durationSec: number;
  language: string;
  genres: string[];
  category: string;
  country: string;
  ageRating: string;
  video: VideoAsset | null;
  trailer: VideoAsset | null;
  audioLanguages: string[];
  subtitles: SubtitleTrack[];
  access: ContentAccess;
  status: ContentStatus;
  publishAt: string;
  expiryAt: string;
  featured: boolean;
  allowDownload: boolean;
  createdAt: string;
  updatedAt: string;
}

/** A blank submission. `kind` comes from whichever upload route was used. */
export function emptySubmission(kind: SubmitterKind): ContentItem {
  return {
    id: "",
    type: "movie",
    // stamped server-side once accounts are real
    uploadedBy: { id: "", name: "", initials: "", color: "#e50914" },
    submitter: { kind, name: "", company: "", email: "", phone: "" },
    approval: { state: "draft", submittedAt: "", reviewedAt: "", reviewedBy: null, note: "" },
    title: "",
    shortDescription: "",
    description: "",
    poster: null,
    thumbnail: null,
    banner: null,
    releaseDate: "",
    durationSec: 0,
    language: "",
    genres: [],
    category: "short-film",
    country: "",
    ageRating: "",
    video: null,
    trailer: null,
    audioLanguages: [],
    subtitles: [],
    access: "premium",
    status: "draft",
    publishAt: "",
    expiryAt: "",
    featured: false,
    allowDownload: false,
    createdAt: "",
    updatedAt: "",
  };
}
