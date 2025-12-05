import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import {
  getPostById,
  getPublishedPostBySlug,
  updatePost,
  deletePost,
  isSlugAvailable,
  isSupabaseConfigured,
  isSupabaseAdminConfigured,
  type UpdateBlogPostInput,
} from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/blog/[id]
 * Get a single blog post by ID or slug
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Blog is not configured' },
      { status: 503 }
    );
  }

  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const isAdminRequest = searchParams.get('admin') === 'true';

  // Admin request - get by ID (includes drafts)
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

    const post = await getPostById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
  }

  // Public request - try to get by slug first, then by ID
  // UUID format check
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (!isUUID) {
    // Treat as slug
    const post = await getPublishedPostBySlug(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ post });
  }

  // It's a UUID - for public, we don't expose by ID, only by slug
  return NextResponse.json({ error: 'Post not found' }, { status: 404 });
}

/**
 * PUT /api/blog/[id]
 * Update a blog post (admin only)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

  const { id } = await params;

  try {
    const body = await request.json();

    // If slug is being changed, verify it's available
    if (body.slug) {
      const slugAvailable = await isSlugAvailable(body.slug, id);
      if (!slugAvailable) {
        return NextResponse.json(
          { error: 'Slug is already in use' },
          { status: 400 }
        );
      }
    }

    const updateData: UpdateBlogPostInput = {};

    // Only include fields that are provided
    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.featured_image_url !== undefined) updateData.featured_image_url = body.featured_image_url;
    if (body.category_id !== undefined) updateData.category_id = body.category_id;
    if (body.author_name !== undefined) updateData.author_name = body.author_name;
    if (body.author_email !== undefined) updateData.author_email = body.author_email;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.published_at !== undefined) updateData.published_at = body.published_at;
    if (body.tag_ids !== undefined) updateData.tag_ids = body.tag_ids;

    const post = await updatePost(id, updateData);

    if (!post) {
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/blog/[id]
 * Delete a blog post (admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

  const { id } = await params;

  const success = await deletePost(id);

  if (!success) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
