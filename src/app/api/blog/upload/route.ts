import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { uploadImageToGitHub, isGitHubConfigured } from '@/lib/github';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

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

// Local blog images directory for development
const LOCAL_BLOG_DIR = path.join(process.cwd(), 'public/assets/blog');

/**
 * POST /api/blog/upload
 * Upload an image for blog posts
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

    // Save locally for development or if GitHub not configured
    if (process.env.NODE_ENV === 'development' || !isGitHubConfigured()) {
      await fs.mkdir(LOCAL_BLOG_DIR, { recursive: true });

      const fullPath = path.join(LOCAL_BLOG_DIR, fullFilename);
      const thumbPath = path.join(LOCAL_BLOG_DIR, thumbFilename);

      await Promise.all([
        fs.writeFile(fullPath, fullBuffer),
        fs.writeFile(thumbPath, thumbBuffer),
      ]);

      return NextResponse.json({
        success: true,
        filename: fullFilename,
        url: `/assets/blog/${fullFilename}`,
        thumbnailUrl: `/assets/blog/${thumbFilename}`,
        thumbnailFilename: thumbFilename,
      });
    }

    // Upload both images to GitHub in parallel
    await Promise.all([
      uploadImageToGitHub(
        fullFilename,
        fullBuffer,
        `Add blog image: ${fullFilename}`,
        'public/assets/blog'
      ),
      uploadImageToGitHub(
        thumbFilename,
        thumbBuffer,
        `Add blog thumbnail: ${thumbFilename}`,
        'public/assets/blog'
      ),
    ]);

    return NextResponse.json({
      success: true,
      filename: fullFilename,
      url: `/assets/blog/${fullFilename}`,
      thumbnailUrl: `/assets/blog/${thumbFilename}`,
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
