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
    padding: 20px 18px;
}

.product-title {
    text-align: center;
    margin-bottom: 20px;
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
    gap: 12px;
    margin-bottom: 18px;
}

.spec-card {
    background: #f8f9fa;
    border-radius: 15px;
    padding: 16px 12px;
    text-align: center;
    border-left: 4px solid #081e5b;
}

.spec-icon {
    font-size: 32px;
    margin-bottom: 10px;
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
    padding: 12px 20px;
    border-radius: 25px;
    text-align: center;
    margin: 18px 0;
    font-weight: 700;
    font-size: 16px;
    text-shadow: 0 1px 1px rgba(255,255,255,0.5);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3);
}

.price-section {
    background: linear-gradient(135deg, #081e5b 0%, #06277a 100%);
    color: white;
    padding: 20px;
    border-radius: 15px;
    text-align: center;
    margin: 18px 0;
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
    padding: 16px;
    border-radius: 15px;
    margin: 18px 0 0 0;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.peace-title {
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 15px 0;
    color: #081e5b;
    text-shadow: 0 1px 1px rgba(255,255,255,0.8);
}

.warranty-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 15px;
}

.warranty-item {
    background: rgba(255,255,255,0.9);
    padding: 15px 10px;
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

// Base64 encoded title.png placeholder (Computer Store Kansas logo)
// In production, this would be the actual logo
const LOGO_DATA_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMzAwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCI+Q29tcHV0ZXIgU3RvcmUgS2Fuc2FzPC90ZXh0Pjwvc3ZnPg==';

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

  // If laptop has a dedicated graphics card, show 5 specs in a different layout
  if (graphics) {
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
    </div>
    <div class="specs-grid" style="grid-template-columns: 1fr; max-width: 50%; margin: 0 auto;">
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
