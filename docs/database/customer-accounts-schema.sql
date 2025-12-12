-- =============================================================================
-- Customer Accounts Schema
-- =============================================================================
--
-- Purpose: Store customer portal login credentials
-- Auth Flow: RepairShopr (employees) → Supabase (customers)
--
-- This table stores customer account information for the customer portal.
-- Employees authenticate via RepairShopr API, customers via this table.
-- =============================================================================

-- Create customer_accounts table
CREATE TABLE IF NOT EXISTS customer_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  repairshopr_customer_id INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on repairshopr_customer_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_customer_accounts_repairshopr_id
  ON customer_accounts(repairshopr_customer_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_customer_accounts_updated_at
  BEFORE UPDATE ON customer_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE customer_accounts ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read their own account (for future customer portal features)
CREATE POLICY customer_accounts_select_own
  ON customer_accounts
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Policy: Service role can do anything (for admin operations)
CREATE POLICY customer_accounts_service_role_all
  ON customer_accounts
  FOR ALL
  USING (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON TABLE customer_accounts IS 'Customer portal login credentials. Linked to RepairShopr customer records.';
COMMENT ON COLUMN customer_accounts.email IS 'Customer email address (unique login identifier)';
COMMENT ON COLUMN customer_accounts.password_hash IS 'bcrypt hashed password';
COMMENT ON COLUMN customer_accounts.repairshopr_customer_id IS 'Foreign key to RepairShopr customer record';
COMMENT ON INDEX idx_customer_accounts_repairshopr_id IS 'Fast lookup by RepairShopr customer ID';
