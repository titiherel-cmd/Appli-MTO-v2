const CACHE_NAME = 'meteo-v1';
const ASSETS = [
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Pour les APIs météo et cartes, toujours aller chercher en ligne
  const url = event.request.url;
  if (url.includes('api.open-meteo.com') || url.includes('windy.com') || url.includes('nominatim') || url.includes('geocoding-api')) {
    event.respondWith(fetch(event.request).catch(() => new Response('{}', { headers: { 'Content-Type': 'application/json' } })));
    return;
  }
  // Pour le reste (app shell), utiliser le cache
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
