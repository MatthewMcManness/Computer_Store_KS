/**
 * SLIDESHOW IMAGE UPLOAD API - Accepts an image file and stores it in Supabase Storage.
 * Returns the public URL to use when creating an image slide.
 *
 * POST /api/slideshow/upload - Admin: upload a PNG/JPG/WEBP image.
 * Accepts multipart/form-data with a 'file' field.
 * Returns { imageUrl: string }.
 *
 * WHEN TO EDIT: When changing allowed file types, size limits, or storage bucket.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/supabase-auth';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';

// ─── UPLOAD PIPELINE ────────────────────────────────────────────
//   1. Validate auth - admin only
//   2. Parse multipart form data, get the file
//   3. Validate file type (PNG, JPG, WEBP) and size (max 10MB)
//   4. Generate a unique filename using timestamp + random UUID
//   5. Upload raw buffer to Supabase Storage 'slideshow-images' bucket
//   6. Get the public URL and return it
//
//   The caller (admin new slide form) then uses this URL when
//   calling POST /api/slideshow to create the slide record.
// ────────────────────────────────────────────────────────────────

const ALLOWED_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Database admin not configured' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const extension = ALLOWED_TYPES[file.type];
    if (!extension) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Allowed: PNG, JPG, WEBP, GIF' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;

    // Upload to Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabaseAdmin.storage
      .from('slideshow-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('slideshow-images')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      imageUrl: urlData.publicUrl,
    });
  } catch (error) {
    console.error('Error uploading slide image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
