/**
 * Markup calculation engine for the Computer Store KS storefront.
 *
 * Calculates retail prices from TD Synnex cost prices using a three-tier
 * priority system: manual price overrides > category markup rules > global
 * default markup. Also provides shipping, tax, and order total calculations.
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */

import type {
  StorePricingConfig,
  StorePricingRule,
  StorePriceOverride,
} from '@/types/store';
import { supabaseAdmin } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// In-Memory Cache
// ---------------------------------------------------------------------------

/** Cache entry with value and expiration timestamp. */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/** Simple TTL cache backed by a Map. */
const cache = new Map<string, CacheEntry<unknown>>();

/** Default cache TTL: 5 minutes in milliseconds. */
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Retrieve a value from the in-memory cache.
 *
 * Returns the cached value if it exists and has not expired, otherwise null.
 * Expired entries are deleted on access.
 *
 * @param key - Cache key to look up
 * @returns The cached value or null if missing/expired
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
function cacheGet<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * Store a value in the in-memory cache with a TTL.
 *
 * @param key - Cache key
 * @param value - Value to store
 * @param ttlMs - Time-to-live in milliseconds (default: CACHE_TTL_MS)
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
function cacheSet<T>(key: string, value: T, ttlMs: number = CACHE_TTL_MS): void {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

// ---------------------------------------------------------------------------
// Database Fetchers
// ---------------------------------------------------------------------------

/**
 * Get the global pricing configuration.
 *
 * Fetches the single-row `store_pricing_config` table from Supabase.
 * Results are cached in memory for 5 minutes to avoid repeated DB calls.
 *
 * @returns The store pricing config, or null if unavailable
 *
 * @sideEffects
 * - Reads from `store_pricing_config` table via supabaseAdmin
 * - Writes to in-memory cache on successful fetch
 *
 * @functions_called cacheGet, cacheSet, supabaseAdmin.from
 * @called_by calculateRetailPrice, API route handlers, checkout validation
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function getPricingConfig(): Promise<StorePricingConfig | null> {
  const CACHE_KEY = 'store_pricing_config';

  const cached = cacheGet<StorePricingConfig>(CACHE_KEY);
  if (cached) return cached;

  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('store_pricing_config')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching pricing config:', error);
    return null;
  }

  cacheSet(CACHE_KEY, data as StorePricingConfig);
  return data as StorePricingConfig;
}

/**
 * Get all category pricing rules.
 *
 * Fetches every row from `store_pricing_rules`. Results are cached
 * in memory for 5 minutes.
 *
 * @returns Array of category pricing rules (may be empty)
 *
 * @sideEffects
 * - Reads from `store_pricing_rules` table via supabaseAdmin
 * - Writes to in-memory cache on successful fetch
 *
 * @functions_called cacheGet, cacheSet, supabaseAdmin.from
 * @called_by calculateRetailPrice, admin pricing dashboard
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function getPricingRules(): Promise<StorePricingRule[]> {
  const CACHE_KEY = 'store_pricing_rules';

  const cached = cacheGet<StorePricingRule[]>(CACHE_KEY);
  if (cached) return cached;

  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('store_pricing_rules')
    .select('*');

  if (error) {
    console.error('Error fetching pricing rules:', error);
    return [];
  }

  const rules = (data ?? []) as StorePricingRule[];
  cacheSet(CACHE_KEY, rules);
  return rules;
}

/**
 * Get price override for a specific product.
 *
 * Queries `store_price_overrides` for the given product. Returns null
 * if no override exists or if the override has expired.
 *
 * @param productId - UUID of the product to check
 * @returns The active price override, or null if none/expired
 *
 * @sideEffects
 * - Reads from `store_price_overrides` table via supabaseAdmin
 *
 * @functions_called supabaseAdmin.from
 * @called_by calculateRetailPrice, product detail page
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function getPriceOverride(
  productId: string
): Promise<StorePriceOverride | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('store_price_overrides')
    .select('*')
    .eq('product_id', productId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching price override:', error);
    return null;
  }

  if (!data) return null;

  const override = data as StorePriceOverride;

  // Check expiry
  if (override.expires_at && new Date(override.expires_at) < new Date()) {
    return null;
  }

  return override;
}

// ---------------------------------------------------------------------------
// Price Calculation
// ---------------------------------------------------------------------------

/**
 * Calculate the retail price for a product.
 *
 * Applies the three-tier pricing priority:
 *   1. Active price override (manual, per-product)
 *   2. Category markup rule (per-category percentage)
 *   3. Default markup percentage (from store_pricing_config)
 *
 * Returns null if the product has no cost_price.
 *
 * @param product - Object containing the product's id, cost_price, and category_id
 * @returns The calculated retail price rounded to 2 decimals, or null
 *
 * @sideEffects
 * - Reads from Supabase via getPricingConfig, getPricingRules, getPriceOverride
 *
 * @functions_called getPricingConfig, getPricingRules, getPriceOverride, applyMarkup
 * @called_by Product listing API, product detail page, cart validation
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function calculateRetailPrice(product: {
  id: string;
  cost_price: number | null;
  category_id: string | null;
}): Promise<number | null> {
  if (product.cost_price === null || product.cost_price === undefined) {
    return null;
  }

  // 1. Check for active price override
  const override = await getPriceOverride(product.id);
  if (override) {
    return Math.round(override.override_price * 100) / 100;
  }

  // 2. Check for category markup rule
  const rules = await getPricingRules();
  if (product.category_id) {
    const categoryRule = rules.find((r) => r.category_id === product.category_id);
    if (categoryRule) {
      return applyMarkup(product.cost_price, categoryRule.markup_percent);
    }
  }

  // 3. Fall back to default markup
  const config = await getPricingConfig();
  if (!config) {
    return null;
  }

  return applyMarkup(product.cost_price, config.default_markup_percent);
}

/**
 * Calculate retail price synchronously given pre-fetched config.
 *
 * Used for batch price calculations to avoid repeated DB calls. Applies
 * the same three-tier priority as calculateRetailPrice but uses data
 * that has already been fetched.
 *
 * @param costPrice - The product's cost price from TD Synnex
 * @param productId - UUID of the product (for override lookup)
 * @param categoryId - UUID of the product's category, or null
 * @param config - Pre-fetched global pricing configuration
 * @param rules - Pre-fetched array of category pricing rules
 * @param overrides - Pre-fetched Map of product ID to active price override
 * @returns The calculated retail price rounded to 2 decimal places
 *
 * @functions_called applyMarkup
 * @called_by Batch product listing, catalog sync, cart validation
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export function calculateRetailPriceSync(
  costPrice: number,
  productId: string,
  categoryId: string | null,
  config: StorePricingConfig,
  rules: StorePricingRule[],
  overrides: Map<string, StorePriceOverride>
): number {
  // 1. Check for active price override
  const override = overrides.get(productId);
  if (override) {
    // Verify override has not expired
    if (!override.expires_at || new Date(override.expires_at) >= new Date()) {
      return Math.round(override.override_price * 100) / 100;
    }
  }

  // 2. Check for category markup rule
  if (categoryId) {
    const categoryRule = rules.find((r) => r.category_id === categoryId);
    if (categoryRule) {
      return applyMarkup(costPrice, categoryRule.markup_percent);
    }
  }

  // 3. Fall back to default markup
  return applyMarkup(costPrice, config.default_markup_percent);
}

/**
 * Apply markup to a cost price.
 *
 * Multiplies the cost price by (1 + markupPercent / 100) and rounds
 * the result to 2 decimal places.
 *
 * @param costPrice - The base cost price
 * @param markupPercent - The markup percentage (e.g., 25 for 25%)
 * @returns The marked-up price rounded to 2 decimal places
 *
 * @example
 * applyMarkup(100, 25) // Returns 125.00
 * applyMarkup(49.99, 30) // Returns 64.99
 *
 * @functions_called none
 * @called_by calculateRetailPrice, calculateRetailPriceSync
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export function applyMarkup(costPrice: number, markupPercent: number): number {
  const result = costPrice * (1 + markupPercent / 100);
  return Math.round(result * 100) / 100;
}

// ---------------------------------------------------------------------------
// Shipping & Tax
// ---------------------------------------------------------------------------

/**
 * Calculate shipping cost based on subtotal and config.
 *
 * Returns 0 if the subtotal meets or exceeds the free shipping threshold.
 * Otherwise returns the flat shipping rate from the pricing config.
 *
 * @param subtotal - The order subtotal before shipping and tax
 * @param config - The store pricing configuration
 * @returns The shipping cost (0 if free shipping threshold is met)
 *
 * @example
 * // With free_shipping_threshold: 100, flat_shipping_rate: 9.99
 * calculateShipping(150, config) // Returns 0
 * calculateShipping(50, config)  // Returns 9.99
 *
 * @functions_called none
 * @called_by calculateOrderTotals, cart validation, checkout
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export function calculateShipping(
  subtotal: number,
  config: StorePricingConfig
): number {
  if (subtotal >= config.free_shipping_threshold) {
    return 0;
  }
  return Math.round(config.flat_shipping_rate * 100) / 100;
}

/**
 * Calculate tax amount.
 *
 * Multiplies the subtotal by the tax rate from the pricing config.
 * The tax rate is stored as a decimal (e.g., 0.065 for 6.5%).
 *
 * @param subtotal - The order subtotal before tax
 * @param config - The store pricing configuration
 * @returns The tax amount rounded to 2 decimal places
 *
 * @example
 * // With tax_rate: 0.065
 * calculateTax(100, config) // Returns 6.50
 *
 * @functions_called none
 * @called_by calculateOrderTotals, cart validation, checkout
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export function calculateTax(
  subtotal: number,
  config: StorePricingConfig
): number {
  return Math.round(subtotal * config.tax_rate * 100) / 100;
}

// ---------------------------------------------------------------------------
// Display & Order Totals
// ---------------------------------------------------------------------------

/**
 * Format price for display (e.g., "$29.99").
 *
 * Uses Intl.NumberFormat for locale-aware USD formatting with exactly
 * 2 decimal places.
 *
 * @param price - The numeric price to format
 * @returns Formatted price string with dollar sign and 2 decimals
 *
 * @example
 * formatPrice(29.9)   // Returns "$29.90"
 * formatPrice(1499)   // Returns "$1,499.00"
 * formatPrice(0)      // Returns "$0.00"
 *
 * @functions_called none
 * @called_by Product cards, cart UI, checkout summary, order confirmation
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Calculate order totals from line items.
 *
 * Computes the subtotal from unit prices and quantities, then derives
 * shipping and tax from the store pricing config. All values are
 * rounded to 2 decimal places.
 *
 * @param items - Array of line items with unit_price and quantity
 * @param config - The store pricing configuration
 * @returns Object with subtotal, shipping, tax, and total
 *
 * @example
 * const totals = calculateOrderTotals(
 *   [{ unit_price: 49.99, quantity: 2 }, { unit_price: 19.99, quantity: 1 }],
 *   config
 * );
 * // totals.subtotal = 119.97
 * // totals.shipping = 0 (if above free shipping threshold)
 * // totals.tax = 7.80 (at 6.5%)
 * // totals.total = 127.77
 *
 * @functions_called calculateShipping, calculateTax
 * @called_by Cart validation, checkout, order creation, order summary
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export function calculateOrderTotals(
  items: { unit_price: number; quantity: number }[],
  config: StorePricingConfig
): { subtotal: number; shipping: number; tax: number; total: number } {
  const subtotal = Math.round(
    items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0) * 100
  ) / 100;

  const shipping = calculateShipping(subtotal, config);
  const tax = calculateTax(subtotal, config);
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  return { subtotal, shipping, tax, total };
}

/**
 * Calculate effective price from a product row that already has joined data.
 *
 * Uses pre-joined price_override and retail_price on the product object,
 * avoiding async DB lookups. Priority: active override > retail_price > null.
 *
 * @param product - Product with optional price_override and retail_price
 * @returns The effective storefront price, or null if no price available
 *
 * @sideEffects None - pure function
 *
 * @functions_called none
 * @called_by enrichWithPrice (products.ts)
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export function calculateEffectivePrice(product: {
  retail_price: number | null;
  price_override?: { override_price: number; expires_at: string | null } | null;
}): number | null {
  // Check for active override
  if (product.price_override) {
    const { override_price, expires_at } = product.price_override;
    if (!expires_at || new Date(expires_at) > new Date()) {
      return override_price;
    }
  }

  return product.retail_price;
}
