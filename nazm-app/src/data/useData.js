import { useEffect, useState, useMemo, useCallback } from 'react';
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

const TASKS_KEY = 'nazm.tasks.v1';

// Tasks are seeded once from `tasks.json`, then persisted to localStorage so
// add/toggle/remove survive reloads without a backend.
export function useTasks() {
  const [tasks, setTasks] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(TASKS_KEY) : null;
    if (stored) {
      try { setTasks(JSON.parse(stored)); setLoading(false); return; } catch {}
    }
    fetchData('tasks')
      .then((seed) => { setTasks(seed); localStorage.setItem(TASKS_KEY, JSON.stringify(seed)); })
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback((next) => {
    setTasks(next);
    try { localStorage.setItem(TASKS_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const add = useCallback((task) => {
    const id = `TSK-${Date.now().toString(36).toUpperCase()}`;
    persist([{ id, done: false, source: 'manual', priority: 'medium', ...task }, ...(tasks || [])]);
  }, [tasks, persist]);

  const toggle = useCallback((id) => {
    persist((tasks || []).map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, [tasks, persist]);

  const remove = useCallback((id) => {
    persist((tasks || []).filter((t) => t.id !== id));
  }, [tasks, persist]);

  return { tasks: tasks || [], loading, add, toggle, remove };
}
