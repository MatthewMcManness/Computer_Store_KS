import { supabase, supabaseAdmin } from './supabase';

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
  thumbnail?: string;
  stockQuantity: number;
  isActive?: boolean;
  archivedAt?: string;
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
  thumbnail_url?: string;
  specs?: GallerySpec[];
  sort_order?: number;
  stock_quantity?: number;
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
 * @called_by DELETE /api/in-store/[id]
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
 * @called_by PATCH /api/in-store/[id]/stock
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
 * @called_by GET /api/in-store/archived
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
 * @called_by POST /api/in-store/[id]/restore
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
