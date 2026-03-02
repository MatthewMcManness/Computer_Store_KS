/**
 * Order management for the Computer Store KS storefront.
 *
 * Provides order creation, retrieval, status updates, and admin dashboard
 * statistics. Orders are stored in `store_orders` with line items in
 * `store_order_items`. All database operations use supabaseAdmin (service
 * role) since this module runs exclusively on the server.
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */

import type {
  StoreOrder,
  StoreOrderItem,
  OrderStatus,
  CreateOrderInput,
  StoreDashboardStats,
} from '@/types/store';
import { supabaseAdmin } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Characters used for the random suffix in order numbers. */
const ORDER_ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Default page size for paginated order queries. */
const DEFAULT_PER_PAGE = 20;

// ---------------------------------------------------------------------------
// Order Number Generation
// ---------------------------------------------------------------------------

/**
 * Generate a unique order number like CSK-20260302-A1B2.
 *
 * Format: CSK-YYYYMMDD-XXXX where XXXX is a 4-character random
 * alphanumeric string (uppercase, excluding ambiguous characters
 * like 0/O, 1/I to aid readability).
 *
 * @returns A unique order number string
 *
 * @example
 * generateOrderNumber() // "CSK-20260302-K7M3"
 *
 * @functions_called none
 * @called_by createOrder
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const datePart = `${yyyy}${mm}${dd}`;

  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += ORDER_ALPHA.charAt(Math.floor(Math.random() * ORDER_ALPHA.length));
  }

  return `CSK-${datePart}-${suffix}`;
}

// ---------------------------------------------------------------------------
// Order Creation
// ---------------------------------------------------------------------------

/**
 * Create a new order.
 *
 * Inserts a row into `store_orders` and corresponding rows into
 * `store_order_items` in a transaction-like pattern: if the items
 * insert fails, the order is deleted to maintain consistency.
 *
 * @param input - Validated order data including customer info, items, totals, and
 *   optional Stripe references
 * @returns The created order with items populated
 *
 * @throws Will not throw; returns the order on success. On failure the
 *   partially-created order is cleaned up and the function logs errors.
 *
 * @sideEffects
 * - Inserts a row into `store_orders` table
 * - Inserts rows into `store_order_items` table
 * - On item-insert failure, deletes the order row (rollback)
 *
 * @functions_called generateOrderNumber, supabaseAdmin.from
 * @called_by POST /api/store/checkout, Stripe webhook handler
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function createOrder(
  input: CreateOrderInput
): Promise<StoreOrder> {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client is not configured');
  }

  const orderNumber = generateOrderNumber();

  // Insert the order row
  const { data: order, error: orderError } = await supabaseAdmin
    .from('store_orders')
    .insert({
      order_number: orderNumber,
      user_profile_id: input.user_profile_id ?? null,
      customer_email: input.customer_email,
      customer_name: input.customer_name,
      status: 'pending' as OrderStatus,
      shipping_address: input.shipping_address,
      billing_address: input.billing_address ?? null,
      subtotal: input.subtotal,
      shipping_cost: input.shipping_cost,
      tax_amount: input.tax_amount,
      total: input.total,
      stripe_session_id: input.stripe_session_id ?? null,
      stripe_payment_intent_id: input.stripe_payment_intent_id ?? null,
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error('Error creating order:', orderError);
    throw new Error(`Failed to create order: ${orderError?.message ?? 'unknown error'}`);
  }

  // Insert order items
  const itemRows = input.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    sku: item.sku,
    name: item.name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    unit_cost: item.unit_cost,
    total_price: Math.round(item.unit_price * item.quantity * 100) / 100,
  }));

  const { data: items, error: itemsError } = await supabaseAdmin
    .from('store_order_items')
    .insert(itemRows)
    .select();

  if (itemsError) {
    console.error('Error creating order items, rolling back order:', itemsError);
    // Rollback: delete the order
    await supabaseAdmin.from('store_orders').delete().eq('id', order.id);
    throw new Error(`Failed to create order items: ${itemsError.message}`);
  }

  return {
    ...(order as StoreOrder),
    items: (items ?? []) as StoreOrderItem[],
  };
}

// ---------------------------------------------------------------------------
// Order Retrieval
// ---------------------------------------------------------------------------

/**
 * Get order by ID. Includes items.
 *
 * Fetches the order row and its associated line items in a single
 * query using Supabase's foreign-table join syntax.
 *
 * @param orderId - UUID of the order
 * @returns The order with items, or null if not found
 *
 * @sideEffects
 * - Reads from `store_orders` and `store_order_items` tables
 *
 * @functions_called supabaseAdmin.from
 * @called_by GET /api/store/orders/[id], admin order detail page
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function getOrderById(
  orderId: string
): Promise<StoreOrder | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('store_orders')
    .select('*, items:store_order_items(*)')
    .eq('id', orderId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching order by ID:', error);
    }
    return null;
  }

  return data as StoreOrder;
}

/**
 * Get order by order_number. Includes items.
 *
 * Looks up an order by its human-readable order number (e.g., CSK-20260302-A1B2).
 *
 * @param orderNumber - The order number string (e.g., "CSK-20260302-A1B2")
 * @returns The order with items, or null if not found
 *
 * @sideEffects
 * - Reads from `store_orders` and `store_order_items` tables
 *
 * @functions_called supabaseAdmin.from
 * @called_by GET /api/store/orders/lookup, order confirmation page
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function getOrderByNumber(
  orderNumber: string
): Promise<StoreOrder | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('store_orders')
    .select('*, items:store_order_items(*)')
    .eq('order_number', orderNumber)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching order by number:', error);
    }
    return null;
  }

  return data as StoreOrder;
}

/**
 * Get order by Stripe session ID.
 *
 * Used by the Stripe webhook handler and the checkout success page
 * to locate the order associated with a completed payment session.
 *
 * @param sessionId - Stripe Checkout Session ID (e.g., "cs_test_...")
 * @returns The order with items, or null if not found
 *
 * @sideEffects
 * - Reads from `store_orders` and `store_order_items` tables
 *
 * @functions_called supabaseAdmin.from
 * @called_by Stripe webhook handler, GET /api/store/checkout/success
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function getOrderByStripeSession(
  sessionId: string
): Promise<StoreOrder | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('store_orders')
    .select('*, items:store_order_items(*)')
    .eq('stripe_session_id', sessionId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching order by Stripe session:', error);
    }
    return null;
  }

  return data as StoreOrder;
}

/**
 * Get orders for a user (authenticated order history).
 *
 * Returns paginated orders sorted by created_at descending. Each order
 * includes its line items.
 *
 * @param userProfileId - UUID of the user profile
 * @param page - Page number (1-based, default: 1)
 * @param perPage - Number of orders per page (default: 20)
 * @returns Object with paginated orders array and total count
 *
 * @sideEffects
 * - Reads from `store_orders` and `store_order_items` tables
 *
 * @functions_called supabaseAdmin.from
 * @called_by GET /api/store/orders, user order history page
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function getUserOrders(
  userProfileId: string,
  page: number = 1,
  perPage: number = DEFAULT_PER_PAGE
): Promise<{ orders: StoreOrder[]; total: number }> {
  if (!supabaseAdmin) return { orders: [], total: 0 };

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  // Get total count
  const { count, error: countError } = await supabaseAdmin
    .from('store_orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_profile_id', userProfileId);

  if (countError) {
    console.error('Error counting user orders:', countError);
    return { orders: [], total: 0 };
  }

  // Get paginated orders with items
  const { data, error } = await supabaseAdmin
    .from('store_orders')
    .select('*, items:store_order_items(*)')
    .eq('user_profile_id', userProfileId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching user orders:', error);
    return { orders: [], total: 0 };
  }

  return {
    orders: (data ?? []) as StoreOrder[],
    total: count ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Order Updates
// ---------------------------------------------------------------------------

/**
 * Update order status.
 *
 * Updates the order's status and optionally sets tracking, supplier,
 * or notes fields. Returns the updated order with items.
 *
 * @param orderId - UUID of the order to update
 * @param status - New order status
 * @param updates - Optional additional fields to update (tracking_number,
 *   tracking_carrier, td_synnex_po_number, td_synnex_order_number, notes)
 * @returns The updated order, or null if not found
 *
 * @sideEffects
 * - Updates a row in `store_orders` table
 *
 * @functions_called supabaseAdmin.from
 * @called_by PUT /api/store/orders/[id]/status, admin order management,
 *   TD Synnex order status sync
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  updates?: Partial<
    Pick<
      StoreOrder,
      | 'tracking_number'
      | 'tracking_carrier'
      | 'td_synnex_po_number'
      | 'td_synnex_order_number'
      | 'notes'
    >
  >
): Promise<StoreOrder | null> {
  if (!supabaseAdmin) return null;

  const updatePayload: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (updates) {
    if (updates.tracking_number !== undefined) {
      updatePayload.tracking_number = updates.tracking_number;
    }
    if (updates.tracking_carrier !== undefined) {
      updatePayload.tracking_carrier = updates.tracking_carrier;
    }
    if (updates.td_synnex_po_number !== undefined) {
      updatePayload.td_synnex_po_number = updates.td_synnex_po_number;
    }
    if (updates.td_synnex_order_number !== undefined) {
      updatePayload.td_synnex_order_number = updates.td_synnex_order_number;
    }
    if (updates.notes !== undefined) {
      updatePayload.notes = updates.notes;
    }
  }

  const { data, error } = await supabaseAdmin
    .from('store_orders')
    .update(updatePayload)
    .eq('id', orderId)
    .select('*, items:store_order_items(*)')
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    return null;
  }

  return data as StoreOrder;
}

// ---------------------------------------------------------------------------
// Admin Queries
// ---------------------------------------------------------------------------

/**
 * Get orders for admin (with filters).
 *
 * Returns paginated orders with optional filtering by status and
 * free-text search across order_number, customer_email, and customer_name.
 * Sorted by created_at descending.
 *
 * @param params - Query parameters
 * @param params.page - Page number (1-based, default: 1)
 * @param params.per_page - Orders per page (default: 20)
 * @param params.status - Optional status filter
 * @param params.search - Optional search query (matches order_number,
 *   customer_email, customer_name)
 * @returns Object with paginated orders array and total count
 *
 * @sideEffects
 * - Reads from `store_orders` and `store_order_items` tables
 *
 * @functions_called supabaseAdmin.from
 * @called_by GET /api/admin/store/orders, admin orders list page
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function getAdminOrders(params: {
  page?: number;
  per_page?: number;
  status?: OrderStatus;
  search?: string;
}): Promise<{ orders: StoreOrder[]; total: number }> {
  if (!supabaseAdmin) return { orders: [], total: 0 };

  const page = params.page ?? 1;
  const perPage = params.per_page ?? DEFAULT_PER_PAGE;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  // Build count query
  let countQuery = supabaseAdmin
    .from('store_orders')
    .select('*', { count: 'exact', head: true });

  if (params.status) {
    countQuery = countQuery.eq('status', params.status);
  }

  if (params.search) {
    const search = `%${params.search}%`;
    countQuery = countQuery.or(
      `order_number.ilike.${search},customer_email.ilike.${search},customer_name.ilike.${search}`
    );
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    console.error('Error counting admin orders:', countError);
    return { orders: [], total: 0 };
  }

  // Build data query
  let dataQuery = supabaseAdmin
    .from('store_orders')
    .select('*, items:store_order_items(*)');

  if (params.status) {
    dataQuery = dataQuery.eq('status', params.status);
  }

  if (params.search) {
    const search = `%${params.search}%`;
    dataQuery = dataQuery.or(
      `order_number.ilike.${search},customer_email.ilike.${search},customer_name.ilike.${search}`
    );
  }

  const { data, error } = await dataQuery
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching admin orders:', error);
    return { orders: [], total: 0 };
  }

  return {
    orders: (data ?? []) as StoreOrder[],
    total: count ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Dashboard Statistics
// ---------------------------------------------------------------------------

/**
 * Get admin dashboard statistics.
 *
 * Aggregates key metrics for the store admin dashboard including product
 * counts, order counts, and revenue figures. Revenue values are stored
 * as numeric(10,2) in the database.
 *
 * Computes:
 * - total_products: count of all products
 * - active_products: count of products where is_active = true
 * - in_stock_products: count of active products with stock_quantity > 0
 * - total_orders: count of all orders
 * - pending_orders: count of orders with status = 'pending'
 * - revenue_today: sum of totals for orders created today (UTC)
 * - revenue_month: sum of totals for orders created this calendar month (UTC)
 * - last_catalog_sync: timestamp of last 'catalog' sync
 * - last_stock_sync: timestamp of last 'stock' sync
 *
 * @returns Aggregated dashboard statistics
 *
 * @sideEffects
 * - Reads from `store_products`, `store_orders`, and `store_sync_config` tables
 *
 * @functions_called supabaseAdmin.from
 * @called_by GET /api/admin/store/dashboard, admin dashboard page
 *
 * @version 1.0.0 - 2026-03-02T18:48:22Z - Initial implementation
 */
