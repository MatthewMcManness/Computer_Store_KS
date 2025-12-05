import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { uploadImageToGitHub, isGitHubConfigured } from '@/lib/github';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

// Next.js App Router route segment config
export const maxDuration = 60; // 60 seconds timeout for large uploads
export const dynamic = 'force-dynamic';

// Local blog images directory for development
const LOCAL_BLOG_DIR = path.join(process.cwd(), 'public/assets/blog');

/**
 * POST /api/blog/upload
 * Upload an image for blog posts
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
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
      return NextResponse.json(
        { success: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Image must be less than 10MB' },
        { status: 400 }
      );
    }

    // Get file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Optimize image with Sharp
    const optimizedBuffer = await sharp(buffer)
      .resize(1200, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 85,
        progressive: true,
      })
      .toBuffer();

    // Generate filename
    const timestamp = Date.now();
    const filename = `blog-${timestamp}.jpg`;

    // Save locally for development
    if (process.env.NODE_ENV === 'development' || !isGitHubConfigured()) {
      await fs.mkdir(LOCAL_BLOG_DIR, { recursive: true });
      const localPath = path.join(LOCAL_BLOG_DIR, filename);
      await fs.writeFile(localPath, optimizedBuffer);

      return NextResponse.json({
        success: true,
        filename,
        url: `/assets/blog/${filename}`,
      });
    }

    // Upload to GitHub
    const result = await uploadImageToGitHub(
      filename,
      optimizedBuffer,
      `Add blog image: ${filename}`,
      'public/assets/blog'
    );

    return NextResponse.json({
      success: true,
      filename,
      url: `/assets/blog/${filename}`,
    });
  } catch (error) {
    console.error('Error uploading blog image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
