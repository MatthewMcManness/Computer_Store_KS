-- ============================================================================
-- Multi-Location Support Migration
-- ============================================================================
-- This migration adds location-based data isolation support.
--
-- Design:
-- - locations table stores each business location
-- - All data tables get location_id column (for location-based filtering)
-- - owner and lead_developer roles can access ALL locations
-- - Other roles only see data at their assigned location
-- - New records inherit the creator's location
--
-- Tables modified:
-- - user_profiles (employees belong to a location)
-- - rs_customers (customers)
-- - rs_tickets (tickets/work orders)
-- - rs_invoices (invoices)
-- - rs_assets (devices)
-- - rs_payments (payments)
-- - rs_products (inventory)
-- - businesses (business accounts)
-- - ticket_public_notes (public ticket notes)
-- - customer_accounts (customer portal accounts)
-- - gallery_computers (computers for sale)
--
-- Initial data:
-- - 'topeka' location created as default (ALL existing data assigned here)
-- - 'holton' location created (future expansion, not open yet)
--
-- Run this AFTER the RBAC migration (rbac-migration.sql)
-- ============================================================================

-- ============================================================================
-- STEP 1: Create locations table
-- ============================================================================

CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,           -- URL-friendly identifier (e.g., 'topeka', 'holton')
  name TEXT NOT NULL,                   -- Display name (e.g., 'Topeka', 'Holton')
  address TEXT,                         -- Full address
  phone TEXT,                           -- Location phone number
  email TEXT,                           -- Location email
  timezone TEXT DEFAULT 'America/Chicago',
  is_active BOOLEAN DEFAULT true,       -- Whether location is operational
  sort_order INTEGER DEFAULT 0,         -- For display ordering
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_locations_slug ON locations(slug);
CREATE INDEX IF NOT EXISTS idx_locations_active ON locations(is_active) WHERE is_active = true;

-- ============================================================================
-- STEP 2: Insert initial locations
-- ============================================================================

-- Topeka is the main/default location (all existing data)
INSERT INTO locations (slug, name, address, phone, email, is_active, sort_order)
VALUES (
  'topeka',
  'Topeka',
  '2301 SW Chelsea Dr, Topeka, KS 66614',
  '(785) 354-4243',
  'contact@computerstoreks.com',
  true,
  1
) ON CONFLICT (slug) DO NOTHING;

-- Holton is a future location (not open yet)
INSERT INTO locations (slug, name, address, phone, email, is_active, sort_order)
VALUES (
  'holton',
  'Holton',
  NULL,  -- Address TBD
  NULL,  -- Phone TBD
  NULL,  -- Email TBD
  false, -- Not active yet
  2
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- STEP 3: Add location_id to user_profiles
-- ============================================================================

-- Add location_id column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

-- Get the Topeka location ID and set as default for all existing employees
DO $$
DECLARE
  topeka_id UUID;
BEGIN
  SELECT id INTO topeka_id FROM locations WHERE slug = 'topeka';

  -- Update all existing employee profiles to Topeka
  UPDATE user_profiles
  SET location_id = topeka_id
  WHERE location_id IS NULL
    AND role != 'customer';
END $$;

-- Create index for efficient location-based queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location_id);

-- ============================================================================
-- STEP 4: Add location_id to rs_tickets table
-- ============================================================================

ALTER TABLE rs_tickets
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

DO $$
DECLARE
  topeka_id UUID;
BEGIN
  SELECT id INTO topeka_id FROM locations WHERE slug = 'topeka';
  UPDATE rs_tickets SET location_id = topeka_id WHERE location_id IS NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_rs_tickets_location ON rs_tickets(location_id);

-- ============================================================================
-- STEP 5: Add location_id to rs_customers table
-- ============================================================================

ALTER TABLE rs_customers
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

DO $$
DECLARE
  topeka_id UUID;
BEGIN
  SELECT id INTO topeka_id FROM locations WHERE slug = 'topeka';
  UPDATE rs_customers SET location_id = topeka_id WHERE location_id IS NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_rs_customers_location ON rs_customers(location_id);

-- ============================================================================
-- STEP 5.1: Add location_id to rs_invoices table
-- ============================================================================

ALTER TABLE rs_invoices
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

DO $$
DECLARE
  topeka_id UUID;
BEGIN
  SELECT id INTO topeka_id FROM locations WHERE slug = 'topeka';
  UPDATE rs_invoices SET location_id = topeka_id WHERE location_id IS NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_rs_invoices_location ON rs_invoices(location_id);

-- ============================================================================
-- STEP 5.2: Add location_id to businesses table
-- ============================================================================

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

DO $$
DECLARE
  topeka_id UUID;
BEGIN
  SELECT id INTO topeka_id FROM locations WHERE slug = 'topeka';
  UPDATE businesses SET location_id = topeka_id WHERE location_id IS NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses(location_id);

-- ============================================================================
-- STEP 5.3: Add location_id to rs_assets table (devices)
-- ============================================================================

