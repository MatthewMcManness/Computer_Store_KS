-- Migration: Create businesses table and link customers
-- This creates a proper businesses entity from the business_name field on customers

-- 1. Create the businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add business_id column to rs_customers
ALTER TABLE rs_customers
  ADD COLUMN IF NOT EXISTS business_id INTEGER REFERENCES businesses(id);

-- 3. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_rs_customers_business_id ON rs_customers(business_id);
CREATE INDEX IF NOT EXISTS idx_businesses_name ON businesses(name);

-- 4. Populate businesses table from existing customer business_name values
INSERT INTO businesses (name)
SELECT DISTINCT business_name
FROM rs_customers
WHERE business_name IS NOT NULL AND business_name != ''
ON CONFLICT (name) DO NOTHING;

-- 5. Link existing customers to their businesses
UPDATE rs_customers c
SET business_id = b.id
FROM businesses b
WHERE c.business_name = b.name
  AND c.business_name IS NOT NULL
  AND c.business_name != '';

-- 6. Create a function to auto-link customers on insert/update
CREATE OR REPLACE FUNCTION link_customer_to_business()
RETURNS TRIGGER AS $$
BEGIN
  -- If customer has a business_name, ensure business exists and link
  IF NEW.business_name IS NOT NULL AND NEW.business_name != '' THEN
    -- Insert business if it doesn't exist
    INSERT INTO businesses (name)
    VALUES (NEW.business_name)
    ON CONFLICT (name) DO NOTHING;

    -- Get the business_id
    SELECT id INTO NEW.business_id
    FROM businesses
    WHERE name = NEW.business_name;
  ELSE
    NEW.business_id := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger to auto-link on customer insert/update
DROP TRIGGER IF EXISTS trg_link_customer_business ON rs_customers;
CREATE TRIGGER trg_link_customer_business
  BEFORE INSERT OR UPDATE OF business_name ON rs_customers
  FOR EACH ROW
  EXECUTE FUNCTION link_customer_to_business();

-- 8. Update timestamp trigger for businesses
CREATE OR REPLACE FUNCTION update_businesses_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_businesses_updated_at ON businesses;
CREATE TRIGGER trg_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_businesses_timestamp();
