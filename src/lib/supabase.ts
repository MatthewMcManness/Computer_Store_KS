import { createClient } from '@supabase/supabase-js';
import { getProtectionPlanTier as extractPlanTierFromRepairShoprData } from './repairshopr';

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

/**
 * Create a fresh admin client instance
 * Use this when you need to ensure service_role context isn't affected by previous auth operations
 * ONLY use on server-side (API routes, server components)
 */
export function createFreshAdminClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
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
  featured_image_thumbnail: string | null;
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
  featured_image_thumbnail?: string;
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
  featured_image_thumbnail?: string | null;
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
    .maybeSingle();

  if (error) {
    // Only log actual errors, not "not found" cases
    console.error('Error fetching post by slug:', error);
    return null;
  }

  // No post found with this slug (expected for invalid slugs)
  if (!data) {
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

// =============================================================================
// Gallery Type Definitions
// =============================================================================

export interface GallerySpec {
  label: string;
  value: string;
}

export interface BlackFridayData {
  enabled: boolean;
  originalPrice: string;
  salePrice: string;
  discount: number;
  originalPartsWarranty?: string;
  originalFreeDiagnostics?: string;
}

export interface GalleryComputerDB {
  id: string;
  name: string;
  type: 'desktop' | 'laptop';
  category: 'refurbished' | 'custom' | 'new';
  price: number;
  image_url: string | null;
  thumbnail_url: string | null;
  specs: GallerySpec[];
  is_active: boolean;
  sort_order: number;
  stock_quantity: number;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GalleryComputer {
  id: string;
  name: string;
  type: 'desktop' | 'laptop';
  category: 'refurbished' | 'custom' | 'new';
  price: string;
  image: string;
  specs: GallerySpec[];
  blackFriday?: BlackFridayData;
  created_at?: string;
  updated_at?: string;
}

export interface GallerySale {
  id: string;
  sale_type: string;
  name: string;
  discount_percent: number;
  applies_to: string[];
  is_active: boolean;
  created_at: string;
}

export interface CreateComputerInput {
  name: string;
  type: 'desktop' | 'laptop';
  category: 'refurbished' | 'custom' | 'new';
  price: number;
  image_url?: string;
  specs?: GallerySpec[];
  sort_order?: number;
}

export interface UpdateComputerInput {
  name?: string;
  type?: 'desktop' | 'laptop';
  category?: 'refurbished' | 'custom' | 'new';
  price?: number;
  image_url?: string;
  specs?: GallerySpec[];
  is_active?: boolean;
  sort_order?: number;
}

// =============================================================================
// Gallery Helper Functions
// =============================================================================

/**
 * Format price number to string (e.g., 850 -> "$850.00")
 */
function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

/**
 * Parse price string to number (e.g., "$850.00" -> 850)
 */
export function parsePrice(price: string): number {
  return parseFloat(price.replace(/[$,]/g, '')) || 0;
}

/**
 * Apply sale pricing to a computer if eligible
 */
function applySalePricing(
  computer: GalleryComputerDB,
  activeSale: GallerySale | null
): GalleryComputer {
  const baseComputer: GalleryComputer = {
    id: computer.id,
    name: computer.name,
    type: computer.type,
    category: computer.category,
    price: formatPrice(computer.price),
    image: computer.image_url || '',
    thumbnail: computer.thumbnail_url || undefined,
    specs: computer.specs || [],
    stockQuantity: computer.stock_quantity ?? 1,
    isActive: computer.is_active,
    archivedAt: computer.archived_at || undefined,
    created_at: computer.created_at,
    updated_at: computer.updated_at,
  };

  // Check if sale applies to this computer
  if (
    activeSale &&
    activeSale.sale_type !== 'none' &&
    activeSale.discount_percent > 0 &&
    activeSale.applies_to.includes(computer.category)
  ) {
    const originalPrice = computer.price;
    const salePrice = originalPrice * (1 - activeSale.discount_percent / 100);

    baseComputer.blackFriday = {
      enabled: true,
      originalPrice: formatPrice(originalPrice),
      salePrice: formatPrice(salePrice),
      discount: activeSale.discount_percent,
    };
  }

  return baseComputer;
}

// =============================================================================
// Gallery Functions (Public)
// =============================================================================

/**
 * Get the currently active sale
 */
export async function getActiveSale(): Promise<GallerySale | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('gallery_sales')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error) {
    // No active sale or error - return null
    return null;
  }

  return data;
}

/**
 * Get all available sales
 */
