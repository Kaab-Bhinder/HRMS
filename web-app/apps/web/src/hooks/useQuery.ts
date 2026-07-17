import { useCallback, useEffect, useRef, useState } from 'react';

interface QueryState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | undefined;
  refetch: () => void;
}

/**
 * Minimal data-fetching hook. Same surface as TanStack Query's essentials
 * (data/loading/error/refetch) so it can be replaced 1:1 later.
 */
export function useQuery<T>(fn: () => Promise<T>, deps: unknown[] = []): QueryState<T> {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(undefined);
    fnRef.current()
      .then((res) => alive && setData(res))
      .catch((e) => alive && setError(e?.message ?? 'Something went wrong'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, refetch };
}
