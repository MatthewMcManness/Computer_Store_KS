/**
 * Storefront type definitions for the Computer Store KS online store.
 *
 * Contains all TypeScript interfaces and types for the storefront system including
 * database row types (matching Supabase table schemas), cart/checkout types,
 * API request/response types, and admin dashboard types.
 *
 * @version 1.0.0 - 2026-03-02T00:00:00Z - Initial implementation
 */

// ---------------------------------------------------------------------------
// Enums & Union Types
// ---------------------------------------------------------------------------

/** Stock availability status for a product. */
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';

/** Lifecycle status of a customer order. */
export type OrderStatus =
  | 'pending'
  | 'payment_confirmed'
  | 'submitted_to_supplier'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

/** Type of catalog/inventory sync operation. */
export type SyncType = 'catalog' | 'stock' | 'order_status';

/** Current state of a sync operation. */
export type SyncStatus = 'never' | 'success' | 'error' | 'running';

// ---------------------------------------------------------------------------
// Database Row Types (Supabase table schemas)
// ---------------------------------------------------------------------------

/**
 * A product category in the store hierarchy.
 *
 * Maps to the `store_categories` Supabase table. Categories support
 * single-level nesting via `parent_id` and manual ordering via `sort_order`.
 */
export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  /** Child categories (populated via join). */
  children?: StoreCategory[];
  /** Number of active products in this category (populated via aggregate). */
  product_count?: number;
}

/**
 * A product listing in the online store.
 *
 * Maps to the `store_products` Supabase table. Products are sourced from the
 * TD Synnex catalog and enriched with local pricing, images, and metadata.
 */
export interface StoreProduct {
  id: string;
  sku: string;
  manufacturer_part: string | null;
  name: string;
  description: string | null;
  short_description: string | null;
  manufacturer: string | null;
  category_id: string | null;
  cost_price: number | null;
  retail_price: number | null;
  msrp: number | null;
  stock_quantity: number;
  stock_status: StockStatus;
  weight_lbs: number | null;
  /** JSONB array of image URLs. */
  images: string[];
  /** JSONB key-value pairs of product specifications. */
  specs: Record<string, string>;
  is_featured: boolean;
  is_active: boolean;
  /** Raw data from TD Synnex catalog sync. */
  td_synnex_data: Record<string, unknown> | null;
  /** PostgreSQL tsvector for full-text search; typically not sent to client. */
  search_vector?: string;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
  /** Joined category data. */
  category?: StoreCategory;
  /** Active price override for this product, if any. */
  price_override?: StorePriceOverride | null;
  /** Final price after applying markup rules and overrides. */
  effective_price?: number;
}

/**
 * Global store pricing and configuration settings.
 *
 * Single-row table controlling store-wide pricing defaults,
 * shipping thresholds, tax rate, and store availability.
 */
export interface StorePricingConfig {
  id: string;
  default_markup_percent: number;
  free_shipping_threshold: number;
  flat_shipping_rate: number;
  tax_rate: number;
  store_enabled: boolean;
  store_announcement: string | null;
  updated_at: string;
}

/**
 * Category-specific markup rule.
 *
 * Overrides the global `default_markup_percent` for all products
 * in a given category.
 */
export interface StorePricingRule {
  id: string;
  category_id: string;
  markup_percent: number;
  created_at: string;
  updated_at: string;
  /** Joined category data. */
  category?: StoreCategory;
}

/**
 * Manual price override for a specific product.
 *
 * Takes precedence over both global and category markup rules.
 * Supports optional expiration dates for temporary promotions.
 */
export interface StorePriceOverride {
  id: string;
  product_id: string;
  override_price: number;
  reason: string | null;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
}

/**
 * A customer's persisted shopping cart.
 *
 * Stored in Supabase so carts survive across sessions and devices.
 */
export interface StoreSavedCart {
  id: string;
  user_profile_id: string;
  items: CartItemData[];
  updated_at: string;
}

/**
 * A customer's wishlist entry.
 *
 * Links a user profile to a product they want to track.
 */
export interface StoreWishlistItem {
  id: string;
  user_profile_id: string;
  product_id: string;
  added_at: string;
  /** Joined product data. */
  product?: StoreProduct;
}

/**
 * A saved shipping/billing address for a customer.
 *
 * Customers can store multiple addresses and mark one as default.
 */