export async function getAvailableSales(): Promise<GallerySale[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('gallery_sales')
    .select('*')
    .order('sale_type');

  if (error) {
    console.error('Error fetching available sales:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all active computers with sale pricing applied (Public)
 */
export async function getComputers(): Promise<GalleryComputer[]> {
  if (!supabase) return [];

  // Get active sale first
  const activeSale = await getActiveSale();

  const { data, error } = await supabase
    .from('gallery_computers')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching computers:', error);
    return [];
  }

  // Apply sale pricing to each computer
  return (data || []).map((computer) => applySalePricing(computer, activeSale));
}

/**
 * Get a single computer by ID (Public)
 */
export async function getComputerById(id: string): Promise<GalleryComputer | null> {
  if (!supabase) return null;

  // Get active sale first
  const activeSale = await getActiveSale();

  const { data, error } = await supabase
    .from('gallery_computers')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching computer by ID:', error);
    return null;
  }

  return applySalePricing(data, activeSale);
}

// =============================================================================
// Gallery Functions (Admin)
// =============================================================================

/**
 * Get all computers including inactive (Admin)
 */
export async function getAllComputers(options: { includeInactive?: boolean } = {}): Promise<GalleryComputer[]> {
  if (!supabaseAdmin) return [];

  const { includeInactive = false } = options;

  // Get active sale first
  const activeSale = await getActiveSaleAdmin();

  let query = supabaseAdmin
    .from('gallery_computers')
    .select('*');

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query
    .order('sort_order')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all computers:', error);
    return [];
  }

  return (data || []).map((computer) => applySalePricing(computer, activeSale));
}

/**
 * Get active sale (Admin - bypasses RLS)
 */
export async function getActiveSaleAdmin(): Promise<GallerySale | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('gallery_sales')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error) {
    return null;
  }

  return data;
}

/**
 * Get a single computer by ID including inactive (Admin)
 */
export async function getComputerByIdAdmin(id: string): Promise<GalleryComputer | null> {
  if (!supabaseAdmin) return null;

  const activeSale = await getActiveSaleAdmin();

  const { data, error } = await supabaseAdmin
    .from('gallery_computers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching computer by ID (admin):', error);
    return null;
  }

  return applySalePricing(data, activeSale);
}

/**
 * Create a new computer (Admin)
 */
export async function createComputer(input: CreateComputerInput): Promise<GalleryComputer | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('gallery_computers')
    .insert({
      name: input.name,
      type: input.type,
      category: input.category,
      price: input.price,
      image_url: input.image_url || null,
      thumbnail_url: input.thumbnail_url || null,
      specs: input.specs || [],
      sort_order: input.sort_order || 0,
      stock_quantity: input.stock_quantity ?? 1,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating computer:', error);
    return null;
  }

  const activeSale = await getActiveSaleAdmin();
  return applySalePricing(data, activeSale);
}

/**
 * Update a computer (Admin)
 */
export async function updateComputer(
  id: string,
  input: UpdateComputerInput
): Promise<GalleryComputer | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('gallery_computers')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating computer:', error);
    return null;
  }

  const activeSale = await getActiveSaleAdmin();
  return applySalePricing(data, activeSale);
}

/**
 * Delete a computer (soft delete - sets is_active to false) (Admin)
 *
 * Sets is_active to false and records the archived_at timestamp.
 *
 * @param id - UUID of the computer to archive
 * @returns true if successful, false otherwise
 *
 * @sideEffects
 * - Updates is_active to false in database
 * - Sets archived_at timestamp
 *
 * @functions_called supabaseAdmin.from
 * @called_by DELETE /api/gallery/[id]
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 * @version 1.1.0 - 2026-01-15T00:00:00Z - Added archived_at timestamp
 */
export async function deleteComputer(id: string): Promise<boolean> {
  if (!supabaseAdmin) return false;

  const { error } = await supabaseAdmin
    .from('gallery_computers')
    .update({
      is_active: false,
      archived_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error deleting computer:', error);
    return false;
  }

  return true;
}

/**
 * Permanently delete a computer (Admin)
 */
export async function hardDeleteComputer(id: string): Promise<boolean> {
  if (!supabaseAdmin) return false;

  const { error } = await supabaseAdmin
    .from('gallery_computers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error hard deleting computer:', error);
    return false;
  }

  return true;
}

/**
 * Update stock quantity for a computer (Admin)
 *
 * Adjusts the stock quantity by the specified delta. Ensures stock
 * cannot go below 0.
 *
 * @param id - UUID of the computer to update
 * @param delta - Amount to adjust stock by (positive or negative)
 * @returns Updated computer or null on error
 *
 * @throws Will not allow stock to go below 0
 *
 * @sideEffects
 * - Updates stock_quantity in database
 *
 * @functions_called supabaseAdmin.from, getComputerByIdAdmin
 * @called_by PATCH /api/gallery/[id]/stock
 *
 * @version 1.0.0 - 2026-01-15T00:00:00Z - Initial implementation
 */
export async function updateStockQuantity(
  id: string,
  delta: number
): Promise<GalleryComputer | null> {
  if (!supabaseAdmin) return null;

  // First get current stock
  const current = await getComputerByIdAdmin(id);
  if (!current) return null;

  const newStock = Math.max(0, current.stockQuantity + delta);

  const { data, error } = await supabaseAdmin
    .from('gallery_computers')
    .update({ stock_quantity: newStock })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating stock quantity:', error);
    return null;
  }

  const activeSale = await getActiveSaleAdmin();
  return applySalePricing(data, activeSale);
}

/**
 * Get all archived (soft-deleted) computers (Admin)
 *
 * Returns computers where is_active = false, ordered by archived_at date.
 *
 * @returns Array of archived computers
 *
 * @functions_called supabaseAdmin.from, applySalePricing
 * @called_by GET /api/gallery/archived
 *
 * @version 1.0.0 - 2026-01-15T00:00:00Z - Initial implementation
 */
