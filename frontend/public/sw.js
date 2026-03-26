/**
 * Ayers Guitars Service Worker
 *
 * Strategy:
 *  - App shell (HTML, JS, CSS): Cache-first with network fallback
 *  - Images: Cache-first (long-lived, optimized versions)
 *  - API calls: Network-first with cache fallback (products, banners)
 *  - 3D models (.glb): Cache-first (large, rarely change)
 *  - Fonts: Cache-first
 */

const CACHE_VERSION = 'ayers-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const API_CACHE = `${CACHE_VERSION}-api`;
const MODEL_CACHE = `${CACHE_VERSION}-models`;

// Pre-cache these on install (app shell)
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
];

// ─── Install ──────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ─── Activate — clean old caches ──────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('ayers-') && key !== STATIC_CACHE && key !== IMAGE_CACHE && key !== API_CACHE && key !== MODEL_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch ────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension, etc.
  if (!url.protocol.startsWith('http')) return;

  // API requests → Network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE, 60 * 5)); // 5 min cache
    return;
  }

  // 3D models → Cache-first (large files, rarely change)
  if (url.pathname.endsWith('.glb') || url.pathname.endsWith('.gltf')) {
    event.respondWith(cacheFirst(request, MODEL_CACHE));
    return;
  }

  // Images → Cache-first
  if (
    url.pathname.startsWith('/images') ||
    url.pathname.startsWith('/images-opt') ||
    /\.(png|jpg|jpeg|webp|avif|svg|gif)$/i.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // Fonts → Cache-first
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // JS/CSS assets (hashed filenames) → Cache-first
  if (/\/assets\/.*\.(js|css)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Navigation requests (HTML) → Network-first (SPA)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, STATIC_CACHE));
    return;
  }

  // Everything else → Network-first
  event.respondWith(networkFirst(request, STATIC_CACHE));
});

// ─── Strategies ───────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName, maxAgeSec) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // For navigation, return the cached root (SPA fallback)
    if (request.mode === 'navigate') {
      const root = await caches.match('/');
      if (root) return root;
    }

    return new Response('Offline', { status: 503 });
  }
}
