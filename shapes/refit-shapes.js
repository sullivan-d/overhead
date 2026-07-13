#!/usr/bin/env node
// Rewrites every shapes/*.svg with:
//  - intrinsic width/height attrs: log-scaled by TRUE aircraft size (the
//    re-fit viewBox dims are in ~meters), 55%..100% of the display box
//  - stroke-widths multiplied so the file's main outline renders at the
//    SAME on-screen thickness (STROKE_PX) regardless of scale
// Idempotent: recomputes from viewBox each run, overwrites width/height,
// and rescales strokes from their CURRENT modal value to the target.
const fs = require("fs");
const path = require("path");

const DIR = process.argv[2] || ".";
const BOX_W = 160, BOX_H = 190;   // display box the biggest aircraft fills
const FRAC_MIN = 0.55;            // smallest aircraft draws at 55%
const SMIN = 9.5, SMAX = 95;      // meters (max dim) mapped to 55%..100%
const STROKE_PX = 0.7;            // uniform on-screen outline thickness (CSS px)

// drawings NOT at true scale in the source set: force a size in meters
const SIZE_OVERRIDE = { "Q4.svg": SMIN }; // a quadcopter drone, drawn at ~48 units

const files = fs.readdirSync(DIR).filter(f => f.endsWith(".svg"));
let report = [];
for (const f of files) {
  const p = path.join(DIR, f);
  let s = fs.readFileSync(p, "utf8");
  const m = s.match(/viewBox="([-\d. ]+)"/);
  if (!m) { console.error("NO VIEWBOX:", f); process.exit(1); }
  const [, , w, h] = m[1].trim().split(/\s+/).map(Number);
  const size = Math.min(Math.max(SIZE_OVERRIDE[f] || Math.max(w, h), SMIN), SMAX);
  const frac = FRAC_MIN + (1 - FRAC_MIN) * Math.log(size / SMIN) / Math.log(SMAX / SMIN);
  const k = frac * Math.min(BOX_W / w, BOX_H / h);
  const dispW = +(k * w).toFixed(2), dispH = +(k * h).toFixed(2);

  // modal stroke-width currently in the file (style form or attr form)
  const widths = [...s.matchAll(/stroke-width[:="]+\s*([\d.]+)/g)].map(x => +x[1]);
  if (widths.length) {
    const counts = {};
    for (const v of widths) counts[v] = (counts[v] || 0) + 1;
    const modal = +Object.entries(counts).sort((a, b) => b[1] - a[1] || b[0] - a[0])[0][0];
    const factor = (STROKE_PX / k) / modal;
    s = s.replace(/(stroke-width:)([\d.]+)/g, (_, a, v) => a + (+v * factor).toFixed(4));
    s = s.replace(/(stroke-width=")([\d.]+)(")/g, (_, a, v, b) => a + (+v * factor).toFixed(4) + b);
  }

  // set intrinsic size on the <svg> root (strip any existing width/height there)
  s = s.replace(/<svg([\s\S]*?)>/, (tag, attrs) => {
    attrs = attrs.replace(/\s+(width|height)="[^"]*"/g, "");
    return `<svg width="${dispW}" height="${dispH}"${attrs}>`;
  });
  fs.writeFileSync(p, s);
  report.push({ f, maxdim: Math.max(w, h).toFixed(1), frac: frac.toFixed(2), dispW, dispH, strokes: widths.length });
}
report.sort((a, b) => a.frac - b.frac);
console.log("files:", report.length);
console.log("smallest:", report.slice(0, 4).map(r => `${r.f} ${r.maxdim}m→${r.frac}`).join("  "));
console.log("largest:", report.slice(-4).map(r => `${r.f} ${r.maxdim}m→${r.frac}`).join("  "));
for (const key of ["A388.svg", "A320.svg", "B38M.svg", "C25B.svg", "C172.svg", "R44.svg", "Q4.svg", "Unidentified.svg"]) {
  const r = report.find(x => x.f === key);
  if (r) console.log(`${key}: maxdim ${r.maxdim}m frac ${r.frac} → ${r.dispW}×${r.dispH}px (${r.strokes} strokes)`);
  else console.log(`${key}: MISSING`);
}
