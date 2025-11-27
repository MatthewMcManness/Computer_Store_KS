import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { uploadImageToGitHub, isGitHubConfigured } from '@/lib/github';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

// Local gallery directory for development
const LOCAL_GALLERY_DIR = path.join(process.cwd(), 'public/assets/gallery');

// POST /api/gallery/upload - Upload image
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
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      return NextResponse.json(
        { success: false, error: 'Only JPEG and PNG images are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Image must be less than 5MB' },
        { status: 400 }
      );
    }

    // Get file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Optimize image with Sharp
    const optimizedBuffer = await sharp(buffer)
      .resize(1200, 900, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({
        quality: 85,
        progressive: true,
      })
      .toBuffer();

    // Generate filename
    const timestamp = Date.now();
    const filename = `${type}-${timestamp}.jpg`;

    // Save locally for development
    if (process.env.NODE_ENV === 'development' || !isGitHubConfigured()) {
      await fs.mkdir(LOCAL_GALLERY_DIR, { recursive: true });
      const localPath = path.join(LOCAL_GALLERY_DIR, filename);
      await fs.writeFile(localPath, optimizedBuffer);

      return NextResponse.json({
        success: true,
        filename,
        path: `/assets/gallery/${filename}`,
        url: `/assets/gallery/${filename}`,
      });
    }

    // Upload to GitHub
    const result = await uploadImageToGitHub(
      filename,
      optimizedBuffer,
      `Add gallery image: ${filename}`
    );

    return NextResponse.json({
      success: true,
      filename,
      path: result.path,
      url: `/assets/gallery/${filename}`,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
