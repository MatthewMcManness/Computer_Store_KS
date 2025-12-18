-- =============================================================================
-- Customer Silver Plans Schema
-- =============================================================================
--
-- Purpose: Store customer silver plan status
-- This allows toggling silver plan status independently of RepairShopr
--
-- =============================================================================

-- Create customer_silver_plans table
CREATE TABLE IF NOT EXISTS customer_silver_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairshopr_customer_id INTEGER NOT NULL UNIQUE,
  is_silver_plan BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on repairshopr_customer_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_customer_silver_plans_customer_id
  ON customer_silver_plans(repairshopr_customer_id);

-- Create trigger to auto-update updated_at (reuse existing function if available)
CREATE TRIGGER update_customer_silver_plans_updated_at
  BEFORE UPDATE ON customer_silver_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE customer_silver_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do anything (for admin operations)
CREATE POLICY customer_silver_plans_service_role_all
  ON customer_silver_plans
  FOR ALL
  USING (auth.role() = 'service_role');

-- Policy: Public can read (for customer portal to see their status)
CREATE POLICY customer_silver_plans_public_select
  ON customer_silver_plans
  FOR SELECT
  TO public
  USING (true);

-- Comments for documentation
COMMENT ON TABLE customer_silver_plans IS 'Stores customer silver plan status for display purposes';
COMMENT ON COLUMN customer_silver_plans.repairshopr_customer_id IS 'Foreign key to RepairShopr customer record';
COMMENT ON COLUMN customer_silver_plans.is_silver_plan IS 'Whether customer has silver plan';
COMMENT ON INDEX idx_customer_silver_plans_customer_id IS 'Fast lookup by RepairShopr customer ID';
