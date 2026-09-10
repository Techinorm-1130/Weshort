/* Validates the whole submission at once; the wizard shows only the messages
 * belonging to the step being edited, and everything on the review step.
 *
 * Mirrors the admin's content-validation.ts, so a submission that passes here
 * passes there too — a title rejected on a technicality after upload is the
 * worst possible outcome for someone who has just waited for a file to send. */

import type { ContentItem } from "@/types/upload";

export type Errors = Partial<Record<string, string>>;

/** Which step each field belongs to, so the stepper can flag the right one. */
export const FIELD_STEP: Record<string, number> = {
  type: 0, title: 0, description: 0, releaseDate: 0, language: 0,
  genres: 0, ageRating: 0, country: 0,
  poster: 1, video: 1, trailer: 1,
  audioLanguages: 2,
  submitterName: 3, submitterEmail: 3, rights: 3,
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validate(draft: ContentItem, agreed: boolean): Errors {
  const e: Errors = {};

  if (!draft.title.trim()) e.title = "Title is required";
  if (!draft.description.trim()) e.description = "A description is required";
  if (!draft.releaseDate) e.releaseDate = "Release date is required";
  if (!draft.language) e.language = "Original language is required";
  if (!draft.country) e.country = "Country of production is required";
  if (draft.genres.length === 0) e.genres = "Pick at least one genre";
  if (!draft.ageRating) e.ageRating = "Age rating is required";

  if (!draft.poster) e.poster = "A poster is required";

  // The upload has to have come out the far end of the pipeline. Which step it
  // failed at decides what we ask for, the same way the admin's wizard does.
  if (!draft.video) {
    e.video = "The film itself is required";
  } else if (draft.video.state === "failed") {
    e.video =
      draft.video.failedStage === "processing"
        ? "The film could not be processed — retry it, or send a different file"
        : "The film did not finish uploading — retry it";
  } else if (draft.video.state !== "ready") {
    e.video = "Wait for the film to finish uploading and processing";
  }

  // A trailer is optional, but a half-finished one still cannot be sent.
  if (draft.trailer && draft.trailer.state === "failed") {
    e.trailer = "The trailer upload failed — retry it, or remove it";
  } else if (draft.trailer && draft.trailer.state !== "ready") {
    e.trailer = "Wait for the trailer to finish, or remove it";
  }

  if (draft.audioLanguages.length === 0) e.audioLanguages = "Select at least one audio language";

  if (!draft.submitter.name.trim()) e.submitterName = "Your name is required";
  if (!EMAIL.test(draft.submitter.email)) e.submitterEmail = "A valid email is required";
  if (!agreed) e.rights = "Confirm you hold the rights before submitting";

  return e;
}

/** The subset of messages that belong to one step. */
export function errorsForStep(errors: Errors, step: number): Errors {
  return Object.fromEntries(
    Object.entries(errors).filter(([field]) => FIELD_STEP[field] === step),
  );
}
