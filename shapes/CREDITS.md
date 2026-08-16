# Aircraft silhouette shapes

The `*.svg` top-down aircraft silhouettes in this folder are from:

**AircraftShapesSVG** by RexKramer1
https://github.com/RexKramer1/AircraftShapesSVG

Licensed under the **GNU General Public License v3.0** — see `LICENSE`
in this folder for the full text. Files are named by ICAO type designator
(e.g. `A320.svg`, `B738.svg`) plus a generic `Unidentified.svg` fallback.

## Modifications

**These files have been modified from the originals** (2026), as required to
be stated by GPL-3.0 section 5(a). Every `*.svg` in this folder has been
rewritten by `refit-shapes.js` (included here), which:

- re-fits each file's `viewBox` to its own drawing content;
- overwrites the intrinsic `width`/`height` attributes with values log-scaled
  by the aircraft's true size, so each type renders at 55–100% of a 160×190
  display box;
- rescales every `stroke-width` so each outline renders at a uniform 0.70 CSS
  pixels regardless of that file's scale.

The artwork itself — the paths making up each silhouette — is otherwise
unchanged. The script is idempotent and recomputes from the current `viewBox`,
so re-running it does not compound these changes.
