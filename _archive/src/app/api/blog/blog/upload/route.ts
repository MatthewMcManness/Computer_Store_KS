/**
 * Blog Image Upload API
 *
 * POST /api/blog/upload - Upload image with thumbnail generation
 *
 * Processes uploaded images through Sharp for optimization and generates
 * both full-size and thumbnail versions in WebP format. Supports professional
 * RAW formats from Canon, Nikon, Sony, Fujifilm, and other cameras.
 *
 * @version 1.0.0 - 2026-01-01T00:00:00Z - Initial implementation
 * @version 1.1.0 - 2026-01-19T12:00:00Z - Add RAW format support, higher quality, 100MB max
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import sharp from 'sharp';

// Next.js App Router route segment config
export const maxDuration = 60; // 60 seconds timeout for large uploads
export const dynamic = 'force-dynamic';

// Maximum file size: 100MB (RAW files can be 20-80MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/tiff',
  'image/x-canon-cr2',
  'image/x-canon-cr3',
  'image/x-canon-crw',
  'image/x-nikon-nef',
  'image/x-sony-arw',
  'image/x-fuji-raf',
  'image/x-olympus-orf',
  'image/x-panasonic-rw2',
  'image/x-pentax-pef',
  'image/x-adobe-dng',
  'image/x-leica-rwl',
  'image/x-samsung-srw',
  'application/octet-stream', // RAW files often come as this
];

// Allowed file extensions (for RAW format fallback validation)
const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif', '.tiff', '.tif',
  // Canon
  '.cr2', '.cr3', '.crw',
  // Nikon
  '.nef', '.nrw',
  // Sony
  '.arw', '.srf', '.sr2',
  // Fujifilm
  '.raf',
  // Olympus
  '.orf',
  // Panasonic
  '.rw2',
  // Pentax
  '.pef', '.ptx',
  // Adobe DNG (universal RAW)
  '.dng',
  // Leica
  '.rwl',
  // Samsung
  '.srw',
];

/**
 * Check if file is allowed based on MIME type or extension
 */
function isAllowedFile(file: File): boolean {
  // Check MIME type first
  if (ALLOWED_MIME_TYPES.includes(file.type)) {
    // For octet-stream, also verify extension
    if (file.type === 'application/octet-stream') {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return ALLOWED_EXTENSIONS.includes(ext);
    }
    return true;
  }

  // Fallback: check extension (RAW files often have wrong MIME type)
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * POST /api/blog/upload
 * Upload an image for blog posts to Supabase Storage
 * Generates two sizes: full (max 2048px) and thumbnail (400px) as WebP
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

    // Generate filenames
    const timestamp = Date.now();
    const fullFilename = `blog-${timestamp}-full.webp`;
    const thumbFilename = `blog-${timestamp}-thumb.webp`;

    // Generate high-quality full-size image (max 2048px, preserves aspect ratio)
    const fullBuffer = await sharp(buffer)
      .resize(2048, 2048, {
        fit: 'inside',           // Preserve aspect ratio, fit within bounds
        withoutEnlargement: true, // Don't upscale small images
      })
      .webp({
        quality: 92,             // High quality for blog display
        effort: 6,               // Higher compression effort for better quality/size
      })
      .toBuffer();

    // Generate thumbnail (400px max, preserves aspect ratio)
    const thumbBuffer = await sharp(buffer)
      .resize(400, 400, {
        fit: 'inside',           // Preserve aspect ratio
        withoutEnlargement: true,
      })
      .webp({
        quality: 85,             // Good quality for thumbnails
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
