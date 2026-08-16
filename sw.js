// Overhead service worker.
// Caches ONLY the static app shell so it installs and opens offline.
// It deliberately never caches OpenSky / hexdb / Nominatim responses —
// live data must always be fetched fresh, and nothing runs in the background.

const CACHE = "overhead-v95";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png",
  // inline line-art glyphs used via CSS mask — cached so an offline mask load
  // can't fail (a failed mask would paint the element as a solid square)
  "./icons/cloud.svg",
  "./icons/heart.svg",
  "./icons/sun.svg",
  "./icons/moon.svg",
  "./icons/pin.svg",
  "./icons/globe.svg",
  "./icons/ground.svg",
  "./icons/share.svg",
  // the UI typeface. A @font-face that 404s or times out falls back to
  // system-ui mid-render, which reflows every figure on the page — it belongs
  // in the shell for the same reason the mask glyphs do.
  "./fonts/barlow-600.woff",
  "./fonts/barlow-900.woff",
  // new-contact detection "bip" — part of the static app shell, not live data
  "./sounds/seatbelt-1.wav",
  // the second bip: a contact revealed ABOVE the cloud ceiling
  "./sounds/seatbelt-2.wav"
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
  const liveHosts = ["airplanes.live", "adsbdb.com", "nominatim.openstreetmap.org", "open-meteo.com"];
  if (liveHosts.some((h) => url.hostname.includes(h))) {
    return; // let the browser handle it normally
  }
  // App shell: cache-first.
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request))
  );
});
