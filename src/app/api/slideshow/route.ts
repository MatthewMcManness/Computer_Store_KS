/**
 * SLIDESHOW API - List active slides and create new slides.
 *
 * GET /api/slideshow  - Public: returns ONLY active, non-archived slides in
 *                       order. This is the unattended in-store TV display set,
 *                       so it must never return inactive/admin-only slides.
 *                       Admin (all non-archived) lives at GET /api/slideshow/all.
 * POST /api/slideshow - Admin only: creates a new slide.
 *
 * WHEN TO EDIT: When changing how slides are listed or created.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getActiveSlides, createSlide } from '@/lib/slideshow';
import { isDbConfigured } from '@/lib/db';
import type { CreateSlideInput } from '@/types/slideshow';

// Always run per-request so the in-store TV display gets live slides.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Public read path: active, non-archived slides only.
    const slides = await getActiveSlides();
    return NextResponse.json({ success: true, data: slides });
  } catch (error) {
    console.error('Error loading slides:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load slides' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();

    if (!body.title || !body.type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, type' },
        { status: 400 }
      );
    }

    if (body.type !== 'html' && body.type !== 'image') {
      return NextResponse.json(
        { success: false, error: 'type must be "html" or "image"' },
        { status: 400 }
      );
    }

    if (body.type === 'html' && !body.content) {
      return NextResponse.json(
        { success: false, error: 'HTML slides require content' },
        { status: 400 }
      );
    }

    if (body.type === 'image' && !body.image_url) {
      return NextResponse.json(
        { success: false, error: 'Image slides require image_url' },
        { status: 400 }
      );
    }

    const input: CreateSlideInput = {
      title: body.title,
      type: body.type,
      content: body.content,
      image_url: body.image_url,
    };

    const slide = await createSlide(input);

    if (!slide) {
      return NextResponse.json(
        { success: false, error: 'Failed to create slide' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: slide,
      message: 'Slide created successfully',
    });
  } catch (error) {
    console.error('Error creating slide:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create slide' },
      { status: 500 }
    );
  }
}
