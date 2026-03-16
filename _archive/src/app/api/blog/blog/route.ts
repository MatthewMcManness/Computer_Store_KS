import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';
import {
  getPublishedPosts,
  getAllPosts,
  createPost,
  getCategories,
  getTags,
  generateSlug,
  isSlugAvailable,
  isSupabaseConfigured,
  isSupabaseAdminConfigured,
  type CreateBlogPostInput,
} from '@/lib/supabase';

/**
 * GET /api/blog
 * Public: Get published posts
 * Admin: Get all posts (with ?admin=true query param)
 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Blog is not configured. Please set up Supabase.' },
      { status: 503 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const isAdminRequest = searchParams.get('admin') === 'true';
  const includeMetadata = searchParams.get('metadata') === 'true';

  // Check if this is an admin request
  if (isAdminRequest) {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json(
        { error: 'Admin access not configured' },
        { status: 503 }
      );
    }

    const posts = await getAllPosts();

    if (includeMetadata) {
      const categories = await getCategories();
      const tags = await getTags();
      return NextResponse.json({ posts, categories, tags });
    }

    return NextResponse.json({ posts });
  }

  // Public request - only published posts
  const posts = await getPublishedPosts();

  if (includeMetadata) {
    const categories = await getCategories();
    const tags = await getTags();
    return NextResponse.json({ posts, categories, tags });
  }

  return NextResponse.json({ posts });
}

/**
 * POST /api/blog
 * Create a new blog post (admin only)
 */
export async function POST(request: NextRequest) {
  // Check authentication
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: 'Blog admin is not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const user = await getCurrentUser();

    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    let slug = body.slug || generateSlug(body.title);

    // Check if slug is available
    if (!(await isSlugAvailable(slug))) {
      // Append timestamp to make unique
      slug = `${slug}-${Date.now()}`;
    }

    const postData: CreateBlogPostInput = {
      title: body.title,
      slug,
      excerpt: body.excerpt || null,
      content: body.content,
      featured_image_url: body.featured_image_url || null,
      featured_image_thumbnail: body.featured_image_thumbnail || null,
      category_id: body.category_id || null,
      author_name: user?.name || body.author_name || 'Unknown',
      author_email: user?.email || body.author_email || null,
      status: body.status || 'draft',
      tag_ids: body.tag_ids || [],
    };

    const post = await createPost(postData);

    if (!post) {
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      );
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
