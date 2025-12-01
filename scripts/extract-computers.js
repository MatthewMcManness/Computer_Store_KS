#!/usr/bin/env node
/**
 * Extract computer data from HTML backup and convert to gallery.json format
 */

const fs = require('fs');
const path = require('path');

// Read the backup HTML file
const backupPath = path.join(__dirname, '../backups/index_backup_20251112_165648.html');
const outputPath = path.join(__dirname, '../src/data/gallery.json');

const html = fs.readFileSync(backupPath, 'utf-8');

// Normalize HTML - collapse whitespace between tags
const normalizedHtml = html.replace(/>\s+</g, '><').replace(/\s+/g, ' ');

const computers = [];
let id = 1;

// Find all gallery cards
const cardRegex = /<div class="gallery-card"[^>]*data-category="([^"]*)"[^>]*data-computer-id="(\d+)"[^>]*data-type="([^"]*)"[^>]*>(.*?)<\/div><\/div><\/div>(?=<div class="gallery-card"|<\/div><\/section>)/g;

let cardMatch;
while ((cardMatch = cardRegex.exec(normalizedHtml)) !== null) {
  const [fullMatch, category, originalId, type, cardContent] = cardMatch;

  const computer = {
    id: id++,
    name: '',
    type: type,
    category: category,
    price: '',
    image: '',
    specs: [],
    blackFriday: null
  };

  // Extract name
  const nameMatch = cardContent.match(/gallery-card-title[^>]*>([^<]+)</);
  if (nameMatch) {
    computer.name = nameMatch[1].trim();
  }

  // Extract image
  const imgMatch = cardContent.match(/gallery-card-image[^>]*><img[^>]*src="([^"]+)"/);
  if (imgMatch) {
    computer.image = imgMatch[1].replace('./', '/');
  }

  // Extract Black Friday pricing
  const originalPriceMatch = cardContent.match(/original-price[^>]*>([^<]+)</);
  const salePriceMatch = cardContent.match(/sale-price[^>]*>([^<]+)</);
  const savingsMatch = cardContent.match(/savings-badge[^>]*>[^<]*(\d+)%/);

  if (originalPriceMatch && salePriceMatch) {
    computer.price = originalPriceMatch[1].trim();
    computer.blackFriday = {
      enabled: true,
      originalPrice: originalPriceMatch[1].trim(),
      salePrice: salePriceMatch[1].trim(),
      discount: savingsMatch ? parseInt(savingsMatch[1]) : 10
    };
  } else {
    // Regular price
    const priceMatch = cardContent.match(/gallery-card-price[^>]*>([^<]*\$[\d,]+(?:\.\d{2})?)/);
    if (priceMatch) {
      computer.price = priceMatch[1].trim();
    }
  }

  // Extract specs
  const specsSection = cardContent.match(/gallery-card-specs[^>]*>(.*?)<\/div><\/div>/);
  if (specsSection) {
    const specsHtml = specsSection[1];

    // Match spec items
    const specRegex = /spec-item[^>]*><strong>([^<]+)<\/strong>([^<]*)/g;
    let specMatch;
    while ((specMatch = specRegex.exec(specsHtml)) !== null) {
      const label = specMatch[1].trim().replace(/:$/, '');
      const value = specMatch[2].trim();
      if (label && value) {
        computer.specs.push({ label, value });
      }
    }

    // Also try warranty format: <strong>VALUE</strong><strong>LABEL</strong>
    const warrantyRegex = /<strong>([^<]+)<\/strong><strong>([^<]+)<\/strong>/g;
    while ((specMatch = warrantyRegex.exec(specsHtml)) !== null) {
      const value = specMatch[1].trim();
      const label = specMatch[2].trim();
      // Check if this isn't already added and looks like a warranty
      if (label && value && !computer.specs.find(s => s.label === label)) {
        computer.specs.push({ label, value });
      }
    }
  }

  if (computer.name) {
    computers.push(computer);
  }
}

// Create gallery data structure
const galleryData = {
  computers: computers,
  lastUpdated: new Date().toISOString(),
  version: '1.0.0'
};

// Write to file
fs.writeFileSync(outputPath, JSON.stringify(galleryData, null, 2));

console.log(`Extracted ${computers.length} computers to ${outputPath}`);
console.log('\nComputers found:');
computers.forEach(c => {
  console.log(`  - ${c.name} (${c.type}/${c.category}) - ${c.price} - ${c.specs.length} specs`);
  if (c.blackFriday?.enabled) {
    console.log(`    Black Friday: ${c.blackFriday.originalPrice} -> ${c.blackFriday.salePrice} (${c.blackFriday.discount}% off)`);
  }
});
