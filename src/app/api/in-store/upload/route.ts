import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import sharp from 'sharp';

// Next.js App Router route segment config
export const maxDuration = 60; // 60 seconds timeout for large uploads
export const dynamic = 'force-dynamic';

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Allowed image types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
];

// POST /api/in-store/upload - Upload image with thumbnail generation to Supabase Storage
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

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only JPEG, PNG, WebP, GIF, and HEIC images are allowed',
        },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Image must be less than 50MB' },
        { status: 400 }
      );
    }

    // Get file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate filenames
    const timestamp = Date.now();
    const fullFilename = `${type}-${timestamp}-full.webp`;
    const thumbFilename = `${type}-${timestamp}-thumb.webp`;

    // Generate full-size image (1200x900 WebP)
    const fullBuffer = await sharp(buffer)
      .resize(1200, 900, {
        fit: 'cover',
        position: 'center',
      })
      .webp({
        quality: 85,
      })
      .toBuffer();

    // Generate thumbnail (400x300 WebP)
    const thumbBuffer = await sharp(buffer)
      .resize(400, 300, {
        fit: 'cover',
        position: 'center',
      })
      .webp({
        quality: 80,
      })
      .toBuffer();

    // Upload both images to Supabase Storage in parallel
    const [fullUpload, thumbUpload] = await Promise.all([
      supabaseAdmin.storage
        .from('gallery-images')
        .upload(fullFilename, fullBuffer, {
          contentType: 'image/webp',
          cacheControl: '31536000', // 1 year cache
          upsert: false,
        }),
      supabaseAdmin.storage
        .from('gallery-images')
        .upload(thumbFilename, thumbBuffer, {
          contentType: 'image/webp',
          cacheControl: '31536000',
          upsert: false,
        }),
    ]);

    if (fullUpload.error) {
      console.error('Error uploading full image:', fullUpload.error);
      return NextResponse.json(
        { success: false, error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    if (thumbUpload.error) {
      console.error('Error uploading thumbnail:', thumbUpload.error);
      return NextResponse.json(
        { success: false, error: 'Failed to upload thumbnail' },
        { status: 500 }
      );
    }

    // Get public URLs for both images
    const { data: fullUrlData } = supabaseAdmin.storage
      .from('gallery-images')
      .getPublicUrl(fullFilename);

    const { data: thumbUrlData } = supabaseAdmin.storage
      .from('gallery-images')
      .getPublicUrl(thumbFilename);

    return NextResponse.json({
      success: true,
      filename: fullFilename,
      path: fullUrlData.publicUrl,
      url: fullUrlData.publicUrl,
      thumbnailUrl: thumbUrlData.publicUrl,
      thumbnailPath: thumbUrlData.publicUrl,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
