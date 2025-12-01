import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getGalleryData, saveGalleryData, isGitHubConfigured } from '@/lib/github';
import type { GalleryData, SaleType, BlackFridayData } from '@/types/gallery';
import { AVAILABLE_SALES } from '@/types/gallery';
import fs from 'fs/promises';
import path from 'path';

// Import gallery data directly for bundling (works in production)
import initialGalleryData from '@/data/gallery.json';

// Local gallery data path
const LOCAL_GALLERY_PATH = path.join(process.cwd(), 'src/data/gallery.json');

// Get gallery data
async function loadGalleryData(): Promise<GalleryData> {
  if (isGitHubConfigured()) {
    return getGalleryData();
  }

  if (process.env.NODE_ENV === 'development') {
    try {
      const content = await fs.readFile(LOCAL_GALLERY_PATH, 'utf-8');
      return JSON.parse(content);
    } catch {
      // Fall back to imported data
    }
  }

  return initialGalleryData as GalleryData;
}

// Save gallery data
async function persistGalleryData(data: GalleryData): Promise<void> {
  if (isGitHubConfigured()) {
    await saveGalleryData(data, 'Update global sale setting via admin panel');
    return;
  }

  if (process.env.NODE_ENV === 'development') {
    await fs.writeFile(LOCAL_GALLERY_PATH, JSON.stringify(data, null, 2));
    return;
  }

  console.warn('[Gallery] Cannot persist data: GitHub not configured in production');
}

// Helper to parse price string to number
function parsePrice(price: string): number {
  return parseFloat(price.replace(/[$,]/g, '')) || 0;
}

// Helper to format number as price string
function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// Apply sale to a computer (only refurbished computers are eligible)
function applySaleToComputer(
  computer: GalleryData['computers'][0],
  saleType: SaleType,
  discount: number
): GalleryData['computers'][0] {
  // Only refurbished computers are eligible for sales
  const isEligible = computer.category === 'refurbished';

  if (saleType === 'none' || !isEligible) {
    // Remove Black Friday data
    return {
      ...computer,
      blackFriday: undefined,
    };
  }

  // Apply the sale to eligible (refurbished) computers
  const originalPrice = parsePrice(computer.price);
  const salePrice = originalPrice * (1 - discount / 100);

  const blackFridayData: BlackFridayData = {
    enabled: true,
    originalPrice: computer.price,
    salePrice: formatPrice(salePrice),
    discount: discount,
  };

  return {
    ...computer,
    blackFriday: blackFridayData,
  };
}

// GET /api/gallery/sale - Get current sale setting
export async function GET() {
  try {
    const data = await loadGalleryData();
    const currentSale = data.globalSale || 'none';
    const saleConfig = AVAILABLE_SALES.find(s => s.type === currentSale) || AVAILABLE_SALES[0];

    return NextResponse.json({
      success: true,
      data: {
        currentSale,
        saleConfig,
        availableSales: AVAILABLE_SALES,
      },
    });
  } catch (error) {
    console.error('Error loading sale setting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load sale setting' },
      { status: 500 }
    );
  }
}

// POST /api/gallery/sale - Update global sale setting
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { saleType } = body as { saleType: SaleType };

    // Validate sale type
    const saleConfig = AVAILABLE_SALES.find(s => s.type === saleType);
    if (!saleConfig) {
      return NextResponse.json(
        { success: false, error: 'Invalid sale type' },
        { status: 400 }
      );
    }

    // Load current data
    const data = await loadGalleryData();

    // Update global sale setting
    data.globalSale = saleType;

    // Apply sale to all computers
    data.computers = data.computers.map(computer =>
      applySaleToComputer(computer, saleType, saleConfig.discount)
    );

    data.lastUpdated = new Date().toISOString();

    // Save data
    await persistGalleryData(data);

    // Count refurbished computers (the only ones affected by sales)
    const refurbishedCount = data.computers.filter(c => c.category === 'refurbished').length;

    return NextResponse.json({
      success: true,
      data: {
        currentSale: saleType,
        saleConfig,
        affectedComputers: refurbishedCount,
      },
      message: saleType === 'none'
        ? `Sale removed from ${refurbishedCount} refurbished computers`
        : `${saleConfig.name} applied to ${refurbishedCount} refurbished computers`,
    });
  } catch (error) {
    console.error('Error updating sale setting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update sale setting' },
      { status: 500 }
    );
  }
}
