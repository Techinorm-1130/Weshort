/* The endpoints the submission flow uses. One function per backend route, named
 * and shaped exactly as in the WeShort admin so both apps stay in step. */

import type { ContentItem, Paginated, Taxonomies } from "@/types/upload";
import { http } from "./http";

export const taxonomyApi = {
  all: () => http.get<Taxonomies>("/taxonomies"),
};

export const submissionApi = {
  /** Creates the draft. Called once, on the first save. */
  create: (payload: Partial<ContentItem>) => http.post<ContentItem>("/contents", payload),
  update: (id: string, payload: Partial<ContentItem>) =>
    http.patch<ContentItem>(`/contents/${id}`, payload),
  /** Hands the finished draft to an admin — this is what puts it in review. */
  submit: (id: string) => http.post<ContentItem>(`/contents/${id}/submit`),
  /**
   * Everything this member has sent us. The same `uploadedBy` the wizard stamps
   * is the filter, so the profile page and the admin's library agree on whose
   * submission is whose.
   */
  mine: (uploaderId: string) =>
    http.get<Paginated<ContentItem>>(
      `/contents?uploadedBy=${encodeURIComponent(uploaderId)}&perPage=50&sort=-createdAt`,
    ),
};
