// Service worker: guarda la app en el móvil para que funcione sin conexión.
// Cuando cambies archivos, sube el número de versión para que se actualice.
const VERSION = 'preflop-v7';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;           // fuentes de Google: que decida el navegador
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(hit => {
      const net = fetch(e.request).then(r => { if (r && r.ok) caches.open(VERSION).then(c => c.put(e.request, r.clone())); return r; }).catch(() => hit);
      return hit || net;                                  // primero lo guardado; si no, red
    })
  );
});
