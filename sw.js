// Overhead service worker.
// Caches ONLY the static app shell so it installs and opens offline.
// It deliberately never caches OpenSky / hexdb / Nominatim responses —
// live data must always be fetched fresh, and nothing runs in the background.

const CACHE = "overhead-v19";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      // cache each asset individually so one missing file can't abort install
      Promise.all(SHELL.map((url) => c.add(url).catch(() => {})))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Live data hosts: always go to network, never cache, never intercept offline.
  const liveHosts = ["airplanes.live", "adsbdb.com", "nominatim.openstreetmap.org"];
  if (liveHosts.some((h) => url.hostname.includes(h))) {
    return; // let the browser handle it normally
  }
  // App shell: cache-first.
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request))
  );
});
