/* ---------------------------------------------------------------------------
 * Transport.
 *
 * Same arrangement as the WeShort admin: everything goes through `request()`,
 * and while NEXT_PUBLIC_API_BASE_URL is empty the call is answered by the local
 * mock (./mock.ts) speaking the same REST paths. Pointing this at the real
 * backend is one env var — no screen changes.
 * ------------------------------------------------------------------------ */

import { handleMock } from "./mock";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
export const USING_MOCK = API_BASE.length === 0;

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  if (USING_MOCK) return handleMock<T>(method, path, body);

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = (await res.json()) as { message?: string; detail?: string };
      message = data.message ?? data.detail ?? message;
    } catch {
      /* body was not json — keep the status text */
    }
    throw new ApiError(message, res.status);
  }

  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export const http = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
};
