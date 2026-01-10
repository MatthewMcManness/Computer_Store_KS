-- =============================================================================
-- Migration: Remove Bronze and Gold tiers from Protection Plans
-- =============================================================================
--
-- Purpose: Simplify protection plan tiers to only 3 valid values:
--   - eset (ESET antivirus)
--   - silver (basic paid plan)
--   - silver-plus (premium paid plan, formerly "gold" in RepairShopr)
--
-- This migration:
--   1. Migrates 'gold' values to 'silver-plus' (RepairShopr gold = our silver-plus)
--   2. Removes 'bronze' values (sets to null)
--   3. Updates the CHECK constraint to only allow valid tiers
--
-- Run this in Supabase SQL Editor
-- =============================================================================

-- ============================================================================
-- STEP 1: Migrate existing data in customer_silver_plans
-- ============================================================================

-- Migrate 'gold' to 'silver-plus' (RepairShopr's gold maps to our silver-plus)
UPDATE customer_silver_plans
SET plan_tier = 'silver-plus', updated_at = NOW()
WHERE plan_tier = 'gold';

-- Remove 'bronze' (set to null since we're not using bronze tier)
UPDATE customer_silver_plans
SET plan_tier = NULL, is_silver_plan = false, updated_at = NOW()
WHERE plan_tier = 'bronze';

-- ============================================================================
-- STEP 2: Migrate existing data in asset_protection_plans (if any)
-- ============================================================================
-- Note: asset_protection_plans already has the correct constraint,
-- but we should clean up any stale data just in case

UPDATE asset_protection_plans
SET plan_tier = 'silver-plus', updated_at = NOW()
WHERE plan_tier = 'gold';

UPDATE asset_protection_plans
SET plan_tier = NULL, updated_at = NOW()
WHERE plan_tier = 'bronze';

-- ============================================================================
-- STEP 3: Update customer_silver_plans constraint
-- ============================================================================

-- Drop the old constraint
ALTER TABLE customer_silver_plans
DROP CONSTRAINT IF EXISTS valid_plan_tier;

-- Add the new constraint with only valid tiers: eset, silver, silver-plus
ALTER TABLE customer_silver_plans
ADD CONSTRAINT valid_plan_tier
CHECK (plan_tier IS NULL OR plan_tier IN ('eset', 'silver', 'silver-plus'));

-- ============================================================================
-- STEP 4: Update asset_protection_plans constraint (already correct, but ensure)
-- ============================================================================

-- Drop the old constraint (in case it somehow had bronze/gold)
ALTER TABLE asset_protection_plans
DROP CONSTRAINT IF EXISTS asset_protection_plans_plan_tier_check;

-- Recreate with only valid tiers
ALTER TABLE asset_protection_plans
ADD CONSTRAINT asset_protection_plans_plan_tier_check
CHECK (plan_tier IS NULL OR plan_tier IN ('eset', 'silver', 'silver-plus'));

-- ============================================================================
-- STEP 5: Update column comments
-- ============================================================================

COMMENT ON COLUMN customer_silver_plans.plan_tier IS 'Protection plan tier: eset, silver, silver-plus, or null (no plan)';
COMMENT ON COLUMN asset_protection_plans.plan_tier IS 'Protection plan tier: eset, silver, silver-plus, or null (no plan)';

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run these queries to verify the migration was successful:

-- Check that no bronze or gold values remain
SELECT 'customer_silver_plans' as table_name, plan_tier, COUNT(*) as count
FROM customer_silver_plans
WHERE plan_tier IN ('bronze', 'gold')
GROUP BY plan_tier
UNION ALL
SELECT 'asset_protection_plans', plan_tier, COUNT(*)
FROM asset_protection_plans
WHERE plan_tier IN ('bronze', 'gold')
GROUP BY plan_tier;
-- Expected result: empty (no rows)

-- Verify constraints are correct
SELECT conrelid::regclass AS table_name, conname AS constraint_name, pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid IN ('customer_silver_plans'::regclass, 'asset_protection_plans'::regclass)
AND contype = 'c'
AND conname LIKE '%plan_tier%';
-- Expected: Both should show (plan_tier IS NULL OR plan_tier IN ('eset', 'silver', 'silver-plus'))

-- Show current plan tier distribution
SELECT 'customer_silver_plans' as table_name, plan_tier, COUNT(*) as count
FROM customer_silver_plans
GROUP BY plan_tier
UNION ALL
SELECT 'asset_protection_plans', plan_tier, COUNT(*)
FROM asset_protection_plans
GROUP BY plan_tier
ORDER BY 1, 2;
