import { NextResponse } from 'next/server';
import { fetchPosts, isGoogleBusinessConfigured } from '@/lib/google-business';

// GET /api/google-business/posts - Get Google Business posts/updates
export async function GET() {
  try {
    if (!isGoogleBusinessConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Google Business Profile not configured',
      }, { status: 503 });
    }

    const posts = await fetchPosts();

    return NextResponse.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch posts',
      },
      { status: 500 }
    );
  }
}