ALTER TABLE rs_assets
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

DO $$
DECLARE
  topeka_id UUID;
BEGIN
  SELECT id INTO topeka_id FROM locations WHERE slug = 'topeka';
  UPDATE rs_assets SET location_id = topeka_id WHERE location_id IS NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_rs_assets_location ON rs_assets(location_id);

-- ============================================================================
-- STEP 5.4: Add location_id to rs_payments table
-- ============================================================================

ALTER TABLE rs_payments
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

DO $$
DECLARE
  topeka_id UUID;
BEGIN
  SELECT id INTO topeka_id FROM locations WHERE slug = 'topeka';
  UPDATE rs_payments SET location_id = topeka_id WHERE location_id IS NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_rs_payments_location ON rs_payments(location_id);

-- ============================================================================
-- STEP 5.5: Add location_id to rs_products table (inventory)
-- ============================================================================
-- Note: rs_products already has a location_id INTEGER column from RepairShopr.
-- We rename it to rs_location_id to avoid conflict with our UUID location_id.

-- First, rename the existing RepairShopr location_id column (if it exists and is INTEGER)
DO $$
BEGIN
  -- Check if location_id exists and is INTEGER type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rs_products'
    AND column_name = 'location_id'
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE rs_products RENAME COLUMN location_id TO rs_location_id;
  END IF;
END $$;

-- Now add our UUID location_id column
ALTER TABLE rs_products
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

DO $$
DECLARE
  topeka_id UUID;
BEGIN
  SELECT id INTO topeka_id FROM locations WHERE slug = 'topeka';
  UPDATE rs_products SET location_id = topeka_id WHERE location_id IS NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_rs_products_location ON rs_products(location_id);

-- ============================================================================
-- STEP 5.6: Add location_id to ticket_public_notes table
-- ============================================================================

ALTER TABLE ticket_public_notes
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

DO $$
DECLARE
  topeka_id UUID;
BEGIN
  SELECT id INTO topeka_id FROM locations WHERE slug = 'topeka';
  UPDATE ticket_public_notes SET location_id = topeka_id WHERE location_id IS NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_ticket_public_notes_location ON ticket_public_notes(location_id);

-- ============================================================================
-- STEP 5.7: Add location_id to customer_accounts table
-- ============================================================================

ALTER TABLE customer_accounts
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

DO $$
DECLARE
  topeka_id UUID;
BEGIN
  SELECT id INTO topeka_id FROM locations WHERE slug = 'topeka';
  UPDATE customer_accounts SET location_id = topeka_id WHERE location_id IS NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_customer_accounts_location ON customer_accounts(location_id);

-- ============================================================================
-- STEP 5.8: Add location_id to gallery_computers table
-- ============================================================================

ALTER TABLE gallery_computers
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

DO $$
DECLARE
  topeka_id UUID;
BEGIN
  SELECT id INTO topeka_id FROM locations WHERE slug = 'topeka';
  UPDATE gallery_computers SET location_id = topeka_id WHERE location_id IS NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_gallery_computers_location ON gallery_computers(location_id);

-- ============================================================================
-- STEP 6: Create helper function to check if user can access all locations
-- ============================================================================

