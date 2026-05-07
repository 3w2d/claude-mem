// Service worker for رَكيزة — offline-first, network-first for HTML
const CACHE = 'rakiza-v3';
const ASSETS = [
  './',
  './index.html',
  './editor.html',
  './manifest.webmanifest',
  './icon-192.svg',
  './icon-512.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // let CDN/Anthropic pass through
  if (req.method !== 'GET') return;

  // HTML: network-first, fall back to cache
  if (req.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(req).then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(req, clone));
        return r;
      }).catch(() => caches.match(req).then(r => r || caches.match('./editor.html')))
    );
    return;
  }
  // Other assets: cache-first
  e.respondWith(
    caches.match(req).then(r => r || fetch(req).then(resp => {
      const clone = resp.clone();
      caches.open(CACHE).then(c => c.put(req, clone));
      return resp;
    }))
  );
});
