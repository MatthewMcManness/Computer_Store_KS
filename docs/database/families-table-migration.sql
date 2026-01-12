-- Migration: Create families table for customer family groupings
-- Families allow grouping customers (like households) independently from businesses
-- Created: 2026-01-12

-- 1. Create the families table
CREATE TABLE IF NOT EXISTS families (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location_id INTEGER REFERENCES locations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add family_id column to rs_customers
ALTER TABLE rs_customers
  ADD COLUMN IF NOT EXISTS family_id INTEGER REFERENCES families(id);

-- 3. Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_rs_customers_family_id ON rs_customers(family_id);
CREATE INDEX IF NOT EXISTS idx_families_name ON families(name);
CREATE INDEX IF NOT EXISTS idx_families_location_id ON families(location_id);

-- 4. Update timestamp trigger for families
CREATE OR REPLACE FUNCTION update_families_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_families_updated_at ON families;
CREATE TRIGGER trg_families_updated_at
  BEFORE UPDATE ON families
  FOR EACH ROW
  EXECUTE FUNCTION update_families_timestamp();

-- 5. Enable Row Level Security (RLS) on families table
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for families
-- Policy: Authenticated users can read families
CREATE POLICY "Authenticated users can read families"
ON families FOR SELECT
TO authenticated
USING (true);

-- Policy: Authenticated users can insert families
CREATE POLICY "Authenticated users can insert families"
ON families FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Authenticated users can update families
CREATE POLICY "Authenticated users can update families"
ON families FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Authenticated users can delete empty families
CREATE POLICY "Authenticated users can delete families"
ON families FOR DELETE
TO authenticated
USING (true);

-- Note: The application enforces additional location-based access control
-- via the getEffectiveLocationId() function in the API layer
