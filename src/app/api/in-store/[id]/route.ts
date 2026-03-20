import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import {
  getComputerById,
  getComputerByIdAdmin,
  updateComputer,
  deleteComputer,
  parsePrice,
} from '@/lib/gallery';
import {
  isSupabaseConfigured,
  isSupabaseAdminConfigured,
} from '@/lib/supabase';
import type { GallerySpec } from '@/types/gallery';

// GET /api/in-store/[id] - Get single computer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { id } = params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid computer ID format' },
        { status: 400 }
      );
    }

    // Check if admin mode requested
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    let computer;
    if (isAdmin) {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
      computer = await getComputerByIdAdmin(id);
    } else {
      computer = await getComputerById(id);
    }

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

// PUT /api/in-store/[id] - Update computer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Database admin not configured' },
        { status: 503 }
      );
    }

    const { id } = params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid computer ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.price !== undefined) {
      updateData.price = typeof body.price === 'string'
        ? parsePrice(body.price)
        : body.price;
    }
    if (body.image !== undefined) updateData.image_url = body.image;
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.thumbnail !== undefined) updateData.thumbnail_url = body.thumbnail;
    if (body.thumbnail_url !== undefined) updateData.thumbnail_url = body.thumbnail_url;
    if (body.specs !== undefined) updateData.specs = body.specs as GallerySpec[];
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;
    if (body.stock_quantity !== undefined) updateData.stock_quantity = body.stock_quantity;
    if (body.stockQuantity !== undefined) updateData.stock_quantity = body.stockQuantity;

    const updatedComputer = await updateComputer(id, updateData);

    if (!updatedComputer) {
      return NextResponse.json(
        { success: false, error: 'Computer not found or update failed' },
        { status: 404 }
      );
    }

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

// DELETE /api/in-store/[id] - Delete computer (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Database admin not configured' },
        { status: 503 }
      );
    }

    const { id } = params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid computer ID format' },
        { status: 400 }
      );
    }

    const success = await deleteComputer(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Computer not found or delete failed' },
        { status: 404 }
      );
    }

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
