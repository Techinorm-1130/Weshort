"use client";

/* Two small data primitives, dependency-free so they can be swapped for React
 * Query later without touching the API layer or any screen. */

import { useCallback, useEffect, useRef, useState } from "react";

/** Runs `fetcher` on mount. */
export function useQuery<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef(fetcher);

  useEffect(() => {
    ref.current = fetcher;
  });

  useEffect(() => {
    let cancelled = false;
    ref
      .current()
      .then((d) => !cancelled && setData(d))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error, loading: !data && !error };
}

/** Wraps a write so a screen can show pending and error states. */
export function useMutation<A extends unknown[], T>(fn: (...args: A) => Promise<T>) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (...args: A): Promise<T | null> => {
      setPending(true);
      setError(null);
      try {
        return await fn(...args);
      } catch (e) {
        setError((e as Error).message);
        return null;
      } finally {
        setPending(false);
      }
    },
    // the caller passes a stable closure; re-creating on every render is fine
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return { run, pending, error };
}
