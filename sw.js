// Sendalia se ha mudado a https://sendalia.es: este service worker se elimina solo.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) await caches.delete(k);
    await self.registration.unregister();
    for (const c of await self.clients.matchAll({type: 'window'})) {
      try { const u = new URL(c.url); c.navigate('https://sendalia.es/' + u.search + u.hash); } catch (err) {}
    }
  })());
});
