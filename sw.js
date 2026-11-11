// Mis rutas y trails: funciona sin conexión y se actualiza sola
const CACHE = 'mis-rutas-v3';
const BASE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'eventos.json'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  // tipografías: de la caché si ya están
  if(url.host.includes('fonts.g')){
    e.respondWith(caches.open(CACHE).then(c => c.match(req).then(r => r || fetch(req).then(res => { c.put(req, res.clone()); return res; }))));
    return;
  }
  if(url.origin !== location.origin) return;
  // la app y los eventos: primero internet (siempre lo último); sin conexión, la copia guardada
  const key = url.pathname.endsWith('eventos.json') ? new Request(url.origin + url.pathname) : req;
  // pedir siempre la versión más reciente al servidor (sin usar la caché del navegador)
  e.respondWith(fetch(req, {cache: 'no-cache'}).then(res => {
    if(res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)); }
    return res;
  }).catch(() => caches.match(key, {ignoreSearch: true}).then(r => r || caches.match('index.html'))));
});
