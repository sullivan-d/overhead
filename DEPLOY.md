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
The service worker cache is versioned (`overhead-v3` in `sw.js`); if you make
big changes and want to force everyone to refresh, bump it to `overhead-v2`.

## Reminders
- Live aircraft data always comes from airplanes.live over the internet — that part
  can't be offline. The app *shell* works offline once loaded (service worker).
- airplanes.live is rate-limited to ~1 request/second; we poll every 30s
  and pauses when the tab is hidden.
