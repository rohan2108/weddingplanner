// Wedding Planner service worker.
//
// SAFETY RULES (read before editing):
// 1. Never cache anything that isn't same-origin. Supabase auth/session/data
//    requests always go to a different origin (*.supabase.co) and must
//    always hit the network directly.
// 2. Never cache non-GET requests (POST/PUT/PATCH/DELETE) — these are always
//    mutations or auth actions.
// 3. Never cache navigation (page) responses — dashboard pages are
//    server-rendered per-request based on the logged-in user's session and
//    must always be fetched fresh. We only fall back to a generic offline
//    page if the network is unavailable, and that fallback is never the
//    user's real data.
// 4. Only cache-first the Next.js static build output (content-hashed, safe
//    to cache indefinitely) and this app's own icons/manifest.

const CACHE_VERSION = "wp-static-v1";
const OFFLINE_URL = "/offline.html";

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-512-maskable.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith("/_next/static/")) return true;
  if (url.pathname.startsWith("/icons/")) return true;
  if (url.pathname === "/manifest.json") return true;
  return /\.(png|jpg|jpeg|svg|ico|webp|woff2?|ttf)$/.test(url.pathname);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Rule 2 + Rule 1: only ever intercept same-origin GET requests.
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return; // let the browser handle it normally — no caching, no interference
  }

  // Rule 4: static, content-hashed assets — safe to cache-first.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Rule 3: page navigations — always go to the network for the real,
  // session-specific page. Only show the offline page if there's truly no
  // connectivity. Never cache the navigated response itself.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Everything else (API routes, RSC payloads, Supabase-adjacent same-origin
  // calls, etc.) — always network, never cached.
});
