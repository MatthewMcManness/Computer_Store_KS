import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getGalleryData, saveGalleryData, isGitHubConfigured } from '@/lib/github';
import type { GalleryComputer, GalleryData } from '@/types/gallery';
import fs from 'fs/promises';
import path from 'path';

// Local gallery data path
const LOCAL_GALLERY_PATH = path.join(process.cwd(), 'src/data/gallery.json');

// Get gallery data
async function loadGalleryData(): Promise<GalleryData> {
  if (process.env.NODE_ENV === 'development' || !isGitHubConfigured()) {
    try {
      const content = await fs.readFile(LOCAL_GALLERY_PATH, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {
        computers: [],
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
      };
    }
  }

  return getGalleryData();
}

// Save gallery data
async function persistGalleryData(data: GalleryData): Promise<void> {
  await fs.writeFile(LOCAL_GALLERY_PATH, JSON.stringify(data, null, 2));

  if (isGitHubConfigured()) {
    await saveGalleryData(data, 'Update gallery via admin panel');
  }
}

// GET /api/gallery/[id] - Get single computer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const computerId = parseInt(id);

    if (isNaN(computerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid computer ID' },
        { status: 400 }
      );
    }

    const data = await loadGalleryData();
    const computer = data.computers.find(c => c.id === computerId);

    if (!computer) {
      return NextResponse.json(
        { success: false, error: 'Computer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: computer,
    });
  } catch (error) {
    console.error('Error loading computer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load computer' },
      { status: 500 }
    );
  }
}

// PUT /api/gallery/[id] - Update computer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const computerId = parseInt(id);

    if (isNaN(computerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid computer ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updateData: Partial<GalleryComputer> = body;

    // Load current data
    const data = await loadGalleryData();
    const computerIndex = data.computers.findIndex(c => c.id === computerId);

    if (computerIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Computer not found' },
        { status: 404 }
      );
    }

    // Update computer
    const existingComputer = data.computers[computerIndex];
    if (!existingComputer) {
      return NextResponse.json(
        { success: false, error: 'Computer not found' },
        { status: 404 }
      );
    }

    const updatedComputer: GalleryComputer = {
      ...existingComputer,
      ...updateData,
      id: computerId, // Ensure ID doesn't change
      name: updateData.name ?? existingComputer.name,
      type: updateData.type ?? existingComputer.type,
      category: updateData.category ?? existingComputer.category,
      price: updateData.price ?? existingComputer.price,
      image: updateData.image ?? existingComputer.image,
      specs: updateData.specs ?? existingComputer.specs,
    };

    data.computers[computerIndex] = updatedComputer;
    data.lastUpdated = new Date().toISOString();

    // Save data
    await persistGalleryData(data);

    return NextResponse.json({
      success: true,
      data: updatedComputer,
      message: 'Computer updated successfully',
    });
  } catch (error) {
    console.error('Error updating computer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update computer' },
      { status: 500 }
    );
  }
}

// DELETE /api/gallery/[id] - Delete computer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const computerId = parseInt(id);

    if (isNaN(computerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid computer ID' },
        { status: 400 }
      );
    }

    // Load current data
    const data = await loadGalleryData();
    const computerIndex = data.computers.findIndex(c => c.id === computerId);

    if (computerIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Computer not found' },
        { status: 404 }
      );
    }

    // Remove computer
    data.computers.splice(computerIndex, 1);
    data.lastUpdated = new Date().toISOString();

    // Save data
    await persistGalleryData(data);

    return NextResponse.json({
      success: true,
      message: 'Computer deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting computer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete computer' },
      { status: 500 }
    );
  }
}
