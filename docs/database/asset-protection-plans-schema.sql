-- Asset Protection Plans Schema
-- Migration: Move protection plans from customer level to asset level
-- Silver and Silver-plus plans apply to individual devices (assets)

-- Create asset protection plans table
CREATE TABLE IF NOT EXISTS asset_protection_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairshopr_asset_id INTEGER NOT NULL,
  repairshopr_customer_id INTEGER NOT NULL,
  plan_tier TEXT CHECK (plan_tier IS NULL OR plan_tier IN ('eset', 'silver', 'silver-plus')),
  eset_status TEXT CHECK (eset_status IS NULL OR eset_status IN ('protected', 'expired', 'unprotected')),
  eset_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(repairshopr_asset_id)
);

-- Create index for faster lookups by customer
CREATE INDEX IF NOT EXISTS idx_asset_plans_customer_id ON asset_protection_plans(repairshopr_customer_id);

-- Create index for faster lookups by asset
CREATE INDEX IF NOT EXISTS idx_asset_plans_asset_id ON asset_protection_plans(repairshopr_asset_id);

-- Enable RLS
ALTER TABLE asset_protection_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all plans
CREATE POLICY "Allow authenticated read access" ON asset_protection_plans
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow service role full access
CREATE POLICY "Allow service role full access" ON asset_protection_plans
  FOR ALL
  TO service_role
  USING (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_asset_plan_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update timestamp
DROP TRIGGER IF EXISTS asset_plan_updated_at ON asset_protection_plans;
CREATE TRIGGER asset_plan_updated_at
  BEFORE UPDATE ON asset_protection_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_asset_plan_timestamp();

-- View to get customer protection status based on their assets
CREATE OR REPLACE VIEW customer_protection_summary AS
SELECT
  repairshopr_customer_id,
  COUNT(*) FILTER (WHERE plan_tier IS NOT NULL) AS protected_asset_count,
  COUNT(*) AS total_assets_with_records,
  BOOL_OR(plan_tier IN ('silver', 'silver-plus')) AS has_paid_plan,
  ARRAY_AGG(DISTINCT plan_tier) FILTER (WHERE plan_tier IS NOT NULL) AS plan_tiers
FROM asset_protection_plans
GROUP BY repairshopr_customer_id;

-- Migration: Copy existing customer plans to their first asset (if any)
-- This would need to be run with actual asset data
-- INSERT INTO asset_protection_plans (repairshopr_asset_id, repairshopr_customer_id, plan_tier)
-- SELECT
--   a.repairshopr_id,
--   csp.repairshopr_customer_id,
--   csp.plan_tier
-- FROM customer_silver_plans csp
-- JOIN rs_assets a ON a.customer_id = csp.repairshopr_customer_id
-- WHERE csp.plan_tier IS NOT NULL
-- ON CONFLICT (repairshopr_asset_id) DO NOTHING;
