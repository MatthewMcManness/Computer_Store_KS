import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import sharp from 'sharp';

// Next.js App Router route segment config
export const maxDuration = 60; // 60 seconds timeout for large uploads
export const dynamic = 'force-dynamic';

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Allowed MIME types (including raw formats from phones)
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
];

/**
 * POST /api/blog/upload
 * Upload an image for blog posts to Supabase Storage
 * Generates two sizes: full (1200x800) and thumbnail (400x267) as WebP
 */
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

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileType = file.type.toLowerCase();
    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid image format. Allowed: JPEG, PNG, WebP, GIF, HEIC' },
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
    const fullFilename = `blog-${timestamp}-full.webp`;
    const thumbFilename = `blog-${timestamp}-thumb.webp`;

    // Generate full-size image (1200x800 WebP)
    const fullBuffer = await sharp(buffer)
      .resize(1200, 800, {
        fit: 'cover',
        position: 'center',
      })
      .webp({
        quality: 85,
      })
      .toBuffer();

    // Generate thumbnail (400x267 WebP - maintains 3:2 aspect ratio for blog cards)
    const thumbBuffer = await sharp(buffer)
      .resize(400, 267, {
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
        .from('blog-images')
        .upload(fullFilename, fullBuffer, {
          contentType: 'image/webp',
          cacheControl: '31536000', // 1 year cache
          upsert: false,
        }),
      supabaseAdmin.storage
        .from('blog-images')
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
      .from('blog-images')
      .getPublicUrl(fullFilename);

    const { data: thumbUrlData } = supabaseAdmin.storage
      .from('blog-images')
      .getPublicUrl(thumbFilename);

    return NextResponse.json({
      success: true,
      filename: fullFilename,
      url: fullUrlData.publicUrl,
      thumbnailUrl: thumbUrlData.publicUrl,
      thumbnailFilename: thumbFilename,
    });
  } catch (error) {
    console.error('Error uploading blog image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
