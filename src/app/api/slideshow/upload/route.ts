/**
 * SLIDESHOW IMAGE UPLOAD API - Accepts an image file and stores it on the
 * local uploads volume. Returns the same-origin URL to use when creating
 * an image slide.
 *
 * POST /api/slideshow/upload - Admin: upload a PNG/JPG/WEBP image.
 * Accepts multipart/form-data with a 'file' field.
 * Returns { imageUrl: string }.
 *
 * WHEN TO EDIT: When changing allowed file types, size limits, or where
 * uploaded images are written.
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

// ─── UPLOAD PIPELINE ────────────────────────────────────────────
//   1. Parse multipart form data, get the file (admin access is gated at the edge)
//   2. Validate file type (PNG, JPG, WEBP) and size (max 10MB)
//   3. Generate a unique filename using timestamp + random UUID
//   4. Write the raw buffer to the uploads volume (UPLOADS_DIR)
//   5. Return the same-origin /uploads/<filename> URL
//
//   The caller (admin new slide form) then uses this URL when
//   calling POST /api/slideshow to create the slide record.
// ────────────────────────────────────────────────────────────────

const UPLOADS_DIR = process.env.UPLOADS_DIR || '/data/uploads';

const ALLOWED_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
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

    // Generate unique filename and write to the uploads volume
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
    await mkdir(UPLOADS_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(join(UPLOADS_DIR, fileName), buffer);

    return NextResponse.json({
      success: true,
      imageUrl: `/uploads/${fileName}`,
    });
  } catch (error) {
    console.error('Error uploading slide image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