export async function getArchivedComputers(): Promise<GalleryComputer[]> {
  if (!supabaseAdmin) return [];

  const activeSale = await getActiveSaleAdmin();

  const { data, error } = await supabaseAdmin
    .from('gallery_computers')
    .select('*')
    .eq('is_active', false)
    .order('archived_at', { ascending: false });

  if (error) {
    console.error('Error fetching archived computers:', error);
    return [];
  }

  return (data || []).map((computer) => applySalePricing(computer, activeSale));
}

/**
 * Restore an archived computer (Admin)
 *
 * Sets is_active to true and clears the archived_at timestamp.
 *
 * @param id - UUID of the computer to restore
 * @returns Restored computer or null on error
 *
 * @sideEffects
 * - Updates is_active to true in database
 * - Clears archived_at timestamp
 *
 * @functions_called supabaseAdmin.from, applySalePricing
 * @called_by POST /api/gallery/[id]/restore
 *
 * @version 1.0.0 - 2026-01-15T00:00:00Z - Initial implementation
 */
export async function restoreComputer(id: string): Promise<GalleryComputer | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('gallery_computers')
    .update({
      is_active: true,
      archived_at: null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error restoring computer:', error);
    return null;
  }

  const activeSale = await getActiveSaleAdmin();
  return applySalePricing(data, activeSale);
}

/**
 * Set the active sale (Admin)
 * Deactivates all other sales and activates the specified one
 */
export async function setActiveSale(saleType: string): Promise<GallerySale | null> {
  if (!supabaseAdmin) return null;

  // Deactivate all sales first
  await supabaseAdmin
    .from('gallery_sales')
    .update({ is_active: false })
    .neq('sale_type', '');

  // Activate the specified sale
  const { data, error } = await supabaseAdmin
    .from('gallery_sales')
    .update({ is_active: true })
    .eq('sale_type', saleType)
    .select()
    .single();

  if (error) {
    console.error('Error setting active sale:', error);
    return null;
  }

  return data;
}

/**
 * Get all available sales (Admin)
 */
export async function getAvailableSalesAdmin(): Promise<GallerySale[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('gallery_sales')
    .select('*')
    .order('sale_type');

  if (error) {
    console.error('Error fetching available sales (admin):', error);
    return [];
  }

  return data || [];
}

// =============================================================================
// Ticket Public Notes Type Definitions
// =============================================================================

export interface TicketPublicNote {
  id: string;
  repairshopr_ticket_id: number;
  repairshopr_customer_id: number;
  author_name: string;
  author_email: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTicketPublicNoteInput {
  repairshopr_ticket_id: number;
  repairshopr_customer_id: number;
  author_name: string;
  author_email?: string;
  content: string;
}

// =============================================================================
// Ticket Public Notes Functions (Admin)
// =============================================================================

/**
 * Get all public notes for a ticket (Admin)
 */
export async function getTicketPublicNotes(ticketId: number): Promise<TicketPublicNote[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('ticket_public_notes')
    .select('*')
    .eq('repairshopr_ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching ticket public notes:', error);
    return [];
  }

  return data || [];
}

/**
 * Create a public note for a ticket (Admin)
 */
export async function createTicketPublicNote(
  input: CreateTicketPublicNoteInput
): Promise<TicketPublicNote | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('ticket_public_notes')
    .insert({
      repairshopr_ticket_id: input.repairshopr_ticket_id,
      repairshopr_customer_id: input.repairshopr_customer_id,
      author_name: input.author_name,
      author_email: input.author_email || null,
      content: input.content,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating ticket public note:', error);
    return null;
  }

  return data;
}

/**
 * Delete a public note (Admin)
 */
export async function deleteTicketPublicNote(noteId: string): Promise<boolean> {
  if (!supabaseAdmin) return false;

  const { error } = await supabaseAdmin
    .from('ticket_public_notes')
    .delete()
    .eq('id', noteId);

  if (error) {
    console.error('Error deleting ticket public note:', error);
    return false;
  }

  return true;
}

// =============================================================================
// Ticket Public Notes Functions (Customer Portal)
// =============================================================================

/**
 * Get public notes for tickets owned by a customer (Customer Portal)
 */
