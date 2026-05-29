/**
 * Generates PCB-style circuit-trace texture SVGs used as faint background
 * overlays in the Concept 05 ("Circuitry") homepage redesign.
 *
 * Output (in ./public/assets/):
 *   - circuit-field-blue.svg    1200x800 board field, blue traces  (dark bands, plans, footer)
 *   - circuit-field-slate.svg   1200x800 board field, slate traces (final CTA)
 *   - circuit-accent-blue.svg   220x220 corner cluster, blue traces (service-card corners)
 *
 * Run: node scripts/generate-circuit-textures.js
 *
 * Stroke colors are baked in (the SVGs load via <img>, which can't inherit
 * currentColor); the consuming CSS controls opacity + masking. Output is
 * deterministic via a seeded LCG so re-runs don't churn the files.
 */

const fs = require('fs');
const path = require('path');

/** Small seeded PRNG (LCG) — deterministic output across runs. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Build a grid of orthogonal circuit traces with vias at endpoints and a
 * scattering of SMD pads — the same visual language as the hero circuit floor.
 */
function circuitField({ w, h, step, traces, color, sw, seed }) {
  const r = rng(seed);
  const cols = Math.floor(w / step);
  const rows = Math.floor(h / step);
  const node = (c, rw) => [c * step, rw * step];
  const pathEls = [];
  const vias = new Set();
  const pads = [];

  for (let t = 0; t < traces; t++) {
    let c = Math.floor(r() * (cols + 1));
    let rw = Math.floor(r() * (rows + 1));
    let [x, y] = node(c, rw);
    let d = `M${x} ${y}`;
    vias.add(`${x},${y}`);
    const segs = 2 + Math.floor(r() * 4);
    let horiz = r() < 0.5;
    for (let s = 0; s < segs; s++) {
      const stepN = 1 + Math.floor(r() * 3);
      if (horiz) c = Math.max(0, Math.min(cols, c + (r() < 0.5 ? -1 : 1) * stepN));
      else rw = Math.max(0, Math.min(rows, rw + (r() < 0.5 ? -1 : 1) * stepN));
      [x, y] = node(c, rw);
      d += ` L${x} ${y}`;
      horiz = !horiz;
    }
    vias.add(`${x},${y}`);
    pathEls.push(`<path d="${d}"/>`);
    if (r() < 0.1) pads.push([x, y]);
  }

  const viaEls = [...vias]
    .map((v) => {
      const [x, y] = v.split(',');
      return `<circle cx="${x}" cy="${y}" r="${(sw * 2).toFixed(1)}" fill="none"/><circle cx="${x}" cy="${y}" r="${(sw * 0.8).toFixed(1)}" fill="${color}" stroke="none"/>`;
    })
    .join('');

  const padEls = pads
    .map(([x, y]) => `<rect x="${x - 6}" y="${y - 4}" width="12" height="8" rx="1.5" fill="none"/>`)
    .join('');

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="none">`,
    `<g stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">`,
    pathEls.join(''),
    padEls,
    `</g>`,
    `<g stroke="${color}" stroke-width="${sw}">${viaEls}</g>`,
    `</svg>`,
  ].join('');
}

const OUT = path.join(__dirname, '..', 'public', 'assets');

const files = {
  'circuit-field-blue.svg': circuitField({ w: 1200, h: 800, step: 48, traces: 64, color: '#3b82f6', sw: 2.2, seed: 1337 }),
  'circuit-field-slate.svg': circuitField({ w: 1200, h: 800, step: 48, traces: 64, color: '#94a3b8', sw: 2.2, seed: 8675 }),
  'circuit-accent-blue.svg': circuitField({ w: 220, h: 220, step: 26, traces: 26, color: '#2563eb', sw: 2.4, seed: 4242 }),
};

for (const [name, svg] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT, name), svg);
  console.log(`wrote public/assets/${name} (${svg.length} bytes)`);
}
