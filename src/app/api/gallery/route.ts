import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getGalleryData, saveGalleryData, isGitHubConfigured } from '@/lib/github';
import type { GalleryComputer, GalleryData } from '@/types/gallery';
import fs from 'fs/promises';
import path from 'path';

// Import gallery data directly for bundling (works in production)
import initialGalleryData from '@/data/gallery.json';

// Local gallery data path for development
const LOCAL_GALLERY_PATH = path.join(process.cwd(), 'src/data/gallery.json');

// Get gallery data (local or GitHub)
async function loadGalleryData(): Promise<GalleryData> {
  // If GitHub is configured, use it as the source of truth
  if (isGitHubConfigured()) {
    return getGalleryData();
  }

  // In development, try to read from local file for latest changes
  if (process.env.NODE_ENV === 'development') {
    try {
      const content = await fs.readFile(LOCAL_GALLERY_PATH, 'utf-8');
      return JSON.parse(content);
    } catch {
      // Fall back to imported data
    }
  }

  // In production without GitHub, use bundled data
  return initialGalleryData as GalleryData;
}

// Save gallery data (local or GitHub)
async function persistGalleryData(data: GalleryData): Promise<void> {
  // If GitHub is configured, save there (production mode)
  if (isGitHubConfigured()) {
    await saveGalleryData(data, 'Update gallery via admin panel');
    return;
  }

  // In development, save locally
  if (process.env.NODE_ENV === 'development') {
    await fs.writeFile(LOCAL_GALLERY_PATH, JSON.stringify(data, null, 2));
    return;
  }

  // In production without GitHub, we can't persist changes
  // The changes will be lost on restart - GitHub should be configured for production
  console.warn('[Gallery] Cannot persist data: GitHub not configured in production');
}

// GET /api/gallery - Get all computers
export async function GET() {
  try {
    const data = await loadGalleryData();

    return NextResponse.json({
      success: true,
      data: data.computers,
      lastUpdated: data.lastUpdated,
    });
  } catch (error) {
    console.error('Error loading gallery:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load gallery' },
      { status: 500 }
    );
  }
}

// POST /api/gallery - Add new computer
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
    const computerData: Omit<GalleryComputer, 'id'> = body;

    // Validate required fields
    if (!computerData.name || !computerData.type || !computerData.category || !computerData.price) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Load current data
    const data = await loadGalleryData();

    // Generate new ID
    const newId = data.computers.length > 0
      ? Math.max(...data.computers.map(c => c.id)) + 1
      : 1;

    const newComputer: GalleryComputer = {
      ...computerData,
      id: newId,
    };

    // Add to computers array
    data.computers.push(newComputer);
    data.lastUpdated = new Date().toISOString();

    // Save data
    await persistGalleryData(data);

    return NextResponse.json({
      success: true,
      data: newComputer,
      message: 'Computer added successfully',
    });
  } catch (error) {
    console.error('Error adding computer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add computer' },
      { status: 500 }
    );
  }
}
