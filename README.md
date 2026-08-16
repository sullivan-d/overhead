# Overhead — live plane radar PWA

A self-contained web app that shows aircraft flying near you on an animated radar.
No accounts, no API keys, no paid services. No build step.

## Data sources (all free, no auth)
- **airplanes.live** — live aircraft positions + type, keyless (radius query, ADSBExchange v2 format)
- **OpenStreetMap Nominatim** — address geocoding (the location fallback)

## Files
- `index.html` — the whole app
- `manifest.webmanifest` — PWA metadata (installable, standalone)
- `sw.js` — service worker; caches the app shell only, never live data
- `icon-*.png` — app icons

## Run it

### Option A — GitHub Pages (recommended)
A PWA needs HTTPS to install and to use geolocation reliably.
1. Create a repo, put these files in it (at the root, or in `/docs`).
2. Settings → Pages → deploy from branch.
3. Open the resulting `https://…github.io/…` URL on your phone.
4. Browser menu → **Add to Home Screen**. It opens fullscreen like a native app.

### Option B — your Raspberry Pi / local network
HTTPS still recommended for geolocation, but the **address fallback works over plain HTTP**, so this is fine on your LAN:
```bash
cd skyview
python3 -m http.server 8080
```
Then visit `http://<pi-ip>:8080` from your phone on the same WiFi.
(For install + geolocation, put it behind HTTPS, e.g. a self-signed cert or a tunnel.)

## Usage notes
- **Location:** tap "Use my location". If that's blocked or fails, an **address box** appears — type a city/street/postcode, pick a match.
- **Range:** 20 / 50 / 100 km rings, switchable top-left.
- **Heading up:** tap the compass button (top-left) to rotate the radar so the
  direction you're facing is at the top — hold the phone up and the plane drawn
  near the top is the one in front of you. Needs HTTPS + a phone with a compass;
  on iOS it asks permission once. A green arrow marks your facing direction.
  Tap again to return to north-up.
- **Tap any aircraft** for type, operator, altitude, speed, heading, distance, climb rate.
- **"change"** (bottom-left) re-opens the location picker.

### About the compass
- Gives you *direction* (which way to turn), not *elevation* (how high to tilt).
  The radar is a top-down map.
- The magnetometer is noisy; if it seems wrong, wave the phone in a figure-8 to
  recalibrate. Magnetic vs true north differ by only ~1-2° near Paris, so it's ignored.
- On desktop or phones without a compass, the button shows "no compass" and the
  radar stays north-up.

## Rate limits & battery
- Polls airplanes.live every **45 s**, one request per tick. Their published
  limit is 1 request/second, but the *measured* limit is nearer one request per
  ~36 s per IP, and going over starts a ~60 s penalty — so 45 s is the deliberate
  margin, not a guess. Changing the range re-filters locally and fires no extra
  request. The status bar shows the connection state (`live`, `reconnecting…`,
  `offline · retrying`, `source unavailable`, `paused`), not a request counter.
- Polling **stops the instant the app is hidden** (tab switch, lock, minimize) via the
  Page Visibility API, and resumes when visible. Nothing runs in the background.
- The service worker explicitly does **not** cache airplanes.live/Nominatim — live data is always fresh.

## License

Overhead is free software, licensed under the **GNU General Public License
v3.0** — see [`LICENSE`](LICENSE) for the full text. You may use, study, share
and modify it; if you distribute it, modified or not, the recipients get the
same freedoms and the source must come with it.

Third-party material bundled here:

- **`shapes/*.svg`** — 182 top-down aircraft silhouettes from
  [AircraftShapesSVG](https://github.com/RexKramer1/AircraftShapesSVG) by
  RexKramer1, GPL-3.0. Modified for this app (viewBox re-fit, intrinsic size
  and stroke-widths rescaled) — see [`shapes/CREDITS.md`](shapes/CREDITS.md).
- **`icons/sun.svg`, `icons/moon.svg`** — by Slamet Widodo, via the Noun
  Project, licensed **CC BY**. Modified here (embedded credit text layer
  removed; attribution retained in this file and in each SVG's source).
  The other glyphs in `icons/` are original to this project.

Live aircraft, route, weather and geocoding data come from the third-party
services listed under **Data sources** above, each under its own terms; they
are not covered by this license.
