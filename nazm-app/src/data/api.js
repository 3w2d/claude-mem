// Data fetch layer. Resolves JSON files shipped alongside the app under
// `public/data/*.json`. On GitHub Pages this becomes `/claude-mem/app/data/*.json`;
// in dev it's `/data/*.json`. Results are cached in-memory per URL so
// React re-renders don't refetch on every mount.

const cache = new Map();

function url(name) {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}data/${name}.json`;
}

export async function fetchData(name, { signal } = {}) {
  if (cache.has(name)) return cache.get(name);
  const res = await fetch(url(name), { signal, cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to load ${name}: HTTP ${res.status}`);
  const data = await res.json();
  cache.set(name, data);
  return data;
}

export function invalidate(name) {
  if (name) cache.delete(name);
  else cache.clear();
}
