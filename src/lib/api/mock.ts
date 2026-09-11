/* ---------------------------------------------------------------------------
 * Stand-in backend.
 *
 * Answers the same paths the real API will: GET /taxonomies, POST /contents,
 * PATCH /contents/:id, POST /contents/:id/submit. Submissions are kept in
 * localStorage so a draft survives a reload and you can see what was sent —
 * nothing here is meant to outlive the real backend.
 * ------------------------------------------------------------------------ */

import type { ContentItem, Taxonomies } from "@/types/upload";

const KEY = "ws-submissions";

/** Matches the admin's /taxonomies payload; the backend will replace it. */
const TAXONOMIES: Taxonomies = {
  categories: [
    { value: "short-film", label: "Short film" },
    { value: "feature", label: "Feature" },
    { value: "series", label: "Series" },
    { value: "documentary", label: "Documentary" },
    { value: "animation", label: "Animation" },
  ],
  classifications: [
    { value: "G", label: "G — all ages" },
    { value: "PG", label: "PG — parental guidance" },
    { value: "12", label: "12 — twelve and over" },
    { value: "14", label: "14 — fourteen and over" },
    { value: "16", label: "16 — sixteen and over" },
    { value: "18", label: "18 — adults only" },
  ],
  genres: [
    { value: "action", label: "Action" },
    { value: "adventure", label: "Adventure" },
    { value: "animation", label: "Animation" },
    { value: "comedy", label: "Comedy" },
    { value: "crime", label: "Crime" },
    { value: "documentary", label: "Documentary" },
    { value: "drama", label: "Drama" },
    { value: "experimental", label: "Experimental" },
    { value: "family", label: "Family" },
    { value: "fantasy", label: "Fantasy" },
    { value: "horror", label: "Horror" },
    { value: "musical", label: "Musical" },
    { value: "romance", label: "Romance" },
    { value: "scifi", label: "Science fiction" },
    { value: "thriller", label: "Thriller" },
  ],
  languages: [
    { value: "en", label: "English" },
    { value: "it", label: "Italian" },
    { value: "fr", label: "French" },
    { value: "es", label: "Spanish" },
    { value: "de", label: "German" },
    { value: "pt", label: "Portuguese" },
    { value: "hi", label: "Hindi" },
    { value: "ta", label: "Tamil" },
    { value: "ar", label: "Arabic" },
    { value: "ja", label: "Japanese" },
  ],
  countries: [
    { value: "it", label: "Italy" },
    { value: "gb", label: "United Kingdom" },
    { value: "us", label: "United States" },
    { value: "fr", label: "France" },
    { value: "es", label: "Spain" },
    { value: "de", label: "Germany" },
    { value: "in", label: "India" },
    { value: "br", label: "Brazil" },
    { value: "jp", label: "Japan" },
  ],
};

function read(): ContentItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as ContentItem[];
  } catch {
    return [];
  }
}

function write(rows: ContentItem[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(rows));
  } catch {
    /* storage blocked — the submission still completes for this session */
  }
}

const nowIso = () => new Date().toISOString();
const makeId = (p: string) => `${p}_${Math.random().toString(36).slice(2, 9)}`;

/** A beat of latency, so loading and pending states are real rather than theoretical. */
const delay = (ms = 420) => new Promise((r) => setTimeout(r, ms));

export async function handleMock<T>(method: string, path: string, body?: unknown): Promise<T> {
  await delay();

  const [rawPath, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  const [resource, id, action] = rawPath.split("/").filter(Boolean);

  if (resource === "taxonomies" && method === "GET") return TAXONOMIES as T;

  if (resource === "contents") {
    const rows = read();

    // the profile page asking for one member's submissions
    if (method === "GET" && !id) {
      const uploadedBy = params.get("uploadedBy");
      const items = uploadedBy && uploadedBy !== "all"
        ? rows.filter((r) => r.uploadedBy?.id === uploadedBy)
        : rows;
      return { items, total: items.length, page: 1, perPage: items.length } as T;
    }

    if (method === "POST" && !id) {
      const created: ContentItem = {
        ...(body as ContentItem),
        id: makeId("cnt"),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      write([created, ...rows]);
      return created as T;
    }

    const index = rows.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Submission not found");

    // reopening a draft to carry on with it
    if (method === "GET") return rows[index] as T;

    if (method === "PATCH") {
      const updated = { ...rows[index], ...(body as Partial<ContentItem>), updatedAt: nowIso() };
      rows[index] = updated;
      write(rows);
      return updated as T;
    }

    // handing the title to the admin for review is what "upload" means here
    if (method === "POST" && action === "submit") {
      const updated: ContentItem = {
        ...rows[index],
        approval: {
          state: "pending",
          submittedAt: nowIso(),
          reviewedAt: "",
          reviewedBy: null,
          note: "",
        },
        status: "draft",
        updatedAt: nowIso(),
      };
      rows[index] = updated;
      write(rows);
      return updated as T;
    }
  }

  throw new Error(`No mock route for ${method} ${path}`);
}
