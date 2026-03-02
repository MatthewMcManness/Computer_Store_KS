-- =============================================================================
-- Drop-Ship Storefront Schema Migration
-- =============================================================================
--
-- Purpose:
--   Creates all tables, indexes, RLS policies, triggers, and seed data for
--   the Computer Store KS drop-ship storefront powered by TD Synnex.
--
-- Dependencies:
--   - user_profiles table (existing, see user-profiles-schema.sql)
--   - Supabase Auth (auth.users, auth.uid())
--
-- Tables Created:
--   store_categories, store_products, store_pricing_config,
--   store_pricing_rules, store_price_overrides, store_saved_carts,
--   store_wishlists, store_addresses, store_orders, store_order_items,
--   store_sync_config
--
-- Created: 2026-03-02
-- =============================================================================


-- =============================================================================
-- GENERIC UPDATED_AT TRIGGER FUNCTION
-- =============================================================================
-- Reusable trigger function that sets updated_at = now() on row modification.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- =============================================================================
-- 1. STORE_CATEGORIES
-- =============================================================================
-- Product category hierarchy supporting nested categories via parent_id.

CREATE TABLE IF NOT EXISTS public.store_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id   UUID REFERENCES public.store_categories(id) ON DELETE SET NULL,
  image_url   TEXT,
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_store_categories_slug
  ON public.store_categories (slug);

CREATE INDEX IF NOT EXISTS idx_store_categories_parent_id
  ON public.store_categories (parent_id);

CREATE TRIGGER trg_store_categories_updated_at
  BEFORE UPDATE ON public.store_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Public can read active categories
CREATE POLICY "store_categories_select_active"
  ON public.store_categories FOR SELECT
  USING (is_active = true);


-- =============================================================================
-- 2. STORE_PRODUCTS
-- =============================================================================
-- Full product catalog synced from TD Synnex with full-text search support.

CREATE TABLE IF NOT EXISTS public.store_products (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku                TEXT NOT NULL UNIQUE,
  manufacturer_part  TEXT,
  name               TEXT NOT NULL,
  description        TEXT,
  short_description  TEXT,
  manufacturer       TEXT,
  category_id        UUID REFERENCES public.store_categories(id) ON DELETE SET NULL,
  cost_price         NUMERIC(10,2),
  retail_price       NUMERIC(10,2),
  msrp               NUMERIC(10,2),
  stock_quantity     INTEGER DEFAULT 0,
  stock_status       TEXT DEFAULT 'out_of_stock'
                     CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'discontinued')),
  weight_lbs         NUMERIC(8,2),
  images             JSONB DEFAULT '[]'::jsonb,
  specs              JSONB DEFAULT '{}'::jsonb,
  is_featured        BOOLEAN DEFAULT false,
  is_active          BOOLEAN DEFAULT true,
  td_synnex_data     JSONB,
  search_vector      TSVECTOR,
  last_synced_at     TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_store_products_search_vector
  ON public.store_products USING GIN (search_vector);

CREATE INDEX IF NOT EXISTS idx_store_products_category_id
  ON public.store_products (category_id);

CREATE INDEX IF NOT EXISTS idx_store_products_sku
  ON public.store_products (sku);

CREATE INDEX IF NOT EXISTS idx_store_products_manufacturer
  ON public.store_products (manufacturer);

CREATE INDEX IF NOT EXISTS idx_store_products_active_featured
  ON public.store_products (is_active, is_featured);

CREATE TRIGGER trg_store_products_updated_at
  BEFORE UPDATE ON public.store_products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Public can read active products
CREATE POLICY "store_products_select_active"
  ON public.store_products FOR SELECT
  USING (is_active = true);


-- =============================================================================
-- FULL-TEXT SEARCH TRIGGER FOR STORE_PRODUCTS
-- =============================================================================
-- Automatically updates search_vector from name, description, manufacturer,
-- sku, and manufacturer_part on insert or update.

CREATE OR REPLACE FUNCTION public.store_products_search_vector_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.manufacturer, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.sku, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.manufacturer_part, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_store_products_search_vector
  BEFORE INSERT OR UPDATE ON public.store_products
  FOR EACH ROW EXECUTE FUNCTION public.store_products_search_vector_update();


-- =============================================================================
-- 3. STORE_PRICING_CONFIG
-- =============================================================================
-- Global pricing defaults. Single-row table for store-wide settings.