export interface StoreAddress {
  id: string;
  user_profile_id: string;
  label: string;
  full_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip_code: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * A completed or in-progress customer order.
 *
 * Tracks the full order lifecycle from checkout through delivery,
 * including Stripe payment references and TD Synnex fulfillment data.
 */
export interface StoreOrder {
  id: string;
  order_number: string;
  user_profile_id: string | null;
  customer_email: string;
  customer_name: string;
  status: OrderStatus;
  shipping_address: OrderAddress;
  billing_address: OrderAddress | null;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total: number;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  td_synnex_po_number: string | null;
  td_synnex_order_number: string | null;
  tracking_number: string | null;
  tracking_carrier: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  /** Joined line items for this order. */
  items?: StoreOrderItem[];
}

/**
 * A structured address used in order records.
 *
 * Stored as JSONB within the order row rather than as a foreign key
 * to preserve the address as it was at the time of purchase.
 */
export interface OrderAddress {
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  phone?: string;
}

/**
 * A single line item within an order.
 *
 * Captures a snapshot of the product at purchase time so the order
 * record remains accurate even if the product is later modified or removed.
 */
export interface StoreOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  sku: string;
  name: string;
  quantity: number;
  unit_price: number;
  unit_cost: number | null;
  total_price: number;
  created_at: string;
}

/**
 * Configuration and status for a catalog/inventory sync operation.
 *
 * Tracks the last run time, result, and product count for each sync type.
 */
export interface StoreSyncConfig {
  id: string;
  sync_type: SyncType;
  last_sync_at: string | null;
  last_sync_status: SyncStatus;
  last_sync_message: string | null;
  product_count: number;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Cart Types
// ---------------------------------------------------------------------------

/**
 * Minimal cart item data stored in the database / local storage.
 *
 * Contains only identifiers and quantity; full product details
 * are resolved at read time via `CartItem`.
 */
export interface CartItemData {
  product_id: string;
  sku: string;
  quantity: number;
}

/**
 * A fully resolved cart item with product details and pricing.
 *
 * Extends `CartItemData` with fields needed to render the cart UI
 * and enforce stock limits.
 */
export interface CartItem extends CartItemData {
  name: string;
  price: number;
  image: string | null;
  stock_status: StockStatus;
  stock_quantity: number;
  max_quantity: number;
}

/**
 * Complete cart state with computed totals.
 *
 * Derived from the list of `CartItem` entries plus store pricing config.
 */
export interface CartState {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  item_count: number;
}

// ---------------------------------------------------------------------------
// API Request / Response Types
// ---------------------------------------------------------------------------

/**
 * Query parameters for the product listing endpoint.
 *
 * All fields are optional; omitted fields apply no filter.
 */
export interface ProductListParams {
  page?: number;
  per_page?: number;
  /** Category slug to filter by. */
  category?: string;
  /** Free-text search query. */
  search?: string;
  manufacturer?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  featured?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest';
}

/**
 * Paginated product listing response from the API.
 */
export interface ProductListResponse {
  products: StoreProduct[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

/**
 * Result of server-side cart validation before checkout.
 *
 * Re-prices all items, checks stock, and returns warnings
 * for any discrepancies since the cart was last updated.
 */
export interface CartValidationResult {
  valid: boolean;
  items: CartItem[];
  warnings: CartWarning[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

/**
 * A warning surfaced during cart validation.
 *
 * Indicates a change between what the customer expected and current reality
 * (e.g., price increase, item out of stock).
 */
export interface CartWarning {
  sku: string;
  type: 'price_changed' | 'out_of_stock' | 'quantity_reduced' | 'product_removed';
  message: string;
  old_value?: number;
  new_value?: number;
}

/**
 * Client-submitted checkout request payload.
 */
export interface CheckoutRequest {
  items: CartItemData[];
  shipping_address: OrderAddress;
  billing_address?: OrderAddress;
  customer_email: string;
  customer_name: string;
}

/**
 * Server-side input for creating an order record.
 *
 * Includes validated pricing and optional Stripe references.
 */
export interface CreateOrderInput {
  customer_email: string;
  customer_name: string;
  user_profile_id?: string;
  shipping_address: OrderAddress;
  billing_address?: OrderAddress;
  items: {
    product_id: string;
    sku: string;
    name: string;
    quantity: number;
    unit_price: number;
    unit_cost: number | null;
  }[];
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total: number;
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
}

// ---------------------------------------------------------------------------
// Admin Types
// ---------------------------------------------------------------------------

/**
 * Aggregated statistics for the admin store dashboard.
 */
export interface StoreDashboardStats {
  total_products: number;
  active_products: number;
  in_stock_products: number;
  total_orders: number;
  pending_orders: number;
  revenue_today: number;
  revenue_month: number;
  last_catalog_sync: string | null;
  last_stock_sync: string | null;
}

/**
 * Input for creating or updating a category-level pricing rule.
 */
export interface PricingRuleInput {
  category_id: string;
  markup_percent: number;
}

/**
 * Input for creating or updating a product-level price override.
 */
export interface PriceOverrideInput {
  override_price: number;
  reason?: string;
  expires_at?: string;
  created_by?: string;
}
