/**
 * Cart validation and server-side persistence for the Computer Store KS storefront.
 *
 * Provides server-side cart validation (stock, pricing, product status),
 * saved cart CRUD for authenticated users, and guest-to-authenticated cart
 * merging. All database operations use supabaseAdmin (service role) to
 * bypass RLS since this module runs exclusively on the server.
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */

import type {
  CartItemData,
  CartItem,
  CartValidationResult,
  CartWarning,
  StoreSavedCart,
  StoreProduct,
} from '@/types/store';
import { supabaseAdmin } from '@/lib/supabase';
import {
  calculateRetailPrice,
  getPricingConfig,
  calculateShipping,
  calculateTax,
} from './pricing';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Maximum percentage a price can change before a warning is generated.
 * A 5% threshold prevents nuisance warnings from tiny rounding changes.
 */
const PRICE_CHANGE_THRESHOLD = 0.05;

// ---------------------------------------------------------------------------
// Cart Validation
// ---------------------------------------------------------------------------

/**
 * Validate cart items server-side.
 *
 * Checks every item in the cart against the current database state:
 * - Product exists and is active
 * - Product is in stock (or has sufficient quantity)
 * - Price has not changed significantly since the customer added it
 *
 * Returns validated items with current prices and any warnings for
 * items that were removed, reduced, or re-priced.
 *
 * @param items - Array of cart item data from the client (product_id, sku, quantity)
 * @returns Validation result with resolved items, warnings, and computed totals
 *
 * @sideEffects
 * - Reads from `store_products` table via supabaseAdmin
 * - Reads pricing config, rules, and overrides via pricing module
 *
 * @functions_called supabaseAdmin.from, calculateRetailPrice, getPricingConfig,
 *   calculateShipping, calculateTax
 * @called_by POST /api/store/cart/validate, checkout flow
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function validateCart(
  items: CartItemData[]
): Promise<CartValidationResult> {
  const warnings: CartWarning[] = [];
  const validatedItems: CartItem[] = [];

  if (!supabaseAdmin || items.length === 0) {
    const config = await getPricingConfig();
    return {
      valid: true,
      items: [],
      warnings: [],
      subtotal: 0,
      shipping: config ? calculateShipping(0, config) : 0,
      tax: 0,
      total: config ? calculateShipping(0, config) : 0,
    };
  }

  // Fetch all referenced products in one query
  const productIds = items.map((i) => i.product_id);
  const { data: products, error } = await supabaseAdmin
    .from('store_products')
    .select('*')
    .in('id', productIds);

  if (error) {
    console.error('Error fetching products for cart validation:', error);
    return {
      valid: false,
      items: [],
      warnings: [{ sku: '', type: 'product_removed', message: 'Unable to validate cart. Please try again.' }],
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,
    };
  }

  const productMap = new Map<string, StoreProduct>();
  for (const p of products ?? []) {
    productMap.set(p.id, p as StoreProduct);
  }

  for (const item of items) {
    const product = productMap.get(item.product_id);

    // Product no longer exists or is inactive
    if (!product || !product.is_active) {
      warnings.push({
        sku: item.sku,
        type: 'product_removed',
        message: `"${item.sku}" is no longer available and has been removed from your cart.`,
      });
      continue;
    }

    // Product is out of stock
    if (product.stock_status === 'out_of_stock' || product.stock_quantity <= 0) {
      warnings.push({
        sku: item.sku,
        type: 'out_of_stock',
        message: `"${product.name}" is currently out of stock.`,
      });
      continue;
    }

    // Determine current effective price
    const currentPrice = await calculateRetailPrice({
      id: product.id,
      cost_price: product.cost_price,
      category_id: product.category_id,
    });

    // If we cannot determine a price, skip the item
    if (currentPrice === null) {
      warnings.push({
        sku: item.sku,
        type: 'product_removed',
        message: `"${product.name}" cannot be priced at this time.`,
      });
      continue;
    }

    // Adjust quantity if stock is insufficient
    let adjustedQuantity = item.quantity;
    if (adjustedQuantity > product.stock_quantity) {
      warnings.push({
        sku: item.sku,
        type: 'quantity_reduced',
        message: `Only ${product.stock_quantity} of "${product.name}" available. Quantity adjusted.`,
        old_value: item.quantity,
        new_value: product.stock_quantity,
      });
      adjustedQuantity = product.stock_quantity;
    }

    // Check for significant price change (using effective_price if available as the "expected" price)
    if (product.effective_price !== undefined && product.effective_price !== null) {
      const priceDiff = Math.abs(currentPrice - product.effective_price);
      const threshold = product.effective_price * PRICE_CHANGE_THRESHOLD;
      if (priceDiff > threshold && priceDiff > 0.01) {
        warnings.push({
          sku: item.sku,
          type: 'price_changed',
          message: `Price for "${product.name}" has changed.`,
          old_value: product.effective_price,
          new_value: currentPrice,
        });
      }
    }

    validatedItems.push({
      product_id: product.id,
      sku: product.sku,
      quantity: adjustedQuantity,
      name: product.name,
      price: currentPrice,
      image: product.images?.[0] ?? null,
      stock_status: product.stock_status,
      stock_quantity: product.stock_quantity,
      max_quantity: product.stock_quantity,
    });
  }

  // Compute totals
  const config = await getPricingConfig();
  const subtotal =
    Math.round(
      validatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100
    ) / 100;
  const shipping = config ? calculateShipping(subtotal, config) : 0;
  const tax = config ? calculateTax(subtotal, config) : 0;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  return {
    valid: warnings.length === 0,
    items: validatedItems,
    warnings,
    subtotal,
    shipping,
    tax,
    total,
  };
}

// ---------------------------------------------------------------------------
// Saved Cart CRUD
// ---------------------------------------------------------------------------

/**
 * Get saved cart for a user.
 *
 * Fetches the persisted cart from the `store_saved_carts` table for the
 * given user profile ID. Returns null if no saved cart exists.
 *
 * @param userProfileId - UUID of the user profile (from `user_profiles` table)
 * @returns The saved cart object, or null if none exists
 *
 * @sideEffects
 * - Reads from `store_saved_carts` table via supabaseAdmin
 *
 * @functions_called supabaseAdmin.from
 * @called_by GET /api/store/cart, login merge flow
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function getSavedCart(
  userProfileId: string
): Promise<StoreSavedCart | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('store_saved_carts')
    .select('*')
    .eq('user_profile_id', userProfileId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching saved cart:', error);
    return null;
  }

  return data as StoreSavedCart | null;
}

/**
 * Save or update cart for a user.
 *
 * Uses upsert (INSERT ... ON CONFLICT UPDATE) keyed on `user_profile_id`
 * to atomically create or replace the user's saved cart.
 *
 * @param userProfileId - UUID of the user profile
 * @param items - Array of cart item data to persist
 *
 * @sideEffects
 * - Upserts a row in `store_saved_carts` table via supabaseAdmin
 *
 * @functions_called supabaseAdmin.from
 * @called_by POST /api/store/cart, cart merge flow, periodic autosave
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function saveCart(
  userProfileId: string,
  items: CartItemData[]
): Promise<void> {
  if (!supabaseAdmin) return;

  const { error } = await supabaseAdmin
    .from('store_saved_carts')
    .upsert(
      {
        user_profile_id: userProfileId,
        items,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_profile_id' }
    );

  if (error) {
    console.error('Error saving cart:', error);
  }
}

/**
 * Merge guest cart (localStorage) with saved cart.
 *
 * Server cart wins on conflicts (same product_id). New items from
 * the local/guest cart that do not exist in the server cart are appended.
 * Returns the merged items array without duplicates.
 *
 * @param serverItems - Items from the user's persisted server-side cart
 * @param localItems - Items from the guest's localStorage cart
 * @returns Merged array of cart items with no duplicate product IDs
 *
 * @functions_called none
 * @called_by Login/auth flow, POST /api/store/cart/merge
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export function mergeCarts(
  serverItems: CartItemData[],
  localItems: CartItemData[]
): CartItemData[] {
  // Build a map from server items (these take priority)
  const merged = new Map<string, CartItemData>();

  for (const item of serverItems) {
    merged.set(item.product_id, { ...item });
  }

  // Add local items only if they are not already in the server cart
  for (const item of localItems) {
    if (!merged.has(item.product_id)) {
      merged.set(item.product_id, { ...item });
    }
  }

  return Array.from(merged.values());
}

/**
 * Clear saved cart for a user (after checkout).
 *
 * Deletes the saved cart row from `store_saved_carts` for the given user.
 * Silently succeeds if no saved cart exists.
 *
 * @param userProfileId - UUID of the user profile
 *
 * @sideEffects
 * - Deletes a row from `store_saved_carts` table via supabaseAdmin
 *
 * @functions_called supabaseAdmin.from
 * @called_by Post-checkout cleanup, POST /api/store/checkout/complete
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function clearSavedCart(userProfileId: string): Promise<void> {
  if (!supabaseAdmin) return;

  const { error } = await supabaseAdmin
    .from('store_saved_carts')
    .delete()
    .eq('user_profile_id', userProfileId);

  if (error) {
    console.error('Error clearing saved cart:', error);
  }
}

// ---------------------------------------------------------------------------
// Cart Resolution
// ---------------------------------------------------------------------------

/**
 * Resolve cart items to full CartItem objects with current prices and stock.
 *
 * Takes minimal cart item data (product_id, sku, quantity) and hydrates
 * each entry with the product's current name, effective price, image,
 * and stock information. Items whose products cannot be found or priced
 * are silently excluded.
 *
 * @param items - Array of minimal cart item data to resolve
 * @returns Array of fully resolved CartItem objects with current pricing/stock
 *
 * @sideEffects
 * - Reads from `store_products` table via supabaseAdmin
 * - Reads pricing data via calculateRetailPrice
 *
 * @functions_called supabaseAdmin.from, calculateRetailPrice
 * @called_by GET /api/store/cart, cart page rendering, checkout summary
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function resolveCartItems(
  items: CartItemData[]
): Promise<CartItem[]> {
  if (!supabaseAdmin || items.length === 0) return [];

  const productIds = items.map((i) => i.product_id);
  const { data: products, error } = await supabaseAdmin
    .from('store_products')
    .select('*')
    .in('id', productIds);

  if (error) {
    console.error('Error fetching products for cart resolution:', error);
    return [];
  }

  const productMap = new Map<string, StoreProduct>();
  for (const p of products ?? []) {
    productMap.set(p.id, p as StoreProduct);
  }

  const resolved: CartItem[] = [];

  for (const item of items) {
    const product = productMap.get(item.product_id);
    if (!product || !product.is_active) continue;

    const price = await calculateRetailPrice({
      id: product.id,
      cost_price: product.cost_price,
      category_id: product.category_id,
    });

    if (price === null) continue;

    resolved.push({
      product_id: product.id,
      sku: product.sku,
      quantity: Math.min(item.quantity, product.stock_quantity),
      name: product.name,
      price,
      image: product.images?.[0] ?? null,
      stock_status: product.stock_status,
      stock_quantity: product.stock_quantity,
      max_quantity: product.stock_quantity,
    });
  }

  return resolved;
}
