const CACHE_NAME = 'psycho-vocab-v6';
const STATIC_ASSETS = [
  './',
  './index.html',
  './game.html',
  './leaderboard.html',
  './login.html',
  './css/variables.css',
  './css/reset.css',
  './css/base.css',
  './css/components.css',
  './css/game.css',
  './css/leaderboard.css',
  './css/admin.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Do not cache API requests to Supabase
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  // Stale-while-revalidate for static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for offline if not in cache
      });

      return cachedResponse || fetchPromise;
    })
  );
});