CREATE TABLE IF NOT EXISTS public.store_pricing_config (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  default_markup_percent   NUMERIC(5,2) DEFAULT 25.00,
  free_shipping_threshold  NUMERIC(10,2) DEFAULT 99.00,
  flat_shipping_rate       NUMERIC(10,2) DEFAULT 9.99,
  tax_rate                 NUMERIC(5,4) DEFAULT 0.1015,
  store_enabled            BOOLEAN DEFAULT true,
  store_announcement       TEXT,
  updated_at               TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.store_pricing_config ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_store_pricing_config_updated_at
  BEFORE UPDATE ON public.store_pricing_config
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- No public RLS policies. Accessed via service role key only.


-- =============================================================================
-- 4. STORE_PRICING_RULES
-- =============================================================================
-- Per-category markup overrides.

CREATE TABLE IF NOT EXISTS public.store_pricing_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID NOT NULL UNIQUE REFERENCES public.store_categories(id) ON DELETE CASCADE,
  markup_percent  NUMERIC(5,2) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.store_pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_store_pricing_rules_updated_at
  BEFORE UPDATE ON public.store_pricing_rules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- No public RLS policies. Accessed via service role key only.


-- =============================================================================
-- 5. STORE_PRICE_OVERRIDES
-- =============================================================================
-- Manual per-product price overrides with optional expiration.

CREATE TABLE IF NOT EXISTS public.store_price_overrides (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL UNIQUE REFERENCES public.store_products(id) ON DELETE CASCADE,
  override_price  NUMERIC(10,2) NOT NULL,
  reason          TEXT,
  expires_at      TIMESTAMPTZ,
  created_by      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.store_price_overrides ENABLE ROW LEVEL SECURITY;

-- No public RLS policies. Accessed via service role key only.


-- =============================================================================
-- 6. STORE_SAVED_CARTS
-- =============================================================================
-- Server-side cart persistence for logged-in users. One cart per user.

CREATE TABLE IF NOT EXISTS public.store_saved_carts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id  UUID NOT NULL UNIQUE REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  items            JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.store_saved_carts ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_store_saved_carts_updated_at
  BEFORE UPDATE ON public.store_saved_carts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Authenticated users can manage their own cart
CREATE POLICY "store_saved_carts_select_own"
  ON public.store_saved_carts FOR SELECT
  TO authenticated
  USING (user_profile_id = auth.uid());

CREATE POLICY "store_saved_carts_insert_own"
  ON public.store_saved_carts FOR INSERT
  TO authenticated
  WITH CHECK (user_profile_id = auth.uid());

CREATE POLICY "store_saved_carts_update_own"
  ON public.store_saved_carts FOR UPDATE
  TO authenticated
  USING (user_profile_id = auth.uid())
  WITH CHECK (user_profile_id = auth.uid());

CREATE POLICY "store_saved_carts_delete_own"
  ON public.store_saved_carts FOR DELETE
  TO authenticated
  USING (user_profile_id = auth.uid());


-- =============================================================================
-- 7. STORE_WISHLISTS
-- =============================================================================
-- Saved/favorited products per user.

CREATE TABLE IF NOT EXISTS public.store_wishlists (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id  UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  product_id       UUID NOT NULL REFERENCES public.store_products(id) ON DELETE CASCADE,
  added_at         TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_profile_id, product_id)
);

ALTER TABLE public.store_wishlists ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_store_wishlists_user_profile_id
  ON public.store_wishlists (user_profile_id);

-- Authenticated users can manage their own wishlist
CREATE POLICY "store_wishlists_select_own"
  ON public.store_wishlists FOR SELECT
  TO authenticated
  USING (user_profile_id = auth.uid());

CREATE POLICY "store_wishlists_insert_own"
  ON public.store_wishlists FOR INSERT
  TO authenticated
  WITH CHECK (user_profile_id = auth.uid());

CREATE POLICY "store_wishlists_delete_own"
  ON public.store_wishlists FOR DELETE
  TO authenticated
  USING (user_profile_id = auth.uid());


-- =============================================================================
-- 8. STORE_ADDRESSES
-- =============================================================================
-- Saved shipping addresses per user.

CREATE TABLE IF NOT EXISTS public.store_addresses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id  UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  label            TEXT DEFAULT 'Home',
  full_name        TEXT NOT NULL,
  address_line1    TEXT NOT NULL,
  address_line2    TEXT,
  city             TEXT NOT NULL,
  state            TEXT NOT NULL,
  zip_code         TEXT NOT NULL,
  phone            TEXT,
  is_default       BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.store_addresses ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_store_addresses_user_profile_id
  ON public.store_addresses (user_profile_id);

CREATE TRIGGER trg_store_addresses_updated_at
  BEFORE UPDATE ON public.store_addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Authenticated users can manage their own addresses
CREATE POLICY "store_addresses_select_own"
  ON public.store_addresses FOR SELECT
  TO authenticated
  USING (user_profile_id = auth.uid());

CREATE POLICY "store_addresses_insert_own"
  ON public.store_addresses FOR INSERT
  TO authenticated
  WITH CHECK (user_profile_id = auth.uid());

CREATE POLICY "store_addresses_update_own"
  ON public.store_addresses FOR UPDATE
  TO authenticated
  USING (user_profile_id = auth.uid())
  WITH CHECK (user_profile_id = auth.uid());

CREATE POLICY "store_addresses_delete_own"
  ON public.store_addresses FOR DELETE
  TO authenticated
  USING (user_profile_id = auth.uid());


-- =============================================================================
-- 9. STORE_ORDERS
-- =============================================================================
-- Customer orders with full lifecycle tracking from payment through delivery.

CREATE TABLE IF NOT EXISTS public.store_orders (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number             TEXT NOT NULL UNIQUE,
  user_profile_id          UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  customer_email           TEXT NOT NULL,
  customer_name            TEXT NOT NULL,
  status                   TEXT NOT NULL DEFAULT 'pending'
                           CHECK (status IN (
                             'pending', 'payment_confirmed', 'submitted_to_supplier',
                             'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
                           )),
  shipping_address         JSONB NOT NULL,
  billing_address          JSONB,
  subtotal                 NUMERIC(10,2) NOT NULL,
  shipping_cost            NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount               NUMERIC(10,2) NOT NULL DEFAULT 0,
  total                    NUMERIC(10,2) NOT NULL,
  stripe_session_id        TEXT,
  stripe_payment_intent_id TEXT,
  td_synnex_po_number      TEXT,
  td_synnex_order_number   TEXT,
  tracking_number          TEXT,
  tracking_carrier         TEXT,
  notes                    TEXT,
  created_at               TIMESTAMPTZ DEFAULT now(),
  updated_at               TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.store_orders ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_store_orders_user_profile_id
  ON public.store_orders (user_profile_id);

CREATE INDEX IF NOT EXISTS idx_store_orders_customer_email
  ON public.store_orders (customer_email);

CREATE INDEX IF NOT EXISTS idx_store_orders_order_number
  ON public.store_orders (order_number);

CREATE INDEX IF NOT EXISTS idx_store_orders_status
  ON public.store_orders (status);

CREATE INDEX IF NOT EXISTS idx_store_orders_stripe_session_id
  ON public.store_orders (stripe_session_id);

CREATE TRIGGER trg_store_orders_updated_at
  BEFORE UPDATE ON public.store_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Authenticated users can view their own orders (by user_profile_id or email)
CREATE POLICY "store_orders_select_own"
  ON public.store_orders FOR SELECT
  TO authenticated
  USING (
    user_profile_id = auth.uid()
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );


-- =============================================================================
-- 10. STORE_ORDER_ITEMS
-- =============================================================================
-- Line items with frozen price snapshots at time of purchase.

CREATE TABLE IF NOT EXISTS public.store_order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES public.store_orders(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES public.store_products(id) ON DELETE SET NULL,
  sku          TEXT NOT NULL,
  name         TEXT NOT NULL,
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  unit_price   NUMERIC(10,2) NOT NULL,
  unit_cost    NUMERIC(10,2),
  total_price  NUMERIC(10,2) NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.store_order_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_store_order_items_order_id
  ON public.store_order_items (order_id);

-- Authenticated users can view order items for orders they own
CREATE POLICY "store_order_items_select_via_order"
  ON public.store_order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.store_orders o
      WHERE o.id = order_id
      AND (
        o.user_profile_id = auth.uid()
        OR o.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );


-- =============================================================================
-- 11. STORE_SYNC_CONFIG
-- =============================================================================
-- TD Synnex sync metadata and status tracking.

CREATE TABLE IF NOT EXISTS public.store_sync_config (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type          TEXT NOT NULL UNIQUE
                     CHECK (sync_type IN ('catalog', 'stock', 'order_status')),
  last_sync_at       TIMESTAMPTZ,
  last_sync_status   TEXT DEFAULT 'never'
                     CHECK (last_sync_status IN ('never', 'success', 'error', 'running')),
  last_sync_message  TEXT,
  product_count      INTEGER DEFAULT 0,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.store_sync_config ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_store_sync_config_updated_at
  BEFORE UPDATE ON public.store_sync_config
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- No public RLS policies. Accessed via service role key only.


-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Sync config rows (one per sync type)
INSERT INTO public.store_sync_config (sync_type, last_sync_status)
VALUES
  ('catalog',      'never'),
  ('stock',        'never'),
  ('order_status', 'never')
ON CONFLICT (sync_type) DO NOTHING;

-- Global pricing config (single row with defaults)
INSERT INTO public.store_pricing_config (
  default_markup_percent,
  free_shipping_threshold,
  flat_shipping_rate,
  tax_rate,
  store_enabled
)
VALUES (25.00, 99.00, 9.99, 0.1015, true);

-- Sample product categories
INSERT INTO public.store_categories (name, slug, sort_order) VALUES
  ('Laptops',       'laptops',       1),
  ('Desktops',      'desktops',      2),
  ('Monitors',      'monitors',      3),
  ('Accessories',   'accessories',   4),
  ('Networking',    'networking',    5),
  ('Storage',       'storage',       6),
  ('Peripherals',   'peripherals',   7),
  ('Software',      'software',      8)
ON CONFLICT (slug) DO NOTHING;
