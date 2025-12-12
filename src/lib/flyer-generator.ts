/**
 * Flyer Generator
 * Generates print-ready HTML sales flyers from GalleryComputer data
 */

import type { GalleryComputer, GallerySpec } from '@/types/gallery';

// Helper to find a spec by label (supports multiple label variants)
function getSpec(specs: GallerySpec[], ...labels: string[]): string {
  for (const label of labels) {
    const spec = specs.find(s => s.label.toLowerCase() === label.toLowerCase());
    if (spec) return spec.value;
  }
  return '';
}

// Capitalize first letter of each word
function capitalize(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

// Inlined CSS from sales-flyer.css
const BASE_CSS = `
@page {
    size: 8.5in 11in;
    margin: 0;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 0.5in;
    background: white;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}

.flyer {
    max-width: 7.5in;
    margin: 0 auto;
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    page-break-inside: avoid;
}

.header {
    background: linear-gradient(135deg, #081e5b 0%, #06277a 100%);
    color: white;
    padding: 20px;
    text-align: center;
}

.header img {
    max-width: 100%;
    height: 60px;
    object-fit: contain;
    margin-bottom: 10px;
}

.header h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
}

.content {
    padding: 16px 18px;
}

.product-title {
    text-align: center;
    margin-bottom: 16px;
}

.product-title h2 {
    font-size: 28px;
    margin: 0;
    color: #081e5b;
    font-weight: 800;
}

.specs-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 14px;
}

.spec-card {
    background: #f8f9fa;
    border-radius: 15px;
    padding: 14px 12px;
    text-align: center;
    border-left: 4px solid #081e5b;
}

/* Compact 5-spec layout for gaming laptops */
.specs-compact {
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
}

.specs-compact .spec-card {
    padding: 10px 8px;
    grid-column: span 2;
}

.specs-compact .spec-card:nth-child(4) {
    grid-column: 2 / span 2;
}

.specs-compact .spec-card:nth-child(5) {
    grid-column: 4 / span 2;
}

.specs-compact .spec-icon {
    font-size: 24px;
    margin-bottom: 6px;
}

.specs-compact .spec-icon img,
.specs-compact .spec-icon svg {
    width: 24px;
    height: 24px;
}

.specs-compact .spec-title {
    font-size: 14px;
    margin-bottom: 3px;
}

.specs-compact .spec-detail {
    font-size: 12px;
}

.spec-icon {
    font-size: 32px;
    margin-bottom: 6px;
    display: block;
}

.spec-icon img {
    width: 32px;
    height: 32px;
    object-fit: contain;
}

.spec-icon-emoji {
    font-size: 32px;
}

.spec-title {
    font-weight: 700;
    color: #081e5b;
    margin-bottom: 5px;
    font-size: 16px;
}

.spec-detail {
    color: #343a40;
    font-size: 14px;
    font-weight: 600;
}

.software-badge {
    background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
    color: #081e5b;
    padding: 10px 20px;
    border-radius: 25px;
    text-align: center;
    margin: 14px 0;
    font-weight: 700;
    font-size: 16px;
    text-shadow: 0 1px 1px rgba(255,255,255,0.5);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3);
}

.price-section {
    background: linear-gradient(135deg, #081e5b 0%, #06277a 100%);
    color: white;
    padding: 16px;
    border-radius: 15px;
    text-align: center;
    margin: 14px 0;
}

.price {
    font-size: 48px;
    font-weight: 900;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.price-note {
    margin: 10px 0 0 0;
    opacity: 0.9;
    font-size: 14px;
}

.peace-of-mind {
    background: linear-gradient(135deg, #c0c0c0 0%, #d4d4d4 100%);
    padding: 12px 16px;
    border-radius: 15px;
    margin: 12px 0 0 0;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    page-break-inside: avoid;
}

.peace-title {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: #081e5b;
    text-shadow: 0 1px 1px rgba(255,255,255,0.8);
}

.warranty-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 8px;
}

.warranty-item {
    background: rgba(255,255,255,0.9);
    padding: 12px 10px;
    border-radius: 10px;
    text-align: center;
    border: 1px solid rgba(8, 30, 91, 0.1);
}

.warranty-duration {
    font-size: 24px;
    font-weight: 800;
    color: #081e5b;
    margin: 0;
}

.warranty-type {
    font-size: 12px;
    color: #343a40;
    font-weight: 600;
    margin: 5px 0 0 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
`;

// Black Friday CSS additions
const BLACK_FRIDAY_CSS = `
/* Black Friday Theme Overrides */
.flyer.black-friday {
    border: 4px solid #fbbf24;
    box-shadow: 0 20px 40px rgba(220, 38, 38, 0.3);
    position: relative;
}

.flyer.black-friday::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
    clip-path: polygon(100% 0, 0 0, 100% 100%);
    z-index: 10;
}

.flyer.black-friday::after {
    content: '🎀';
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 32px;
    z-index: 11;
    filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
}

.black-friday-badge {
    background: linear-gradient(145deg, #dc2626 0%, #991b1b 100%);
    border: 3px solid #fbbf24;
    border-radius: 50px;
    padding: 8px 24px;
    margin-bottom: 15px;
    display: inline-block;
    box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
}

.black-friday-badge span {
    font-size: 18px;
    font-weight: 900;
    color: #fbbf24;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.black-friday .header {
    background: linear-gradient(135deg, #0f0f0f 0%, #991b1b 50%, #0f0f0f 100%);
}

.black-friday .product-title h2 {
    color: #991b1b;
}

.black-friday .spec-card {
    border-left-color: #dc2626;
}

.black-friday .spec-title {
    color: #991b1b;
}

.black-friday .price-section {
    background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
    border: 3px solid #fbbf24;
}

.black-friday .original-price {
    font-size: 24px;
    color: #888;
    text-decoration: line-through;
    margin-bottom: 5px;
}

.black-friday .sale-price {
    font-size: 52px;
    font-weight: 900;
    color: #fbbf24;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.black-friday .discount-badge {
    display: inline-block;
    background: #dc2626;
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 700;
    margin-top: 8px;
}

.black-friday .peace-of-mind {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    border: 2px solid #dc2626;
}

.black-friday .peace-title {
    color: #0f0f0f;
}

.black-friday .warranty-item {
    background: rgba(255,255,255,0.95);
    border: 2px solid #fbbf24;
}

.black-friday .warranty-duration {
    color: #dc2626;
}

.black-friday .warranty-upgraded {
    font-size: 10px;
    color: #dc2626;
    font-weight: 700;
    text-transform: uppercase;
    margin-top: 4px;
}
`;

// Base64 encoded title.png (Computer Store Kansas logo)
const LOGO_DATA_URL = 'data:image/png;base64,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';

// Graphics card SVG icon for desktop flyers
const GRAPHICS_ICON_SVG = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#081e5b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01"/><path d="M6 18v2M18 18v2"/></svg>`;

function generateDesktopSpecs(specs: GallerySpec[]): string {
  const graphics = getSpec(specs, 'Graphics', 'Graphics Card', 'GPU', 'Video Card');
  const processor = getSpec(specs, 'Processor', 'CPU');
  const memory = getSpec(specs, 'Memory', 'RAM');
  const storage = getSpec(specs, 'Storage', 'SSD', 'HDD', 'Hard Drive');

  return `
    <div class="specs-grid">
        <div class="spec-card">
            <div class="spec-icon">
                ${GRAPHICS_ICON_SVG}
            </div>
            <div class="spec-title">Graphics</div>
            <div class="spec-detail">${graphics || 'Integrated'}</div>
        </div>
        <div class="spec-card">
            <div class="spec-icon">
                <span class="spec-icon-emoji">🧠</span>
            </div>
            <div class="spec-title">Processor</div>
            <div class="spec-detail">${processor || 'N/A'}</div>
        </div>
        <div class="spec-card">
            <div class="spec-icon">
                <span class="spec-icon-emoji">⚡</span>
            </div>
            <div class="spec-title">Memory</div>
            <div class="spec-detail">${memory || 'N/A'}</div>
        </div>
        <div class="spec-card">
            <div class="spec-icon">
                <span class="spec-icon-emoji">💾</span>
            </div>
            <div class="spec-title">Storage</div>
            <div class="spec-detail">${storage || 'N/A'}</div>
        </div>
    </div>
  `;
}

function generateLaptopSpecs(specs: GallerySpec[]): string {
  const display = getSpec(specs, 'Display', 'Display Size', 'Screen', 'Screen Size');
  const processor = getSpec(specs, 'Processor', 'CPU');
  const memory = getSpec(specs, 'Memory', 'RAM');
  const storage = getSpec(specs, 'Storage', 'SSD', 'HDD', 'Hard Drive');
  const graphics = getSpec(specs, 'Graphics', 'Graphics Card', 'GPU', 'Video Card');

  // If laptop has a dedicated graphics card, show 5 specs in a compact layout
  if (graphics) {
    return `
    <div class="specs-grid specs-compact">
        <div class="spec-card">
            <div class="spec-icon">💻</div>
            <div class="spec-title">Display</div>
            <div class="spec-detail">${display || 'N/A'}</div>
        </div>
        <div class="spec-card">
            <div class="spec-icon">🧠</div>
            <div class="spec-title">Processor</div>
            <div class="spec-detail">${processor || 'N/A'}</div>
        </div>
        <div class="spec-card">
            <div class="spec-icon">
                ${GRAPHICS_ICON_SVG}
            </div>
            <div class="spec-title">Graphics</div>
            <div class="spec-detail">${graphics}</div>
        </div>
        <div class="spec-card">
            <div class="spec-icon">⚡</div>
            <div class="spec-title">Memory</div>
            <div class="spec-detail">${memory || 'N/A'}</div>
        </div>
        <div class="spec-card">
            <div class="spec-icon">💾</div>
            <div class="spec-title">Storage</div>
            <div class="spec-detail">${storage || 'N/A'}</div>
        </div>
    </div>
    `;
  }

  return `
    <div class="specs-grid">
        <div class="spec-card">
            <div class="spec-icon">💻</div>
            <div class="spec-title">Display</div>
            <div class="spec-detail">${display || 'N/A'}</div>
        </div>
        <div class="spec-card">
            <div class="spec-icon">🧠</div>
            <div class="spec-title">Processor</div>
            <div class="spec-detail">${processor || 'N/A'}</div>
        </div>
        <div class="spec-card">
            <div class="spec-icon">⚡</div>
            <div class="spec-title">Memory</div>
            <div class="spec-detail">${memory || 'N/A'}</div>
        </div>
        <div class="spec-card">
            <div class="spec-icon">💾</div>
            <div class="spec-title">Storage</div>
            <div class="spec-detail">${storage || 'N/A'}</div>
        </div>
    </div>
  `;
}

interface WarrantyOptions {
  specs: GallerySpec[];
  isLaptop: boolean;
  isBlackFriday: boolean;
  blackFridayWarranty?: string;
  blackFridayDiagnostics?: string;
}

function generateWarrantySection(options: WarrantyOptions): string {
  const { specs, isLaptop, isBlackFriday, blackFridayWarranty, blackFridayDiagnostics } = options;

  // Get warranty info from specs
  const partsWarranty = getSpec(specs, 'Parts Warranty', 'Manufacturer Warranty', 'Warranty');
  const freeDiagnostics = getSpec(specs, 'Free Diagnostics', 'Diagnostics');

  // Use Black Friday values if enabled, otherwise use spec values or defaults
  const warrantyDuration = isBlackFriday && blackFridayWarranty
    ? blackFridayWarranty
    : (partsWarranty || (isLaptop ? '1 Year' : '3 Months'));

  const warrantyType = partsWarranty ?
    (partsWarranty.toLowerCase().includes('manufacturer') ? 'Manufacturer Warranty' : 'Parts Warranty') :
    (isLaptop ? 'Manufacturer Warranty' : 'Parts Warranty');

  const diagnosticsDuration = isBlackFriday && blackFridayDiagnostics
    ? blackFridayDiagnostics
    : (freeDiagnostics || (isLaptop ? 'Lifetime' : '6 Months'));

  // Show "UPGRADED!" badge for Black Friday warranty items
  const warrantyUpgraded = isBlackFriday ? '<div class="warranty-upgraded">Upgraded!</div>' : '';
  const diagnosticsUpgraded = isBlackFriday ? '<div class="warranty-upgraded">Upgraded!</div>' : '';

  return `
    <div class="peace-of-mind">
        <div class="peace-title">🛡️ Peace of Mind Included</div>
        <div class="warranty-grid">
            <div class="warranty-item">
                <div class="warranty-duration">${warrantyDuration}</div>
                <div class="warranty-type">${warrantyType}</div>
                ${warrantyUpgraded}
            </div>
            <div class="warranty-item">
                <div class="warranty-duration">${diagnosticsDuration}</div>
                <div class="warranty-type">Free Diagnostics</div>
                ${diagnosticsUpgraded}
            </div>
        </div>
    </div>
  `;
}

/**
 * Generate price section HTML
 */
function generatePriceSection(computer: GalleryComputer): string {
  const isBlackFriday = computer.blackFriday?.enabled ?? false;

  if (isBlackFriday && computer.blackFriday) {
    const { originalPrice, salePrice, discount } = computer.blackFriday;
    return `
      <div class="price-section">
          <div class="original-price">${originalPrice}</div>
          <div class="sale-price">${salePrice}</div>
          <div class="discount-badge">${discount}% OFF</div>
          <div class="price-note">Plus applicable tax</div>
      </div>
    `;
  }

  return `
    <div class="price-section">
        <div class="price">${computer.price}</div>
        <div class="price-note">Plus applicable tax</div>
    </div>
  `;
}

/**
 * Generate a print-ready HTML flyer for a computer
 * Opens in a new browser tab ready for printing
 */
export function generateFlyer(computer: GalleryComputer): void {
  const isLaptop = computer.type === 'laptop';
  const isBlackFriday = computer.blackFriday?.enabled ?? false;
  const typeLabel = capitalize(`${computer.category} ${computer.type}`);

  const specsHtml = isLaptop
    ? generateLaptopSpecs(computer.specs)
    : generateDesktopSpecs(computer.specs);

  const priceHtml = generatePriceSection(computer);

  const warrantyHtml = generateWarrantySection({
    specs: computer.specs,
    isLaptop,
    isBlackFriday,
    blackFridayWarranty: computer.blackFriday?.originalPartsWarranty,
    blackFridayDiagnostics: computer.blackFriday?.originalFreeDiagnostics,
  });

  // Include Black Friday CSS if needed
  const css = isBlackFriday ? BASE_CSS + BLACK_FRIDAY_CSS : BASE_CSS;
  const flyerClass = isBlackFriday ? 'flyer black-friday' : 'flyer';

  // Black Friday badge HTML
  const blackFridayBadge = isBlackFriday
    ? '<div class="black-friday-badge"><span>Black Friday Sale</span></div>'
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${computer.name} - Sales Flyer</title>
    <style>${css}</style>
</head>
<body>
    <div class="${flyerClass}">
        <div class="header">
            <img src="${LOGO_DATA_URL}" alt="Computer Store Kansas">
            <h1>${typeLabel}</h1>
        </div>

        <div class="content">
            ${blackFridayBadge}
            <div class="product-title">
                <h2>${computer.name}</h2>
            </div>

            ${specsHtml}

            <div class="software-badge">
                🖥️ Windows 11 Pre-Installed${isLaptop ? '!' : ''}
            </div>

            ${priceHtml}

            ${warrantyHtml}
        </div>
    </div>
</body>
</html>`;

  // Create blob and open in new tab
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');

  // Clean up the URL after a delay to allow the new tab to load
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
