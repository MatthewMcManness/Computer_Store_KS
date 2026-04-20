/**
 * GALLERY DATA LAYER - All database operations for the in-store computer gallery.
 * Handles listing, creating, updating, archiving, restoring computers, and managing sales/discounts.
 *
 * WHEN TO EDIT: When changing how computers are stored, queried, or how sale pricing is calculated.
 */
import { supabase, supabaseAdmin } from './supabase';
import type {
  GalleryComputer,
  GalleryComputerDB,
  GallerySale,
  CreateComputerInput,
  UpdateComputerInput,
} from '@/types/gallery';

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

// ─── SALE PRICING SYSTEM ────────────────────────────────────────────
// How discounts work on the gallery:
//
//   1. The admin creates "sales" in the gallery_sales table (e.g.,
//      "Black Friday - 15% off desktops"). Each sale has:
//      - sale_type: a name like "black-friday" or "summer-clearance"
//      - discount_percent: e.g. 15 (meaning 15% off)
//      - applies_to: which categories get the discount (e.g. ["desktop"])
//      - is_active: only ONE sale can be active at a time
//
//   2. When computers are fetched (getComputers, getAllComputers, etc.),
//      the active sale is also fetched. Then applySalePricing() below
//      runs for EACH computer:
//      - If no active sale → computer shows normal price
//      - If active sale exists AND the computer's category is in
//        applies_to → a "blackFriday" object is added with:
//        - originalPrice: the normal price (e.g. "$850.00")
//        - salePrice: the discounted price (e.g. "$722.50")
//        - discount: the percentage (e.g. 15)
//
//   3. The frontend checks for blackFriday.enabled and shows crossed-out
//      original price + red sale price when it exists.
//
//   4. The admin toggles sales from the admin panel via setActiveSale().
//      Activating a new sale deactivates all others automatically.
//
// The field is called "blackFriday" for historical reasons (it was
// originally built for Black Friday), but it's used for ALL sales now.
// ────────────────────────────────────────────────────────────────────

/**
 * Apply sale pricing to a computer if eligible.
 * Checks if the active sale's categories include this computer,
 * and if so, calculates and attaches the discounted price.
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
    specs: computer.specs || [],
    stockQuantity: computer.stock_quantity ?? 1,
    isActive: computer.is_active,
    archivedAt: computer.archived_at || undefined,
    created_at: computer.created_at,
    updated_at: computer.updated_at,
  };

  // Does this sale apply to this computer's category?
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
 * Create a new computer listing in the database.
 * Called from the admin "Add Computer" form. Returns the new computer
 * with any active sale pricing applied.
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
 * Update an existing computer listing with new details.
 * Accepts any subset of computer fields (name, price, specs, etc.)
 * and returns the updated computer with sale pricing recalculated.
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
 * Permanently delete a computer record from the database.
 * Unlike the soft-delete in deleteComputer(), this cannot be undone.
 * Used by admins to remove entries that should never be restored.
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