export async function getCustomerTicketPublicNotes(
  customerId: number,
  ticketId?: number
): Promise<TicketPublicNote[]> {
  if (!supabase) return [];

  let query = supabase
    .from('ticket_public_notes')
    .select('*')
    .eq('repairshopr_customer_id', customerId)
    .order('created_at', { ascending: true });

  if (ticketId) {
    query = query.eq('repairshopr_ticket_id', ticketId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching customer ticket public notes:', error);
    return [];
  }

  return data || [];
}

// =============================================================================
// Ticket Custom Status Types and Functions
// =============================================================================

export type TicketCustomStatus =
  | 'rework'
  | 'new'
  | 'diagnosing'
  | 'repairing'
  | 'data_transferring'
  | 'installing'
  | 'waiting_for_parts'
  | 'building'
  | 'call_customer'
  | 'waiting_for_customer_reply'
  | 'on_hold'
  | 'ready_for_pickup_no_payment_due'
  | 'ready_for_pickup_payment_due'
  | 'completed'
  | 'deprecated_rs_status';

export interface TicketStatusOverride {
  id: string;
  repairshopr_ticket_id: number;
  custom_status: TicketCustomStatus;
  customer_question: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketStatusDefinition {
  status: TicketCustomStatus;
  display_name: string;
  description: string | null;
  repairshopr_status: string;
  show_customer_question: boolean;
  customer_visible_status: string | null;
  sort_order: number;
  is_active: boolean;
}

// Static status definitions (used when DB not available or for quick lookups)
export const TICKET_STATUS_DEFINITIONS: TicketStatusDefinition[] = [
  { status: 'rework', display_name: 'Rework', description: 'Needs rework - highest priority', repairshopr_status: 'Rework', show_customer_question: false, customer_visible_status: 'Being Repaired', sort_order: 0, is_active: true },
  { status: 'new', display_name: 'New', description: 'Ticket just created', repairshopr_status: 'New', show_customer_question: false, customer_visible_status: 'Received', sort_order: 1, is_active: true },
  { status: 'diagnosing', display_name: 'Diagnosing', description: 'Diagnosing the issue', repairshopr_status: 'In Progress', show_customer_question: false, customer_visible_status: 'Being Diagnosed', sort_order: 2, is_active: true },
  { status: 'repairing', display_name: 'Repairing', description: 'Repair in progress', repairshopr_status: 'In Progress', show_customer_question: false, customer_visible_status: 'Being Repaired', sort_order: 3, is_active: true },
  { status: 'data_transferring', display_name: 'Data Transferring', description: 'Transferring data', repairshopr_status: 'In Progress', show_customer_question: false, customer_visible_status: 'Data Transfer in Progress', sort_order: 4, is_active: true },
  { status: 'installing', display_name: 'Installing', description: 'Installing software/components', repairshopr_status: 'In Progress', show_customer_question: false, customer_visible_status: 'Installation in Progress', sort_order: 5, is_active: true },
  { status: 'waiting_for_parts', display_name: 'Waiting for Parts', description: 'Waiting for parts', repairshopr_status: 'Waiting for Parts', show_customer_question: false, customer_visible_status: 'Waiting for Parts', sort_order: 6, is_active: true },
  { status: 'building', display_name: 'Building', description: 'Building custom system', repairshopr_status: 'In Progress', show_customer_question: false, customer_visible_status: 'Being Built', sort_order: 7, is_active: true },
  { status: 'call_customer', display_name: 'Call Customer', description: 'Need to call customer', repairshopr_status: 'CNC', show_customer_question: true, customer_visible_status: 'We Have a Question', sort_order: 8, is_active: true },
  { status: 'waiting_for_customer_reply', display_name: 'Waiting for Customer Reply', description: 'Waiting for response', repairshopr_status: 'Customer Reply', show_customer_question: true, customer_visible_status: 'Awaiting Your Response', sort_order: 9, is_active: true },
  { status: 'on_hold', display_name: 'On Hold', description: 'Ticket on hold waiting for customer', repairshopr_status: 'Waiting on Customer', show_customer_question: false, customer_visible_status: 'On Hold', sort_order: 10, is_active: true },
  { status: 'ready_for_pickup_no_payment_due', display_name: 'Ready for Pickup (No Payment Due)', description: 'On done shelf, no payment required', repairshopr_status: 'Done Shelf', show_customer_question: false, customer_visible_status: 'Ready for Pickup', sort_order: 11, is_active: true },
  { status: 'ready_for_pickup_payment_due', display_name: 'Ready for Pickup (Payment Due)', description: 'On done shelf, payment required', repairshopr_status: 'Done Shelf', show_customer_question: false, customer_visible_status: 'Ready for Pickup - Payment Due', sort_order: 12, is_active: true },
  { status: 'completed', display_name: 'Completed', description: 'Fully resolved', repairshopr_status: 'Resolved', show_customer_question: false, customer_visible_status: 'Completed', sort_order: 13, is_active: true },
  { status: 'deprecated_rs_status', display_name: 'Stop Using RepairShopr!', description: 'Ticket set to deprecated RS status - needs correction', repairshopr_status: 'DEPRECATED', show_customer_question: false, customer_visible_status: 'Being Processed', sort_order: 99, is_active: false },
];

/**
 * Get all ticket status definitions
 */
export async function getTicketStatusDefinitions(): Promise<TicketStatusDefinition[]> {
  if (!supabase) return TICKET_STATUS_DEFINITIONS;

  const { data, error } = await supabase
    .from('ticket_status_definitions')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching ticket status definitions:', error);
    return TICKET_STATUS_DEFINITIONS;
  }

  return data || TICKET_STATUS_DEFINITIONS;
}

/**
 * Get ticket status override for a specific ticket
 */
export async function getTicketStatusOverride(
  ticketId: number
): Promise<TicketStatusOverride | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('ticket_status_overrides')
    .select('*')
    .eq('repairshopr_ticket_id', ticketId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching ticket status override:', error);
    return null;
  }

  return data;
}

