import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { uploadImageToGitHub, isGitHubConfigured } from '@/lib/github';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

// Local gallery directory for development
const LOCAL_GALLERY_DIR = path.join(process.cwd(), 'public/assets/gallery');

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

// POST /api/gallery/upload - Upload image with thumbnail generation
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

    // Save locally for development
    if (process.env.NODE_ENV === 'development' || !isGitHubConfigured()) {
      await fs.mkdir(LOCAL_GALLERY_DIR, { recursive: true });

      // Save full-size image
      const fullPath = path.join(LOCAL_GALLERY_DIR, fullFilename);
      await fs.writeFile(fullPath, fullBuffer);

      // Save thumbnail
      const thumbPath = path.join(LOCAL_GALLERY_DIR, thumbFilename);
      await fs.writeFile(thumbPath, thumbBuffer);

      return NextResponse.json({
        success: true,
        filename: fullFilename,
        path: `/assets/gallery/${fullFilename}`,
        url: `/assets/gallery/${fullFilename}`,
        thumbnailUrl: `/assets/gallery/${thumbFilename}`,
        thumbnailPath: `/assets/gallery/${thumbFilename}`,
      });
    }

    // Upload both images to GitHub
    const [fullResult, thumbResult] = await Promise.all([
      uploadImageToGitHub(
        fullFilename,
        fullBuffer,
        `Add gallery image: ${fullFilename}`
      ),
      uploadImageToGitHub(
        thumbFilename,
        thumbBuffer,
        `Add gallery thumbnail: ${thumbFilename}`
      ),
    ]);

    return NextResponse.json({
      success: true,
      filename: fullFilename,
      path: fullResult.path,
      url: `/assets/gallery/${fullFilename}`,
      thumbnailUrl: `/assets/gallery/${thumbFilename}`,
      thumbnailPath: thumbResult.path,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
