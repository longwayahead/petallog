/* Minimal, framework-agnostic SW for Vite builds */
const APP_CACHE = 'app-shell-v1';
const RUNTIME_CACHE = 'runtime-v1';

// Things we can name up front. Keep it small: the app shell + manifest + icons.
const PRECACHE_URLS = [
  '/',                    // app shell (index.html)
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting(); // activate faster on first install
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => {
      if (k !== APP_CACHE && k !== RUNTIME_CACHE) return caches.delete(k);
    }));
    await self.clients.claim();

    //tell the client to refresh, so that it uses the new version right away
    const clientsList = await self.clients.matchAll({type: 'window', includeUncontrolled: true});
    for (const client of clientsList) {
      client.postMessage({type: 'NEW_VERSION_AVAILABLE'});
    }
  })());
});

// Basic strategy:
// - navigation requests → App Shell (Network first; fallback to cached /index.html)
// - static assets (/assets/* from Vite) → Stale-While-Revalidate
// - images → Cache-first (cap size)
// - everything else → pass through
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET
  if (request.method !== 'GET') return;

  // Navigation (SPA)
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request);
        // Cache the latest index.html behind the scenes
        const cache = await caches.open(APP_CACHE);
        cache.put('/index.html', fresh.clone());
        return fresh;
      } catch {
        const cache = await caches.open(APP_CACHE);
        return (await cache.match('/index.html')) || Response.error();
      }
    })());
    return;
  }

  // Static build assets (Vite puts JS/CSS under /assets/)
  if (url.origin === self.location.origin && url.pathname.startsWith('/assets/')) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  // Images (same-origin)
  if (url.origin === self.location.origin && /\.(png|jpg|jpeg|gif|webp|avif|svg)$/.test(url.pathname)) {
    event.respondWith(cacheFirstWithLimit(request, RUNTIME_CACHE, 100));
    return;
  }
  // Default: let it through
});

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkFetch = fetch(request).then((response) => {
    cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || networkFetch;
}

async function cacheFirstWithLimit(request, cacheName, maxEntries = 60) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  cache.put(request, response.clone());
  // naive LRU-ish cleanup
  cache.keys().then((keys) => {
    if (keys.length > maxEntries) cache.delete(keys[0]);
  });
  return response;
}

// Optional: allow the page to trigger an update flow
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

// Handle push events
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Plant Reminder";
  const options = {
    body: data.body || "Stanley says: \"plnt rqrs attn\" 🦈",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: data.url || "/tasks"
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