/**
 * Get ticket status overrides for multiple tickets
 */
export async function getTicketStatusOverrides(
  ticketIds: number[]
): Promise<TicketStatusOverride[]> {
  if (!supabaseAdmin || ticketIds.length === 0) return [];

  const { data, error } = await supabaseAdmin
    .from('ticket_status_overrides')
    .select('*')
    .in('repairshopr_ticket_id', ticketIds);

  if (error) {
    console.error('Error fetching ticket status overrides:', error);
    return [];
  }

  return data || [];
}

/**
 * Set or update ticket status override
 */
export async function setTicketStatusOverride(
  ticketId: number,
  customStatus: TicketCustomStatus,
  customerQuestion: string | null,
  updatedBy: string
): Promise<TicketStatusOverride | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('ticket_status_overrides')
    .upsert(
      {
        repairshopr_ticket_id: ticketId,
        custom_status: customStatus,
        customer_question: customerQuestion,
        updated_by: updatedBy,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'repairshopr_ticket_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error setting ticket status override:', error);
    return null;
  }

  return data;
}

/**
 * Get the RepairShopr status for a custom status
 */
export function getRepairShoprStatusForCustomStatus(
  customStatus: TicketCustomStatus
): string {
  const definition = TICKET_STATUS_DEFINITIONS.find(d => d.status === customStatus);
  return definition?.repairshopr_status || 'New';
}

/**
 * Get the default custom status for a RepairShopr status
 * Maps RepairShopr statuses to our custom status system
 * When multiple custom statuses map to the same RS status, returns the first/default one
 *
 * @version 1.0.0 - 2026-01-12T00:00:00Z - Initial implementation
 * @version 1.1.0 - 2026-01-13T00:00:00Z - Added deprecated RS status mapping for unused statuses
 */
export function getDefaultCustomStatusForRepairShoprStatus(
  repairshoprStatus: string
): TicketCustomStatus {
  const statusLower = repairshoprStatus?.toLowerCase() || '';

  // Map RepairShopr statuses to our custom statuses
  // Using case-insensitive matching for robustness
  if (statusLower === 'rework' || statusLower === 're-work') return 'rework';
  if (statusLower === 'new') return 'new';
  if (statusLower === 'in progress') return 'diagnosing'; // Default to diagnosing for "In Progress"
  if (statusLower === 'waiting for parts') return 'waiting_for_parts';
  if (statusLower === 'waiting on customer') return 'on_hold';
  if (statusLower === 'customer reply') return 'call_customer'; // Default to call_customer for "Customer Reply"
  if (statusLower === 'done shelf') return 'ready_for_pickup_no_payment_due';
  if (statusLower === 'resolved') return 'completed';

  // Also handle CnC status which means "Call and Close" or similar
  if (statusLower === 'cnc') return 'call_customer';

  // Deprecated RepairShopr statuses - these should not be used
  // Maps to deprecated_rs_status so they appear in the correction queue
  const deprecatedStatuses = [
    '30 day notice',
    'called customer',
    'final notice',
    'remote work',
    'rush service',
    'scheduled',
    'waiting for payment',
  ];
  if (deprecatedStatuses.includes(statusLower)) {
    return 'deprecated_rs_status';
  }

  // Default to 'new' for truly unknown statuses
  return 'new';
}

/**
 * Check if a custom status requires a customer question
 */
export function statusRequiresCustomerQuestion(
  customStatus: TicketCustomStatus
): boolean {
  return customStatus === 'call_customer' || customStatus === 'waiting_for_customer_reply';
}

// =============================================================================
// Customer Protection Plan Type Definitions
// =============================================================================

export type ProtectionPlanTier = 'eset' | 'silver' | 'silver-plus' | null;

export interface CustomerProtectionPlan {
  id: string;
  repairshopr_customer_id: number;
  is_silver_plan: boolean; // Legacy field, kept for backwards compatibility
  plan_tier: ProtectionPlanTier;
  created_at: string;
  updated_at: string;
}

// Legacy type alias for backwards compatibility
export type CustomerSilverPlan = CustomerProtectionPlan;

// =============================================================================
// Customer Protection Plan Functions
// =============================================================================

/**
 * Get protection plan status for a customer
 */
export async function getCustomerProtectionPlan(
  customerId: number
): Promise<CustomerProtectionPlan | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('customer_silver_plans')
    .select('*')
    .eq('repairshopr_customer_id', customerId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching customer protection plan:', error);
    return null;
  }

  return data;
}

// Legacy alias
export const getCustomerSilverPlan = getCustomerProtectionPlan;

/**
 * Get protection plan statuses for multiple customers
 */
export async function getCustomerProtectionPlans(
  customerIds: number[]
): Promise<CustomerProtectionPlan[]> {
  if (!supabaseAdmin || customerIds.length === 0) return [];

  const { data, error } = await supabaseAdmin
    .from('customer_silver_plans')
    .select('*')
    .in('repairshopr_customer_id', customerIds);

  if (error) {
    console.error('Error fetching customer protection plans:', error);
    return [];
  }

  return data || [];
}

