/**
 * Product query helpers for the Computer Store KS online storefront.
 *
 * Provides server-side data access functions for browsing, searching,
 * and retrieving products and categories from the `store_products` and
 * `store_categories` Supabase tables. All queries use the admin client
 * to simplify server-side reads without RLS complexity.
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */

import type {
  StoreProduct,
  StoreCategory,
  ProductListParams,
  ProductListResponse,
} from '@/types/store';
import { supabaseAdmin } from '@/lib/supabase';
import { calculateEffectivePrice } from './pricing';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default number of products per page. */
const DEFAULT_PER_PAGE = 24;

/** Maximum allowed products per page to prevent abuse. */
const MAX_PER_PAGE = 100;

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

/**
 * Clamp per_page between 1 and MAX_PER_PAGE, defaulting to DEFAULT_PER_PAGE.
 *
 * @param value - Raw per_page value from the request
 * @returns A safe integer within the allowed range
 *
 * @functions_called none
 * @called_by getProducts
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
function clampPerPage(value: number | undefined): number {
  if (value === undefined || value <= 0) return DEFAULT_PER_PAGE;
  return Math.min(value, MAX_PER_PAGE);
}

/**
 * Enrich a raw product row with its effective price.
 *
 * Reads the product's cost_price, retail_price, category-level markup,
 * and any active price override, then delegates to the pricing module
 * to compute the final storefront price.
 *
 * @param product - A product row (with optional joined price_override)
 * @returns The same product with `effective_price` populated
 *
 * @functions_called calculateEffectivePrice
 * @called_by getProducts, getProductBySku, getProductById, getFeaturedProducts, getProductsByIds, searchProducts
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
function enrichWithPrice(product: StoreProduct): StoreProduct {
  return {
    ...product,
    effective_price: calculateEffectivePrice(product) ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Product Queries
// ---------------------------------------------------------------------------

/**
 * Get a paginated product listing with filters.
 *
 * Supports full-text search (via the `search_vector` tsvector column),
 * category filtering by slug, price range, stock availability, featured
 * flag, manufacturer filter, and multiple sort options. Returns products
 * with their calculated effective_price.
 *
 * @param params - Query parameters controlling filters, pagination, and sort
 * @param params.page - Page number (1-based, default 1)
 * @param params.per_page - Items per page (default 24, max 100)
 * @param params.category - Category slug to filter by
 * @param params.search - Free-text search query (uses PostgreSQL full-text search)
 * @param params.manufacturer - Manufacturer name filter (case-insensitive)
 * @param params.min_price - Minimum retail_price filter
 * @param params.max_price - Maximum retail_price filter
 * @param params.in_stock - When true, only return products with stock_quantity > 0
 * @param params.featured - When true, only return featured products
 * @param params.sort - Sort order: price_asc, price_desc, name_asc, name_desc, newest
 *
 * @returns Paginated response with products, total count, and page metadata
 *
 * @sideEffects
 * - Reads from store_products, store_categories, store_price_overrides tables
 *
 * @functions_called supabaseAdmin.from, clampPerPage, enrichWithPrice
 * @called_by Storefront product listing page, API route handlers
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function getProducts(
  params: ProductListParams
): Promise<ProductListResponse> {
  if (!supabaseAdmin) {
    return { products: [], total: 0, page: 1, per_page: DEFAULT_PER_PAGE, total_pages: 0 };
  }

  const page = Math.max(1, params.page ?? 1);
  const perPage = clampPerPage(params.per_page);
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  // ----- Build data query -----
  let query = supabaseAdmin
    .from('store_products')
    .select(
      `
      *,
      category:store_categories(*),
      price_override:store_price_overrides(*)
    `,
      { count: 'exact' }
    )
    .eq('is_active', true);

  // ----- Category filter (by slug) -----
  if (params.category) {
    const { data: cat } = await supabaseAdmin
      .from('store_categories')
      .select('id')
      .eq('slug', params.category)
      .eq('is_active', true)
      .single();

    if (cat) {
      query = query.eq('category_id', cat.id);
    } else {
      // No matching category -- return empty result
      return { products: [], total: 0, page, per_page: perPage, total_pages: 0 };
    }
  }

  // ----- Full-text search -----
  if (params.search) {
    query = query.textSearch('search_vector', params.search, {
      type: 'websearch',
      config: 'english',
    });
  }

  // ----- Manufacturer filter -----
  if (params.manufacturer) {
    query = query.ilike('manufacturer', params.manufacturer);
  }

  // ----- Price range -----
  if (params.min_price !== undefined) {
    query = query.gte('retail_price', params.min_price);
  }
  if (params.max_price !== undefined) {
    query = query.lte('retail_price', params.max_price);
  }

  // ----- Stock filter -----
  if (params.in_stock) {
    query = query.gt('stock_quantity', 0);
  }

  // ----- Featured filter -----
  if (params.featured) {
    query = query.eq('is_featured', true);
  }

  // ----- Sorting -----
  switch (params.sort) {
    case 'price_asc':
      query = query.order('retail_price', { ascending: true, nullsFirst: false });
      break;
    case 'price_desc':
      query = query.order('retail_price', { ascending: false, nullsFirst: false });
      break;
    case 'name_asc':
      query = query.order('name', { ascending: true });
      break;
    case 'name_desc':
      query = query.order('name', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  // ----- Pagination -----
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return { products: [], total: 0, page, per_page: perPage, total_pages: 0 };
  }

  const products = (data || []).map(enrichWithPrice);
  const total = count ?? 0;

  return {
    products,
    total,
    page,
    per_page: perPage,
    total_pages: Math.ceil(total / perPage),
  };
}

/**
 * Get a single product by SKU with full details.
 *
 * Includes the joined category, any active price override, and the
 * computed effective price. Only returns active products.
 *
 * @param sku - The product SKU to look up
 * @returns The fully enriched product, or null if not found / inactive
 *
 * @sideEffects
 * - Reads from store_products, store_categories, store_price_overrides tables
 *
 * @functions_called supabaseAdmin.from, enrichWithPrice
 * @called_by Product detail page (by SKU), API route handlers
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function getProductBySku(sku: string): Promise<StoreProduct | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('store_products')
    .select(
      `
      *,
      category:store_categories(*),
      price_override:store_price_overrides(*)
    `
    )
    .eq('sku', sku)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching product by SKU:', error);
    return null;
  }

  if (!data) return null;

  return enrichWithPrice(data);
}

/**
 * Get a single product by its UUID.
 *
 * Includes the joined category, any active price override, and the
 * computed effective price. Only returns active products.
 *
 * @param id - The product UUID
 * @returns The fully enriched product, or null if not found / inactive
 *
 * @sideEffects
 * - Reads from store_products, store_categories, store_price_overrides tables
 *
 * @functions_called supabaseAdmin.from, enrichWithPrice
 * @called_by Cart resolution, order creation, API route handlers
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function getProductById(id: string): Promise<StoreProduct | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('store_products')
    .select(
      `
      *,
      category:store_categories(*),
      price_override:store_price_overrides(*)
    `
    )
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }

  if (!data) return null;

  return enrichWithPrice(data);
}

/**
 * Get featured products for the store landing page.
 *
 * Returns active, featured products ordered by newest first.
 * Each product includes its effective price.
 *
 * @param limit - Maximum number of featured products to return (default 8)
 * @returns Array of enriched featured products
 *
 * @sideEffects
 * - Reads from store_products, store_categories, store_price_overrides tables
 *
 * @functions_called supabaseAdmin.from, enrichWithPrice
 * @called_by Store landing page, homepage featured section
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function getFeaturedProducts(limit = 8): Promise<StoreProduct[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('store_products')
    .select(
      `
      *,
      category:store_categories(*),
      price_override:store_price_overrides(*)
    `
    )
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  return (data || []).map(enrichWithPrice);
}

// ---------------------------------------------------------------------------
// Category Queries
// ---------------------------------------------------------------------------

/**
 * Get all active categories with product counts.
 *
 * Returns a flat list of active categories. Each category includes a
 * `product_count` field representing the number of active products
 * assigned to it. Use `buildCategoryTree` to convert the flat list
 * into a nested hierarchy.
 *
 * @returns Flat array of active categories with product counts
 *
 * @sideEffects
 * - Reads from store_categories and store_products tables
 *
 * @functions_called supabaseAdmin.from
 * @called_by Storefront category navigation, sidebar filters, buildCategoryTree
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function getCategories(): Promise<StoreCategory[]> {
  if (!supabaseAdmin) return [];

  // Fetch all active categories
  const { data: categories, error: catError } = await supabaseAdmin
    .from('store_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (catError) {
    console.error('Error fetching categories:', catError);
    return [];
  }

  if (!categories || categories.length === 0) return [];

  // Fetch product counts per category in a single query
  const { data: counts, error: countError } = await supabaseAdmin
    .from('store_products')
    .select('category_id')
    .eq('is_active', true)
    .not('category_id', 'is', null);

  if (countError) {
    console.error('Error fetching category product counts:', countError);
    // Return categories without counts rather than failing entirely
    return categories;
  }

  // Build a count map from the product rows
  const countMap = new Map<string, number>();
  for (const row of counts || []) {
    const cid = row.category_id as string;
    countMap.set(cid, (countMap.get(cid) ?? 0) + 1);
  }

  return categories.map((cat) => ({
    ...cat,
    product_count: countMap.get(cat.id) ?? 0,
  }));
}

/**
 * Get a category by its URL slug.
 *
 * @param slug - The URL-safe slug identifying the category
 * @returns The matching active category, or null if not found
 *
 * @sideEffects
 * - Reads from store_categories table
 *
 * @functions_called supabaseAdmin.from
 * @called_by Category detail page, breadcrumb resolution
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function getCategoryBySlug(slug: string): Promise<StoreCategory | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('store_categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching category by slug:', error);
    return null;
  }

  return data;
}

/**
 * Build a category tree from a flat list.
 *
 * Converts a flat array of categories (as returned by `getCategories`)
 * into a nested hierarchy by linking children to their parents via
 * `parent_id`. Top-level categories (parent_id === null) form the
 * root of the tree.
 *
 * @param categories - Flat array of categories, each with an optional `parent_id`
 * @returns Array of root-level categories with nested `children` arrays
 *
 * @functions_called none
 * @called_by Storefront category navigation, admin category management
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export function buildCategoryTree(categories: StoreCategory[]): StoreCategory[] {
  const map = new Map<string, StoreCategory>();
  const roots: StoreCategory[] = [];

  // Index all categories by ID, initializing empty children arrays
  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [] });
  }

  // Link children to parents
  for (const cat of map.values()) {
    if (cat.parent_id && map.has(cat.parent_id)) {
      map.get(cat.parent_id)!.children!.push(cat);
    } else {
      roots.push(cat);
    }
  }

  return roots;
}

// ---------------------------------------------------------------------------
// Bulk & Search Queries
// ---------------------------------------------------------------------------

/**
 * Get products by multiple IDs (for cart resolution).
 *
 * Fetches active products matching the given UUIDs. Products that are
 * inactive or do not exist are silently omitted from the result.
 * Each returned product includes its effective price.
 *
 * @param ids - Array of product UUIDs to look up
 * @returns Array of enriched products (may be shorter than input if some IDs are invalid)
 *
 * @sideEffects
 * - Reads from store_products, store_categories, store_price_overrides tables
 *
 * @functions_called supabaseAdmin.from, enrichWithPrice
 * @called_by Cart validation, checkout flow, order summary
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function getProductsByIds(ids: string[]): Promise<StoreProduct[]> {
  if (!supabaseAdmin || ids.length === 0) return [];

  const { data, error } = await supabaseAdmin
    .from('store_products')
    .select(
      `
      *,
      category:store_categories(*),
      price_override:store_price_overrides(*)
    `
    )
    .in('id', ids)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching products by IDs:', error);
    return [];
  }

  return (data || []).map(enrichWithPrice);
}

/**
 * Search products using PostgreSQL full-text search.
 *
 * Uses the `search_vector` tsvector column on `store_products` for
 * efficient, language-aware full-text search. Results are ranked by
 * relevance and limited to active products.
 *
 * @param query - The search query string (supports websearch syntax)
 * @param limit - Maximum number of results to return (default 20)
 * @returns Array of enriched products matching the search query
 *
 * @sideEffects
 * - Reads from store_products, store_categories, store_price_overrides tables
 *
 * @functions_called supabaseAdmin.from, enrichWithPrice
 * @called_by Store search bar, search results page, API search endpoint
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function searchProducts(
  query: string,
  limit = 20
): Promise<StoreProduct[]> {
  if (!supabaseAdmin || !query.trim()) return [];

  const { data, error } = await supabaseAdmin
    .from('store_products')
    .select(
      `
      *,
      category:store_categories(*),
      price_override:store_price_overrides(*)
    `
    )
    .eq('is_active', true)
    .textSearch('search_vector', query.trim(), {
      type: 'websearch',
      config: 'english',
    })
    .limit(limit);

  if (error) {
    console.error('Error searching products:', error);
    return [];
  }

  return (data || []).map(enrichWithPrice);
}
