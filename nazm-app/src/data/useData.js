import { useEffect, useState, useMemo } from 'react';
import { fetchData } from './api.js';
import { FIELD_STATS } from '../config.js';

// Core hook: `{ data, loading, error }` for a named JSON feed.
// `fallback` preserves prototype usability when the file is missing or
// the device is offline before the service worker has cached it.
export function useFeed(name, fallback = null) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    fetchData(name, { signal: ctrl.signal })
      .then((d) => { setData(d); setError(null); })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message);
        if (fallback != null) setData(fallback);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [name]);

  return { data, loading, error };
}

export function useFieldStats() {
  return useFeed('stats', FIELD_STATS);
}

export function useClaims({ page = 1, pageSize = 10 } = {}) {
  const { data, loading, error } = useFeed('claims', []);
  const list = data || [];
  const total = list.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const slice = useMemo(
    () => list.slice((page - 1) * pageSize, page * pageSize),
    [list, page, pageSize],
  );
  return { data: slice, total, pageCount, loading, error };
}

export function useOffices() {
  return useFeed('offices', []);
}

export function useStaff() {
  return useFeed('staff', []);
}