// Legacy alias
export const getCustomerSilverPlans = getCustomerProtectionPlans;

/**
 * Set or update customer protection plan tier
 */
export async function setCustomerProtectionPlan(
  customerId: number,
  planTier: ProtectionPlanTier
): Promise<CustomerProtectionPlan | null> {
  if (!supabaseAdmin) return null;

  // Determine legacy is_silver_plan value based on tier
  const isSilverPlan = planTier === 'silver';

  const { data, error } = await supabaseAdmin
    .from('customer_silver_plans')
    .upsert(
      {
        repairshopr_customer_id: customerId,
        is_silver_plan: isSilverPlan,
        plan_tier: planTier,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'repairshopr_customer_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error setting customer protection plan:', error);
    return null;
  }

  return data;
}

/**
 * Get customer's protection plan tier
 */
export async function getCustomerPlanTier(customerId: number): Promise<ProtectionPlanTier> {
  const plan = await getCustomerProtectionPlan(customerId);
  return plan?.plan_tier ?? null;
}

/**
 * Check if a customer has any protection plan
 */
export async function hasProtectionPlan(customerId: number): Promise<boolean> {
  const tier = await getCustomerPlanTier(customerId);
  return tier !== null;
}

// =============================================================================
// Asset Protection Plan Type Definitions
// =============================================================================

export type EsetStatus = 'protected' | 'expired' | 'unprotected' | null;

export interface AssetProtectionPlan {
  id: string;
  repairshopr_asset_id: number;
  repairshopr_customer_id: number;
  plan_tier: ProtectionPlanTier;
  eset_status: EsetStatus;
  eset_expiry: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerProtectionSummary {
  repairshopr_customer_id: number;
  protected_asset_count: number;
  total_assets_with_records: number;
  has_paid_plan: boolean;
  plan_tiers: ProtectionPlanTier[];
}

// =============================================================================
// Asset Protection Plan Functions
// =============================================================================

/**
 * Get protection plan for a specific asset
 */
export async function getAssetProtectionPlan(
  assetId: number
): Promise<AssetProtectionPlan | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('asset_protection_plans')
    .select('*')
    .eq('repairshopr_asset_id', assetId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching asset protection plan:', error);
    return null;
  }

  return data;
}

/**
 * Get protection plans for multiple assets
 */
