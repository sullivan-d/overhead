# Deploy Overhead to GitHub Pages

This puts the app on a public **https://** URL. That fixes every `file://` error
you saw (manifest, service worker, geolocation, API CORS) and lets anyone
install it from any device with no setup.

## One-time setup

### 1. Make a repository
- Go to https://github.com/new
- Name it e.g. `overhead`
- Public, no README needed
- Create repository

### 2. Upload the files
Easiest (no command line):
- On the empty repo page, click **"uploading an existing file"**
- Drag in **the contents** of the `skyview` folder — that is `index.html`,
  `manifest.webmanifest`, `sw.js`, and all the `icon-*.png` files.
  **Upload the files themselves, not the folder**, so `index.html` sits at the repo root.
- Commit.

(Or with git:)
```bash
cd skyview
git init
git add .
git commit -m "Overhead live plane radar"
git branch -M main
git remote add origin https://github.com/<you>/overhead.git
git push -u origin main
```

### 3. Turn on Pages
- Repo → **Settings** → **Pages**
- Source: **Deploy from a branch**
- Branch: **main**, folder: **/ (root)** → Save
- Wait ~1 minute. The page shows your URL:
  `https://<you>.github.io/overhead/`

## Use it
Open that URL on any phone or computer.
- It will ask for location — tap allow. (Address box is still there as a fallback.)
- Status should read **live**, not offline.
- **Install:** phone browser menu → **Add to Home Screen**. Opens fullscreen,
  with the radar icon, like a native app.

Share the URL with anyone — they install it the same way.

## Updating later
Edit a file and commit (or re-upload). Pages redeploys in ~1 minute.

**On every user-visible change, bump the version in two places:**
- `const CACHE = "overhead-vN"` in `sw.js` — forces existing installs to pick up
  the new files instead of serving the cached shell.
- `const APP_VERSION = "vN"` in `index.html` — shown in the detail-sheet footer.

Nothing keeps these two in sync automatically, so bump both by hand, to the same
number. (Currently `v87`.)

## Reminders
- Live aircraft data always comes from airplanes.live over the internet — that part
  can't be offline. The app *shell* works offline once loaded (service worker).
- airplanes.live's real rate limit is about **one request per ~36 seconds per IP**
  (not the "1 per second" often quoted), and going over starts a ~60s penalty.
  The app polls every 45s, one request per tick, and pauses when the tab is
  hidden. Don't shorten the poll or add extra fetches — see CLAUDE.md.
