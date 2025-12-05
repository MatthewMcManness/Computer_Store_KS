import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables not configured. Blog features will be disabled.'
  );
}

/**
 * Public Supabase client (uses anon key)
 * Use this for public read operations
 */
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Admin Supabase client (uses service role key)
 * Use this for admin operations that bypass RLS
 * ONLY use on server-side (API routes, server components)
 */
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

/**
 * Check if admin Supabase is configured (for write operations)
 */
export function isSupabaseAdminConfigured(): boolean {
  return !!(supabaseUrl && supabaseServiceKey);
}

// =============================================================================
// Type Definitions
// =============================================================================

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  category_id: string | null;
  author_name: string;
  author_email: string | null;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  category?: BlogCategory | null;
  tags?: BlogTag[];
}

export interface CreateBlogPostInput {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image_url?: string;
  category_id?: string;
  author_name: string;
  author_email?: string;
  status?: 'draft' | 'published' | 'archived';
  published_at?: string;
  tag_ids?: string[];
}

export interface UpdateBlogPostInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featured_image_url?: string;
  category_id?: string | null;
  author_name?: string;
  author_email?: string;
  status?: 'draft' | 'published' | 'archived';
  published_at?: string | null;
  tag_ids?: string[];
}

// =============================================================================
// Blog Post Functions (Public)
// =============================================================================

/**
 * Get all published blog posts
 */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching published posts:', error);
    return [];
  }

  // Fetch tags for each post
  const postsWithTags = await Promise.all(
    (data || []).map(async (post) => {
      const tags = await getPostTags(post.id);
      return { ...post, tags };
    })
  );

  return postsWithTags;
}

/**
 * Get a single published post by slug
 */
export async function getPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('Error fetching post by slug:', error);
    return null;
  }

  // Fetch tags
  const tags = await getPostTags(data.id);
  return { ...data, tags };
}

/**
 * Get tags for a post
 */
async function getPostTags(postId: string): Promise<BlogTag[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('blog_post_tags')
    .select('tag_id, blog_tags(*)')
    .eq('post_id', postId);

  if (error) {
    console.error('Error fetching post tags:', error);
    return [];
  }

  return (data || []).map((item) => item.blog_tags).filter(Boolean).flat() as BlogTag[];
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<BlogCategory[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all tags
 */
export async function getTags(): Promise<BlogTag[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('blog_tags')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  return data || [];
}

/**
 * Get posts by category
 */
export async function getPostsByCategory(categorySlug: string): Promise<BlogPost[]> {
  if (!supabase) return [];

  const { data: category } = await supabase
    .from('blog_categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (!category) return [];

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*)
    `)
    .eq('category_id', category.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts by category:', error);
    return [];
  }

  return data || [];
}

/**
 * Get posts by tag
 */
export async function getPostsByTag(tagSlug: string): Promise<BlogPost[]> {
  if (!supabase) return [];

  const { data: tag } = await supabase
    .from('blog_tags')
    .select('id')
    .eq('slug', tagSlug)
    .single();

  if (!tag) return [];

  const { data: postTags } = await supabase
    .from('blog_post_tags')
    .select('post_id')
    .eq('tag_id', tag.id);

  if (!postTags || postTags.length === 0) return [];

  const postIds = postTags.map((pt) => pt.post_id);

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*)
    `)
    .in('id', postIds)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts by tag:', error);
    return [];
  }

  return data || [];
}

// =============================================================================
// Blog Post Functions (Admin)
// =============================================================================

/**
 * Get all blog posts (including drafts) - Admin only
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all posts:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single post by ID - Admin only
 */
export async function getPostById(id: string): Promise<BlogPost | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching post by ID:', error);
    return null;
  }

  // Fetch tags using admin client
  const { data: tagData } = await supabaseAdmin
    .from('blog_post_tags')
    .select('tag_id, blog_tags(*)')
    .eq('post_id', data.id);

  const tags = (tagData || []).map((item) => item.blog_tags).filter(Boolean).flat() as BlogTag[];
  return { ...data, tags };
}

/**
 * Create a new blog post - Admin only
 */
export async function createPost(input: CreateBlogPostInput): Promise<BlogPost | null> {
  if (!supabaseAdmin) return null;

  const { tag_ids, ...postData } = input;

  // Set published_at if status is published and not already set
  if (postData.status === 'published' && !postData.published_at) {
    postData.published_at = new Date().toISOString();
  }

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .insert(postData)
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    return null;
  }

  // Add tags if provided
  if (tag_ids && tag_ids.length > 0) {
    await supabaseAdmin
      .from('blog_post_tags')
      .insert(tag_ids.map((tagId) => ({ post_id: data.id, tag_id: tagId })));
  }

  return data;
}

/**
 * Update a blog post - Admin only
 */
export async function updatePost(id: string, input: UpdateBlogPostInput): Promise<BlogPost | null> {
  if (!supabaseAdmin) return null;

  const { tag_ids, ...postData } = input;

  // Set published_at if changing to published and not already set
  if (postData.status === 'published' && !postData.published_at) {
    const { data: existing } = await supabaseAdmin
      .from('blog_posts')
      .select('published_at')
      .eq('id', id)
      .single();

    if (!existing?.published_at) {
      postData.published_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .update(postData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating post:', error);
    return null;
  }

  // Update tags if provided
  if (tag_ids !== undefined) {
    // Remove existing tags
    await supabaseAdmin
      .from('blog_post_tags')
      .delete()
      .eq('post_id', id);

    // Add new tags
    if (tag_ids.length > 0) {
      await supabaseAdmin
        .from('blog_post_tags')
        .insert(tag_ids.map((tagId) => ({ post_id: id, tag_id: tagId })));
    }
  }

  return data;
}

/**
 * Delete a blog post - Admin only
 */
export async function deletePost(id: string): Promise<boolean> {
  if (!supabaseAdmin) return false;

  const { error } = await supabaseAdmin
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting post:', error);
    return false;
  }

  return true;
}

/**
 * Generate a unique slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

/**
 * Check if a slug is available
 */
export async function isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  if (!supabaseAdmin) return false;

  let query = supabaseAdmin
    .from('blog_posts')
    .select('id')
    .eq('slug', slug);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data } = await query;
  return !data || data.length === 0;
}
