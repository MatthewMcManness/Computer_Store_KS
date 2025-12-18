-- =============================================================================
-- Customer Protection Plans Migration
-- =============================================================================
--
-- Purpose: Migrate from silver-only to Bronze/Silver/Gold tiers
-- Bronze is only stored in Supabase (not in RepairShopr)
-- Silver and Gold are synced with RepairShopr
--
-- =============================================================================

-- Add plan_tier column to store the tier name
ALTER TABLE customer_silver_plans
ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT NULL;

-- Add constraint to ensure valid tier values
ALTER TABLE customer_silver_plans
DROP CONSTRAINT IF EXISTS valid_plan_tier;

ALTER TABLE customer_silver_plans
ADD CONSTRAINT valid_plan_tier
CHECK (plan_tier IS NULL OR plan_tier IN ('bronze', 'silver', 'gold'));

-- Migrate existing data: is_silver_plan = true becomes plan_tier = 'silver'
UPDATE customer_silver_plans
SET plan_tier = 'silver'
WHERE is_silver_plan = true AND plan_tier IS NULL;

-- Update comments
COMMENT ON COLUMN customer_silver_plans.plan_tier IS 'Protection plan tier: bronze, silver, gold, or null (none)';
COMMENT ON TABLE customer_silver_plans IS 'Stores customer protection plan status (Bronze, Silver, Gold tiers)';