CREATE OR REPLACE FUNCTION can_access_all_locations(user_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  -- Owner and lead_developer can access all locations
  RETURN (
    'owner' = ANY(user_roles) OR
    'lead_developer' = ANY(user_roles) OR
    'admin' = ANY(user_roles)  -- Legacy admin role
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- STEP 7: Create helper function to get user's location_id
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_location_id(user_id UUID)
RETURNS UUID AS $$
DECLARE
  loc_id UUID;
BEGIN
  SELECT location_id INTO loc_id FROM user_profiles WHERE id = user_id;
  RETURN loc_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- STEP 8: Update RLS policies for location-based filtering
-- ============================================================================

-- Example RLS policy for user_profiles (employees see only their location)
-- Note: owner/lead_developer bypass this via can_access_all_locations()

-- DROP POLICY IF EXISTS "Employees see users at their location" ON user_profiles;
-- CREATE POLICY "Employees see users at their location" ON user_profiles
--   FOR SELECT
--   USING (
--     -- Customers see only themselves
--     (role = 'customer' AND auth.uid() = id)
--     OR
--     -- Owners/lead_developers see all
--     can_access_all_locations(
--       (SELECT roles FROM user_profiles WHERE id = auth.uid())
--     )
--     OR
--     -- Other employees see their location only
--     (
--       role != 'customer'
--       AND location_id = get_user_location_id(auth.uid())
--     )
--   );

-- ============================================================================
-- STEP 9: Assign specific user roles
-- ============================================================================
-- Note: This step requires the RBAC migration (rbac-migration.sql) to be run first.
-- If 'roles' column doesn't exist, this step will be skipped gracefully.

DO $$
BEGIN
  -- Only run if roles column exists (RBAC migration was run)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'roles'
  ) THEN
    -- Set matthewmcmanness@gmail.com as lead_developer
    UPDATE user_profiles
    SET roles = ARRAY['lead_developer'],
        role = 'admin'  -- Keep legacy role for backwards compatibility
    WHERE email = 'matthewmcmanness@gmail.com';

    -- Set owner@computerstoreks.com as owner
    UPDATE user_profiles
    SET roles = ARRAY['owner'],
        role = 'admin'  -- Keep legacy role for backwards compatibility
    WHERE email = 'owner@computerstoreks.com';

    -- Also update owner@thecomputerstoreks.com if it exists
    UPDATE user_profiles
    SET roles = ARRAY['owner'],
        role = 'admin'
    WHERE email = 'owner@thecomputerstoreks.com';

    -- Also update joseph@thecomputerstoreks.com as owner if it exists
    UPDATE user_profiles
    SET roles = ARRAY['owner'],
        role = 'admin'
    WHERE email = 'joseph@thecomputerstoreks.com';

    RAISE NOTICE 'User roles assigned successfully';
  ELSE
    RAISE NOTICE 'Skipping role assignments - roles column not found. Run rbac-migration.sql first.';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify locations were created
-- SELECT * FROM locations ORDER BY sort_order;

-- Verify employees have location assigned
-- SELECT id, email, role, roles, location_id,
--        (SELECT name FROM locations WHERE id = location_id) as location_name
-- FROM user_profiles
-- WHERE role != 'customer';

-- Check location distribution across all tables
-- SELECT
--   'user_profiles' as table_name,
--   l.name as location_name,
--   COUNT(up.id) as record_count
-- FROM locations l
-- LEFT JOIN user_profiles up ON up.location_id = l.id AND up.role != 'customer'
-- GROUP BY l.id, l.name
-- UNION ALL
-- SELECT 'rs_customers', l.name, COUNT(c.id)
-- FROM locations l LEFT JOIN rs_customers c ON c.location_id = l.id
-- GROUP BY l.id, l.name
-- UNION ALL
-- SELECT 'rs_tickets', l.name, COUNT(t.id)
-- FROM locations l LEFT JOIN rs_tickets t ON t.location_id = l.id
-- GROUP BY l.id, l.name
-- UNION ALL
-- SELECT 'rs_invoices', l.name, COUNT(i.id)
-- FROM locations l LEFT JOIN rs_invoices i ON i.location_id = l.id
-- GROUP BY l.id, l.name
-- UNION ALL
-- SELECT 'businesses', l.name, COUNT(b.id)
-- FROM locations l LEFT JOIN businesses b ON b.location_id = l.id
-- GROUP BY l.id, l.name
-- UNION ALL
-- SELECT 'rs_assets', l.name, COUNT(a.id)
-- FROM locations l LEFT JOIN rs_assets a ON a.location_id = l.id
-- GROUP BY l.id, l.name
-- UNION ALL
-- SELECT 'rs_payments', l.name, COUNT(p.id)
-- FROM locations l LEFT JOIN rs_payments p ON p.location_id = l.id
-- GROUP BY l.id, l.name
-- UNION ALL
-- SELECT 'rs_products', l.name, COUNT(pr.id)
-- FROM locations l LEFT JOIN rs_products pr ON pr.location_id = l.id
-- GROUP BY l.id, l.name
-- UNION ALL
-- SELECT 'gallery_computers', l.name, COUNT(g.id)
-- FROM locations l LEFT JOIN gallery_computers g ON g.location_id = l.id
-- GROUP BY l.id, l.name
-- ORDER BY table_name, location_name;

-- Verify role assignments for owner and lead_developer
-- SELECT email, role, roles, location_id
-- FROM user_profiles
-- WHERE email IN (
--   'matthewmcmanness@gmail.com',
--   'owner@computerstoreks.com',
--   'owner@thecomputerstoreks.com',
--   'joseph@thecomputerstoreks.com'
-- );

-- Quick count of records by location (all tables)
-- SELECT
--   l.name,
--   (SELECT COUNT(*) FROM user_profiles WHERE location_id = l.id AND role != 'customer') as employees,
--   (SELECT COUNT(*) FROM rs_customers WHERE location_id = l.id) as customers,
--   (SELECT COUNT(*) FROM rs_tickets WHERE location_id = l.id) as tickets,
--   (SELECT COUNT(*) FROM rs_invoices WHERE location_id = l.id) as invoices,
--   (SELECT COUNT(*) FROM businesses WHERE location_id = l.id) as businesses,
--   (SELECT COUNT(*) FROM rs_assets WHERE location_id = l.id) as assets,
--   (SELECT COUNT(*) FROM rs_payments WHERE location_id = l.id) as payments,
--   (SELECT COUNT(*) FROM rs_products WHERE location_id = l.id) as products,
--   (SELECT COUNT(*) FROM gallery_computers WHERE location_id = l.id) as gallery
-- FROM locations l
-- ORDER BY l.sort_order;
