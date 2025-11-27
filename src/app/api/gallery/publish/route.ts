import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import {
  getGalleryData,
  saveGalleryData,
  updateFileOnGitHub,
  getFileFromGitHub,
  isGitHubConfigured,
  generateGalleryHTML,
} from '@/lib/github';

// POST /api/gallery/publish - Publish changes to GitHub
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

    // Check GitHub configuration
    if (!isGitHubConfigured()) {
      return NextResponse.json(
        { success: false, error: 'GitHub is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { commitMessage } = body;

    // Get gallery data
    const galleryData = await getGalleryData();

    // Save gallery JSON data
    await saveGalleryData(galleryData, commitMessage || 'Update gallery data');

    // Get current index.html
    const indexHtml = await getFileFromGitHub('index.html');

    // Parse HTML and update gallery grid
    const galleryHTML = generateGalleryHTML(galleryData.computers);

    // Find and replace gallery grid content
    const galleryGridRegex = /(<div[^>]*id="gallery-grid"[^>]*>)([\s\S]*?)(<\/div>)/i;
    const updatedHtml = indexHtml.replace(
      galleryGridRegex,
      `$1\n${galleryHTML}\n      $3`
    );

    // Update index.html on GitHub
    const result = await updateFileOnGitHub(
      'index.html',
      updatedHtml,
      commitMessage || 'Update gallery via admin panel'
    );

    return NextResponse.json({
      success: true,
      message: 'Changes published successfully! Website will update in 2-3 minutes.',
      commitSha: result.sha,
      commitUrl: result.url,
    });
  } catch (error) {
    console.error('Error publishing changes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to publish changes',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
