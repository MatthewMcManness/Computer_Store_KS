-- Migration: Add repairshopr_location_id to locations table
-- Maps Supabase location UUIDs to RepairShopr integer location IDs
-- Also makes customers location-agnostic (drop location_id constraint)

-- 1. Add repairshopr_location_id column to locations table
ALTER TABLE locations ADD COLUMN repairshopr_location_id INTEGER UNIQUE;

-- 2. Set known RepairShopr location IDs
UPDATE locations SET repairshopr_location_id = 3311 WHERE slug = 'topeka';
UPDATE locations SET repairshopr_location_id = 3310 WHERE slug = 'holton';

-- 3. Add location_id column to rs_tickets (references locations.id)
ALTER TABLE rs_tickets ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

-- 4. Add location_id column to rs_invoices
ALTER TABLE rs_invoices ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

-- 5. Add location_id column to rs_payments
ALTER TABLE rs_payments ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

-- 6. Add location_id column to rs_assets
ALTER TABLE rs_assets ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

-- 7. Make customers location-agnostic: NULL out location_id on rs_customers
-- Customers can visit either location and shouldn't be locked to one
UPDATE rs_customers SET location_id = NULL WHERE location_id IS NOT NULL;
