/**
 * In-Store Computer Gallery Upload API
 *
 * POST /api/in-store/upload - Upload image with thumbnail generation
 *
 * Processes uploaded images through Sharp for optimization and generates
 * both full-size and thumbnail versions in WebP format. Supports professional
 * RAW formats from Canon, Nikon, Sony, Fujifilm, and other cameras.
 *
 * @version 1.0.0 - 2026-01-01T00:00:00Z - Initial implementation
 * @version 1.1.0 - 2026-01-19T12:00:00Z - Add RAW format support, higher quality, 100MB max
 * @version 1.2.0 - 2026-03-20T17:52:06Z - Extract shared upload pipeline to @/lib/image-upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/supabase-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { isAllowedFile, processImage, uploadToStorage, MAX_FILE_SIZE } from '@/lib/image-upload';

// Next.js App Router route segment config
export const maxDuration = 60; // 60 seconds timeout for large uploads
export const dynamic = 'force-dynamic';

// ─── IMAGE UPLOAD PIPELINE ────────────────────────────────────────
// When the admin uploads a photo of a computer, here's what happens:
//
//   1. AUTH CHECK — Only the logged-in admin can upload (middleware
//      already blocked unauthenticated requests, but we double-check).
//
//   2. FILE VALIDATION — The file must be:
//      - An image (JPEG, PNG, WebP, GIF, HEIC, TIFF, or camera RAW)
//      - Under 100 MB (RAW files from professional cameras can be 20-80 MB)
//      - RAW formats are accepted because the store uses a Canon camera.
//        Browsers often label RAW files as "application/octet-stream",
//        so we also check the file extension as a fallback.
//
//   3. IMAGE PROCESSING (via Sharp library) — Two versions are created:
//      a. Full-size: resized to fit within 2048×2048 pixels, converted
//         to WebP at 92% quality. This is what customers see on the site.
//      b. Thumbnail: resized to fit within 400×400 pixels, WebP at 85%.
//         This is the small preview shown in the gallery grid.
//      Both preserve the original aspect ratio and never upscale.
//
//   4. STORAGE UPLOAD — Both images are uploaded in parallel to Supabase
//      Storage ("gallery-images" bucket) with 1-year cache headers.
//      Filenames are: {type}-{timestamp}-full.webp and {type}-{timestamp}-thumb.webp
//
//   5. RESPONSE — Returns the public URLs for both the full image and
//      thumbnail, which get saved to the computer's database record.
// ──────────────────────────────────────────────────────────────────

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

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Storage not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const type = formData.get('type') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    if (!type || !['desktop', 'laptop'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid computer type' },
        { status: 400 }
      );
    }

    // Validate file type (MIME type or extension)
    if (!isAllowedFile(file)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unsupported file type. Allowed: JPEG, PNG, WebP, GIF, HEIC, TIFF, and RAW formats (CR2, CR3, NEF, ARW, RAF, ORF, RW2, DNG, etc.)',
        },
        { status: 400 }
      );
    }

    // Validate file size (100MB max for RAW files)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Image must be less than 100MB' },
        { status: 400 }
      );
    }

    // Get file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process image into full-size and thumbnail
    const { fullSize, thumbnail } = await processImage(buffer);

    // Upload to Supabase Storage
    const timestamp = Date.now();
    const fileName = `${type}-${timestamp}`;
    const { imageUrl, thumbnailUrl } = await uploadToStorage(
      supabaseAdmin,
      fullSize,
      thumbnail,
      fileName,
    );

    return NextResponse.json({
      success: true,
      filename: `${fileName}-full.webp`,
      path: imageUrl,
      url: imageUrl,
      thumbnailUrl: thumbnailUrl,
      thumbnailPath: thumbnailUrl,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
