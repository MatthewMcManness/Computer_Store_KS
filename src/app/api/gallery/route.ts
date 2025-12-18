import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import {
  getComputers,
  getAllComputers,
  createComputer,
  parsePrice,
  isSupabaseConfigured,
  isSupabaseAdminConfigured,
} from '@/lib/supabase';
import type { GallerySpec } from '@/types/gallery';

// GET /api/gallery - Get all computers
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Check if admin mode requested
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let computers;
    if (isAdmin) {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
      computers = await getAllComputers({ includeInactive });
    } else {
      computers = await getComputers();
    }

    return NextResponse.json({
      success: true,
      data: computers,
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

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Database admin not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.type || !body.category || !body.price) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse price from string to number
    const priceValue = typeof body.price === 'string'
      ? parsePrice(body.price)
      : body.price;

    const newComputer = await createComputer({
      name: body.name,
      type: body.type,
      category: body.category,
      price: priceValue,
      image_url: body.image || body.image_url || null,
      specs: (body.specs || []) as GallerySpec[],
      sort_order: body.sort_order || 0,
    });

    if (!newComputer) {
      return NextResponse.json(
        { success: false, error: 'Failed to create computer' },
        { status: 500 }
      );
    }

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
