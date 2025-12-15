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
  specs: GallerySpec[];
  is_active: boolean;
  sort_order: number;
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
    specs: computer.specs || [],
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
export async function getAllComputers(): Promise<GalleryComputer[]> {
  if (!supabaseAdmin) return [];

  // Get active sale first
  const activeSale = await getActiveSaleAdmin();

  const { data, error } = await supabaseAdmin
    .from('gallery_computers')
    .select('*')
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
      specs: input.specs || [],
      sort_order: input.sort_order || 0,
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
 */
export async function deleteComputer(id: string): Promise<boolean> {
  if (!supabaseAdmin) return false;

  const { error } = await supabaseAdmin
    .from('gallery_computers')
    .update({ is_active: false })
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
  | 'new'
  | 'diagnosing'
  | 'repairing'
  | 'data_transferring'
  | 'installing'
  | 'waiting_for_parts'
  | 'building'
  | 'call_customer'
  | 'waiting_for_customer_reply'
  | 'ready_for_pickup'
  | 'completed';

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
  { status: 'new', display_name: 'New', description: 'Ticket just created', repairshopr_status: 'New', show_customer_question: false, customer_visible_status: 'Received', sort_order: 1, is_active: true },
  { status: 'diagnosing', display_name: 'Diagnosing', description: 'Diagnosing the issue', repairshopr_status: 'In Progress', show_customer_question: false, customer_visible_status: 'Being Diagnosed', sort_order: 2, is_active: true },
  { status: 'repairing', display_name: 'Repairing', description: 'Repair in progress', repairshopr_status: 'In Progress', show_customer_question: false, customer_visible_status: 'Being Repaired', sort_order: 3, is_active: true },
  { status: 'data_transferring', display_name: 'Data Transferring', description: 'Transferring data', repairshopr_status: 'In Progress', show_customer_question: false, customer_visible_status: 'Data Transfer in Progress', sort_order: 4, is_active: true },
  { status: 'installing', display_name: 'Installing', description: 'Installing software/components', repairshopr_status: 'In Progress', show_customer_question: false, customer_visible_status: 'Installation in Progress', sort_order: 5, is_active: true },
  { status: 'waiting_for_parts', display_name: 'Waiting for Parts', description: 'Waiting for parts', repairshopr_status: 'On Hold', show_customer_question: false, customer_visible_status: 'Waiting for Parts', sort_order: 6, is_active: true },
  { status: 'building', display_name: 'Building', description: 'Building custom system', repairshopr_status: 'In Progress', show_customer_question: false, customer_visible_status: 'Being Built', sort_order: 7, is_active: true },
  { status: 'call_customer', display_name: 'Call Customer', description: 'Need to call customer', repairshopr_status: 'Customer Reply', show_customer_question: true, customer_visible_status: 'We Have a Question', sort_order: 8, is_active: true },
  { status: 'waiting_for_customer_reply', display_name: 'Waiting for Customer Reply', description: 'Waiting for response', repairshopr_status: 'Customer Reply', show_customer_question: true, customer_visible_status: 'Awaiting Your Response', sort_order: 9, is_active: true },
  { status: 'ready_for_pickup', display_name: 'Ready for Pickup', description: 'On done shelf', repairshopr_status: 'Resolved', show_customer_question: false, customer_visible_status: 'Ready for Pickup', sort_order: 10, is_active: true },
  { status: 'completed', display_name: 'Completed', description: 'Fully resolved', repairshopr_status: 'Resolved', show_customer_question: false, customer_visible_status: 'Completed', sort_order: 11, is_active: true },
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
 * Check if a custom status requires a customer question
 */
export function statusRequiresCustomerQuestion(
  customStatus: TicketCustomStatus
): boolean {
  return customStatus === 'call_customer' || customStatus === 'waiting_for_customer_reply';
}
