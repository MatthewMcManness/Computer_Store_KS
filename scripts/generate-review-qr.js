/**
 * Generates stylized Google review QR codes in three print formats.
 *
 * Output (in ./qr-codes/):
 *   - review-qr-bare.{svg,png}             Just the styled QR + logo, no layout
 *   - review-sticker-2x2.{svg,png}         2"x2"  @ 300 DPI (600x600)
 *   - review-counter-card-4x6.{svg,png}    4"x6"  @ 300 DPI (1200x1800)
 *   - review-poster-8.5x11.{svg,png}       8.5x11 @ 300 DPI (2550x3300)
 *
 * Run: node scripts/generate-review-qr.js
 *
 * The QR encodes the cross-device-reliable Google write-review URL with
 * highest error correction (H, ~30% redundancy). A circular white pad
 * with the CSK logo sits at the center; H-level EC handles the obscured
 * modules without breaking scans.
 */

const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const sharp = require('sharp');

const REVIEW_URL =
  'https://search.google.com/local/writereview?placeid=ChIJ_3VvYaECv4cRiKpMrSEiMiQ';

const BRAND_BLUE = '#2563eb';
const STAR_GOLD = '#fbbf24';
const TEXT_DARK = '#0f172a';
const TEXT_MUTED = '#64748b';
const FONT_STACK = "Inter, Roboto, 'Liberation Sans', 'DejaVu Sans', sans-serif";

const OUTPUT_DIR = path.join(__dirname, '..', 'qr-codes');
const ICON_PATH = path.join(__dirname, '..', 'public', 'assets', 'csk-icon.svg');

/**
 * Extracts the inner body and viewBox of csk-icon.svg so it can be
 * embedded as a nested <svg> inside our composed output.
 */
function loadIconBody() {
  const raw = fs.readFileSync(ICON_PATH, 'utf8');
  const inner = raw.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const vbMatch = raw.match(/viewBox="([^"]+)"/);
  if (!vbMatch) throw new Error('csk-icon.svg missing viewBox');
  return { inner, viewBox: vbMatch[1] };
}

/**
 * Generates a stylized QR SVG: brand-blue modules on white with a
 * circular white pad + centered CSK logo. Returns the full <svg>
 * string (no width/height attrs — caller adds them when embedding).
 */
async function makeQrWithLogo() {
  const qrSvgRaw = await QRCode.toString(REVIEW_URL, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 2,
    color: { dark: BRAND_BLUE, light: '#ffffff' },
  });

  // qrcode lib emits: <svg ... viewBox="0 0 N N" ...>...</svg>
  const vbMatch = qrSvgRaw.match(/viewBox="([^"]+)"/);
  if (!vbMatch) throw new Error('Failed to parse QR viewBox');
  const viewBox = vbMatch[1];
  const [, , vbW] = viewBox.split(' ').map(Number);

  const bodyMatch = qrSvgRaw.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  const qrInner = bodyMatch[1];

  const cx = vbW / 2;
  const cy = vbW / 2;
  // 22% diameter pad. EC level H tolerates up to ~30% obscuration.
  const padRadius = vbW * 0.11;
  const iconBoxSide = padRadius * 1.55;

  const { inner: iconInner, viewBox: iconViewBox } = loadIconBody();
  const [, , iconVbW, iconVbH] = iconViewBox.split(' ').map(Number);
  const iconScale = iconBoxSide / Math.max(iconVbW, iconVbH);
  const drawW = iconVbW * iconScale;
  const drawH = iconVbH * iconScale;
  const iconX = cx - drawW / 2;
  const iconY = cy - drawH / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
${qrInner}
<circle cx="${cx}" cy="${cy}" r="${padRadius}" fill="#ffffff"/>
<svg x="${iconX}" y="${iconY}" width="${drawW}" height="${drawH}" viewBox="${iconViewBox}" preserveAspectRatio="xMidYMid meet">
${iconInner}
</svg>
</svg>`;
}

/**
 * Returns an SVG path string for a 5-pointed star centered at (cx, cy)
 * with outer radius r and inner radius 0.4*r.
 */
function starPath(cx, cy, r) {
  const points = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.4;
    points.push(
      `${(cx + Math.cos(angle) * radius).toFixed(2)} ${(cy + Math.sin(angle) * radius).toFixed(2)}`,
    );
  }
  return `M ${points.join(' L ')} Z`;
}

/** Row of `count` gold stars centered on (cx, cy). */
function starsRow({ cx, cy, count = 5, starRadius, gap }) {
  const totalWidth = count * (starRadius * 2) + (count - 1) * gap;
  const start = cx - totalWidth / 2 + starRadius;
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = start + i * (starRadius * 2 + gap);
    out += `<path d="${starPath(x, cy, starRadius)}" fill="${STAR_GOLD}"/>`;
  }
  return out;
}

/** Nest a QR SVG block at (x, y) sized to fit `size`x`size` inside the parent. */
function embedQr(qrSvg, x, y, size) {
  return qrSvg.replace(
    /^<svg /,
    `<svg x="${x}" y="${y}" width="${size}" height="${size}" `,
  );
}

/** Wrap a QR SVG for standalone use at the given pixel size. */
function bareQrSvg(qrSvg, sizePx) {
  return qrSvg.replace(
    /^<svg /,
    `<svg width="${sizePx}" height="${sizePx}" `,
  );
}

async function buildLayouts() {
  const qr = await makeQrWithLogo();

  // Bare QR — 1000x1000 nominal; vector so scales freely.
  const bareSvg = bareQrSvg(qr, 1000);

  // Sticker 2"x2" @ 300 DPI = 600x600
  const sW = 600;
  const sQR = 460;
  const stickerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sW}" height="${sW}" viewBox="0 0 ${sW} ${sW}">
<rect width="${sW}" height="${sW}" fill="#ffffff"/>
${starsRow({ cx: sW / 2, cy: 42, count: 5, starRadius: 16, gap: 6 })}
${embedQr(qr, (sW - sQR) / 2, 75, sQR)}
<text x="${sW / 2}" y="568" text-anchor="middle" font-family="${FONT_STACK}" font-size="34" font-weight="700" fill="${TEXT_DARK}">Scan to review us</text>
</svg>`;

  // Counter card 4"x6" portrait @ 300 DPI = 1200x1800
  const cW = 1200;
  const cH = 1800;
  const cQR = 900;
  const cardSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cW}" height="${cH}" viewBox="0 0 ${cW} ${cH}">