export async function getAssetProtectionPlans(
  assetIds: number[]
): Promise<AssetProtectionPlan[]> {
  if (!supabaseAdmin || assetIds.length === 0) return [];

  const { data, error } = await supabaseAdmin
    .from('asset_protection_plans')
    .select('*')
    .in('repairshopr_asset_id', assetIds);

  if (error) {
    console.error('Error fetching asset protection plans:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all protection plans for a customer's assets
 */
export async function getCustomerAssetProtectionPlans(
  customerId: number
): Promise<AssetProtectionPlan[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('asset_protection_plans')
    .select('*')
    .eq('repairshopr_customer_id', customerId);

  if (error) {
    console.error('Error fetching customer asset protection plans:', error);
    return [];
  }

  return data || [];
}

/**
 * Set or update asset protection plan
 */
export async function setAssetProtectionPlan(
  assetId: number,
  customerId: number,
  planTier: ProtectionPlanTier,
  esetStatus?: EsetStatus,
  esetExpiry?: string | null
): Promise<AssetProtectionPlan | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('asset_protection_plans')
    .upsert(
      {
        repairshopr_asset_id: assetId,
        repairshopr_customer_id: customerId,
        plan_tier: planTier,
        eset_status: esetStatus ?? null,
        eset_expiry: esetExpiry ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'repairshopr_asset_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error setting asset protection plan:', error);
    return null;
  }

  return data;
}

/**
 * Update ESET status for an asset
 */
export async function updateAssetEsetStatus(
  assetId: number,
  esetStatus: EsetStatus,
  esetExpiry?: string | null
): Promise<AssetProtectionPlan | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('asset_protection_plans')
    .update({
      eset_status: esetStatus,
      eset_expiry: esetExpiry ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('repairshopr_asset_id', assetId)
    .select()
    .single();

  if (error) {
    console.error('Error updating asset ESET status:', error);
    return null;
  }

  return data;
}

/**
 * Delete asset protection plan
 */
export async function deleteAssetProtectionPlan(assetId: number): Promise<boolean> {
  if (!supabaseAdmin) return false;

  const { error } = await supabaseAdmin
    .from('asset_protection_plans')
    .delete()
    .eq('repairshopr_asset_id', assetId);

  if (error) {
    console.error('Error deleting asset protection plan:', error);
    return false;
  }

  return true;
}

/**
 * Get protection summary for a customer (based on their assets)
 */
export async function getCustomerProtectionSummary(
  customerId: number
): Promise<CustomerProtectionSummary | null> {
  if (!supabaseAdmin) return null;

  const plans = await getCustomerAssetProtectionPlans(customerId);

  if (plans.length === 0) {
    return {
      repairshopr_customer_id: customerId,
      protected_asset_count: 0,
      total_assets_with_records: 0,
      has_paid_plan: false,
      plan_tiers: [],
    };
  }

  const paidTiers: ProtectionPlanTier[] = ['silver', 'silver-plus'];
  const protectedAssets = plans.filter(p => p.plan_tier !== null);
  const uniqueTiers = [...new Set(plans.map(p => p.plan_tier).filter(Boolean))] as ProtectionPlanTier[];
  const hasPaidPlan = plans.some(p => p.plan_tier && paidTiers.includes(p.plan_tier));

  return {
    repairshopr_customer_id: customerId,
    protected_asset_count: protectedAssets.length,
    total_assets_with_records: plans.length,
    has_paid_plan: hasPaidPlan,
    plan_tiers: uniqueTiers,
  };
}

/**
 * Check if customer has any assets with paid protection plans
 */
export async function customerHasPaidAssetPlan(customerId: number): Promise<boolean> {
  const summary = await getCustomerProtectionSummary(customerId);
  return summary?.has_paid_plan ?? false;
}

// =============================================================================
// Assets Updated Migration Tracking
// =============================================================================

export interface AssetsUpdatedStatus {
  repairshopr_id: number;
  assets_updated: boolean;
}

export interface MigrationProgress {
  migrated: number;
  not_migrated: number;
  total: number;
  percent_complete: number;
}

/**
 * Get the assets_updated flag for a customer
 */
export async function getCustomerAssetsUpdated(
  customerId: number
): Promise<boolean> {
  if (!supabaseAdmin) return false;

  const { data, error } = await supabaseAdmin
    .from('rs_customers')
    .select('assets_updated')
    .eq('repairshopr_id', customerId)
    .single();

  if (error) {
    // Default to false if not found
    return false;
  }

  return data?.assets_updated ?? false;
}

/**
 * Get assets_updated flags for multiple customers
 * Fetches in batches to handle Supabase's 1000 row limit
 */
export async function getCustomersAssetsUpdated(
  customerIds: number[]
): Promise<Map<number, boolean>> {
  if (!supabaseAdmin || customerIds.length === 0) {
    return new Map();
  }

  const result = new Map<number, boolean>();
  const BATCH_SIZE = 500; // Use smaller batch for .in() queries

  // Process customer IDs in batches
  for (let i = 0; i < customerIds.length; i += BATCH_SIZE) {
    const batchIds = customerIds.slice(i, i + BATCH_SIZE);

    const { data, error } = await supabaseAdmin
      .from('rs_customers')
      .select('repairshopr_id, assets_updated')
      .in('repairshopr_id', batchIds);

    if (error) {
      console.error('Error fetching assets_updated flags:', error);
      continue; // Continue with next batch
    }

    for (const row of data || []) {
      result.set(row.repairshopr_id, row.assets_updated ?? false);
    }
  }

  return result;
}

/**
 * Set the assets_updated flag for a customer
 */
export async function setCustomerAssetsUpdated(
  customerId: number,
  assetsUpdated: boolean
): Promise<boolean> {
  if (!supabaseAdmin) return false;

  const { error } = await supabaseAdmin
    .from('rs_customers')
    .update({ assets_updated: assetsUpdated })
    .eq('repairshopr_id', customerId);

  if (error) {
    console.error('Error setting assets_updated flag:', error);
    return false;
  }

  return true;
}

/**
 * Get migration progress statistics
 */
export async function getMigrationProgress(): Promise<MigrationProgress> {
  if (!supabaseAdmin) {
    return { migrated: 0, not_migrated: 0, total: 0, percent_complete: 0 };
  }

  // Count migrated customers
  const { count: migratedCount } = await supabaseAdmin
    .from('rs_customers')
    .select('*', { count: 'exact', head: true })
    .eq('assets_updated', true);

  // Count not migrated customers
  const { count: notMigratedCount } = await supabaseAdmin
    .from('rs_customers')
    .select('*', { count: 'exact', head: true })
    .or('assets_updated.is.null,assets_updated.eq.false');

  const migrated = migratedCount || 0;
  const notMigrated = notMigratedCount || 0;
  const total = migrated + notMigrated;
  const percentComplete = total > 0 ? Math.round((migrated / total) * 1000) / 10 : 0;

  return {
    migrated,
    not_migrated: notMigrated,
    total,
    percent_complete: percentComplete,
  };
}

/**
 * Get effective protection plan tier for a customer
 * - If assets_updated is false: use customer-level plan from customer_silver_plans
 * - If assets_updated is true: derive from asset-level plans
 */
export async function getEffectiveCustomerPlanTier(
  customerId: number
): Promise<ProtectionPlanTier> {
  if (!supabaseAdmin) return null;

  // Check if assets have been updated
  const assetsUpdated = await getCustomerAssetsUpdated(customerId);

  if (!assetsUpdated) {
    // Use customer-level tracking (RepairShopr/legacy)
    const plan = await getCustomerProtectionPlan(customerId);
    return plan?.plan_tier ?? null;
  }

  // Use asset-level tracking - get highest tier among assets
  const summary = await getCustomerProtectionSummary(customerId);
  if (!summary || summary.plan_tiers.length === 0) {
    return null;
  }

  // Return highest tier
  const tierHierarchy: Record<string, number> = {
    'silver-plus': 3,
    'silver': 2,
    'eset': 1,
  };

  let highestTier: ProtectionPlanTier = null;
  let highestRank = 0;

  for (const tier of summary.plan_tiers) {
    if (tier && tierHierarchy[tier] > highestRank) {
      highestRank = tierHierarchy[tier];
      highestTier = tier;
    }
  }

  return highestTier;
}

/**
 * Get effective protection plan tiers for multiple customers
 * Returns a map of customer ID to their effective plan tier
 */
export async function getEffectiveCustomerPlanTiers(
  customerIds: number[]
): Promise<Map<number, ProtectionPlanTier>> {
  if (!supabaseAdmin || customerIds.length === 0) {
    return new Map();
  }

  const result = new Map<number, ProtectionPlanTier>();

  const tierHierarchy: Record<string, number> = {
    'silver-plus': 3,
    'silver': 2,
    'eset': 1,
  };

  // Get assets_updated flags for all customers
  const assetsUpdatedMap = await getCustomersAssetsUpdated(customerIds);

  // Split customers by migration status
  const legacyCustomers: number[] = [];
  const migratedCustomers: number[] = [];

  for (const id of customerIds) {
    if (assetsUpdatedMap.get(id)) {
      migratedCustomers.push(id);
    } else {
      legacyCustomers.push(id);
    }
  }

  // For legacy customers: Get plan tier from synced RepairShopr data
  // This uses the 'properties' and 'tags' fields that were synced from RepairShopr
  // Fetch in batches to handle Supabase's 1000 row limit
  if (legacyCustomers.length > 0) {
    try {
      const BATCH_SIZE = 500; // Use smaller batch for .in() queries

      // Fetch synced RepairShopr data in batches
      for (let i = 0; i < legacyCustomers.length; i += BATCH_SIZE) {
        const batchIds = legacyCustomers.slice(i, i + BATCH_SIZE);

        const { data: syncedCustomers, error: syncError } = await supabaseAdmin
          .from('rs_customers')
          .select('repairshopr_id, properties, tags, custom_fields')
          .in('repairshopr_id', batchIds);

        if (syncError) {
          console.error('Error fetching synced customer data:', syncError);
          // Set null for customers in this batch if query fails
          for (const id of batchIds) {
            result.set(id, null);
          }
          continue;
        }

        // Extract plan tier from the synced RepairShopr data using the same logic as live API
        for (const customer of syncedCustomers || []) {
          // Build a partial customer object that extractPlanTierFromRepairShoprData can use
          // This includes custom_fields, properties, and tags - the same fields the live API uses
          const partialCustomer = {
            custom_fields: customer.custom_fields || {},
            properties: customer.properties || {},
            tags: customer.tags || [],
          };

          const tier = extractPlanTierFromRepairShoprData(partialCustomer);
          result.set(customer.repairshopr_id, tier);
        }

        // Set null for any customers in this batch not found in synced data
        for (const id of batchIds) {
          if (!result.has(id)) {
            result.set(id, null);
          }
        }
      }
    } catch (error) {
      console.error('Exception fetching synced customer data:', error);
      // Fallback: set null for all legacy customers not yet set
      for (const id of legacyCustomers) {
        if (!result.has(id)) {
          result.set(id, null);
        }
      }
    }
  }

  // Get asset-level plans for migrated customers
  // Fetch in batches to handle Supabase's 1000 row limit
  if (migratedCustomers.length > 0) {
    const BATCH_SIZE = 500; // Use smaller batch for .in() queries
    const customerTiers = new Map<number, ProtectionPlanTier>();

    // Fetch asset plans in batches
    for (let i = 0; i < migratedCustomers.length; i += BATCH_SIZE) {
      const batchIds = migratedCustomers.slice(i, i + BATCH_SIZE);

      const { data: assetPlans, error } = await supabaseAdmin
        .from('asset_protection_plans')
        .select('repairshopr_customer_id, plan_tier')
        .in('repairshopr_customer_id', batchIds);

      if (error) {
        console.error('Error fetching asset plans:', error);
        continue;
      }

      // Group by customer and find highest tier
      for (const plan of assetPlans || []) {
        const currentTier = customerTiers.get(plan.repairshopr_customer_id);
        const currentRank = currentTier ? (tierHierarchy[currentTier] || 0) : 0;
        const newRank = plan.plan_tier ? (tierHierarchy[plan.plan_tier] || 0) : 0;

        if (newRank > currentRank) {
          customerTiers.set(plan.repairshopr_customer_id, plan.plan_tier);
        }
      }
    }

    // Set results for all migrated customers
    for (const id of migratedCustomers) {
      result.set(id, customerTiers.get(id) ?? null);
    }
  }

  return result;
}

/**
 * Check if a customer has any assets (needed for validation before setting assets_updated)
 */
export async function getCustomerAssetCount(customerId: number): Promise<number> {
  if (!supabaseAdmin) return 0;

  const { count, error } = await supabaseAdmin
    .from('rs_assets')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', customerId);

  if (error) {
    console.error('Error counting customer assets:', error);
    return 0;
  }

  return count || 0;
}