export async function getDashboardStats(): Promise<StoreDashboardStats> {
  const defaults: StoreDashboardStats = {
    total_products: 0,
    active_products: 0,
    in_stock_products: 0,
    total_orders: 0,
    pending_orders: 0,
    revenue_today: 0,
    revenue_month: 0,
    last_catalog_sync: null,
    last_stock_sync: null,
  };

  if (!supabaseAdmin) return defaults;

  // Compute date boundaries in UTC
  const now = new Date();
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  ).toISOString();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  ).toISOString();

  // Run all queries in parallel for performance
  const [
    totalProductsResult,
    activeProductsResult,
    inStockResult,
    totalOrdersResult,
    pendingOrdersResult,
    todayOrdersResult,
    monthOrdersResult,
    catalogSyncResult,
    stockSyncResult,
  ] = await Promise.all([
    // Total products
    supabaseAdmin
      .from('store_products')
      .select('*', { count: 'exact', head: true }),

    // Active products
    supabaseAdmin
      .from('store_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),

    // In-stock active products
    supabaseAdmin
      .from('store_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gt('stock_quantity', 0),

    // Total orders
    supabaseAdmin
      .from('store_orders')
      .select('*', { count: 'exact', head: true }),

    // Pending orders
    supabaseAdmin
      .from('store_orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),

    // Today's orders (for revenue)
    supabaseAdmin
      .from('store_orders')
      .select('total')
      .gte('created_at', todayStart)
      .not('status', 'in', '("cancelled","refunded")'),

    // This month's orders (for revenue)
    supabaseAdmin
      .from('store_orders')
      .select('total')
      .gte('created_at', monthStart)
      .not('status', 'in', '("cancelled","refunded")'),

    // Last catalog sync
    supabaseAdmin
      .from('store_sync_config')
      .select('last_sync_at')
      .eq('sync_type', 'catalog')
      .maybeSingle(),

    // Last stock sync
    supabaseAdmin
      .from('store_sync_config')
      .select('last_sync_at')
      .eq('sync_type', 'stock')
      .maybeSingle(),
  ]);

  // Sum revenue from today's orders
  const revenueToday =
    Math.round(
      (todayOrdersResult.data ?? []).reduce(
        (sum: number, row: { total: number }) => sum + (row.total ?? 0),
        0
      ) * 100
    ) / 100;

  // Sum revenue from this month's orders
  const revenueMonth =
    Math.round(
      (monthOrdersResult.data ?? []).reduce(
        (sum: number, row: { total: number }) => sum + (row.total ?? 0),
        0
      ) * 100
    ) / 100;

  return {
    total_products: totalProductsResult.count ?? 0,
    active_products: activeProductsResult.count ?? 0,
    in_stock_products: inStockResult.count ?? 0,
    total_orders: totalOrdersResult.count ?? 0,
    pending_orders: pendingOrdersResult.count ?? 0,
    revenue_today: revenueToday,
    revenue_month: revenueMonth,
    last_catalog_sync: catalogSyncResult.data?.last_sync_at ?? null,
    last_stock_sync: stockSyncResult.data?.last_sync_at ?? null,
  };
}