<rect width="${cW}" height="${cH}" fill="#ffffff"/>
<rect x="0" y="0" width="${cW}" height="14" fill="${BRAND_BLUE}"/>
<rect x="0" y="${cH - 14}" width="${cW}" height="14" fill="${BRAND_BLUE}"/>
${starsRow({ cx: cW / 2, cy: 150, count: 5, starRadius: 38, gap: 16 })}
<text x="${cW / 2}" y="310" text-anchor="middle" font-family="${FONT_STACK}" font-size="100" font-weight="800" fill="${TEXT_DARK}">How did we do?</text>
<text x="${cW / 2}" y="390" text-anchor="middle" font-family="${FONT_STACK}" font-size="42" font-weight="500" fill="${TEXT_MUTED}">Scan to leave us a Google review</text>
${embedQr(qr, (cW - cQR) / 2, 450, cQR)}
<text x="${cW / 2}" y="1500" text-anchor="middle" font-family="${FONT_STACK}" font-size="36" font-weight="700" fill="${TEXT_DARK}">The Computer Store</text>
<text x="${cW / 2}" y="1555" text-anchor="middle" font-family="${FONT_STACK}" font-size="28" font-weight="400" fill="${TEXT_MUTED}">(785) 267-3223 · computerstoreks.com</text>
<text x="${cW / 2}" y="1610" text-anchor="middle" font-family="${FONT_STACK}" font-size="26" font-weight="400" fill="${TEXT_MUTED}">2008 SW Gage Blvd, Topeka, KS</text>
</svg>`;

  // Poster 8.5"x11" portrait @ 300 DPI = 2550x3300
  const pW = 2550;
  const pH = 3300;
  const pQR = 1700;
  const posterSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pW}" height="${pH}" viewBox="0 0 ${pW} ${pH}">
<rect width="${pW}" height="${pH}" fill="#ffffff"/>
<rect x="0" y="0" width="${pW}" height="28" fill="${BRAND_BLUE}"/>
<rect x="0" y="${pH - 28}" width="${pW}" height="28" fill="${BRAND_BLUE}"/>
${starsRow({ cx: pW / 2, cy: 300, count: 5, starRadius: 75, gap: 32 })}
<text x="${pW / 2}" y="580" text-anchor="middle" font-family="${FONT_STACK}" font-size="190" font-weight="800" fill="${TEXT_DARK}">Loved your visit?</text>
<text x="${pW / 2}" y="690" text-anchor="middle" font-family="${FONT_STACK}" font-size="76" font-weight="500" fill="${TEXT_MUTED}">Help others find us on Google.</text>
${embedQr(qr, (pW - pQR) / 2, 790, pQR)}
<text x="${pW / 2}" y="2650" text-anchor="middle" font-family="${FONT_STACK}" font-size="64" font-weight="600" fill="${BRAND_BLUE}">Scan with your phone's camera</text>
<text x="${pW / 2}" y="2920" text-anchor="middle" font-family="${FONT_STACK}" font-size="60" font-weight="700" fill="${TEXT_DARK}">Computer Store Kansas</text>
<text x="${pW / 2}" y="3000" text-anchor="middle" font-family="${FONT_STACK}" font-size="44" font-weight="400" fill="${TEXT_MUTED}">2008 SW Gage Blvd, Topeka, KS · (785) 267-3223</text>
</svg>`;

  return { bareSvg, stickerSvg, cardSvg, posterSvg };
}

async function run() {
  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });
  const { bareSvg, stickerSvg, cardSvg, posterSvg } = await buildLayouts();

  const outputs = [
    { name: 'review-qr-bare', svg: bareSvg },
    { name: 'review-sticker-2x2', svg: stickerSvg },
    { name: 'review-counter-card-4x6', svg: cardSvg },
    { name: 'review-poster-8.5x11', svg: posterSvg },
  ];

  for (const o of outputs) {
    const svgPath = path.join(OUTPUT_DIR, `${o.name}.svg`);
    const pngPath = path.join(OUTPUT_DIR, `${o.name}.png`);
    await fs.promises.writeFile(svgPath, o.svg);
    await sharp(Buffer.from(o.svg)).png().toFile(pngPath);
    console.log(`  ✓ ${o.name}.svg + .png`);
  }
  console.log(`\nDone. Files in: ${path.relative(process.cwd(), OUTPUT_DIR)}/`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
