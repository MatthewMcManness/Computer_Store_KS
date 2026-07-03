/**
 * SLIDESHOW CREATE API - Admin only: create a new slide.
 *
 * POST /api/slideshow/create - Admin only: creates a new slide.
 *
 * Lives on a subpath (not bare POST /api/slideshow) so Cloudflare Access can
 * gate it at the edge: the bare /api/slideshow path must stay public for the
 * unattended in-store TV (GET), and Access is method-agnostic, so admin writes
 * moved here under the gated /api/slideshow/ scope.
 *
 * WHEN TO EDIT: When changing how slides are created.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSlide } from '@/lib/slideshow';
import { isDbConfigured } from '@/lib/db';
import type { CreateSlideInput } from '@/types/slideshow';

export const dynamic = 'force-dynamic';

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
