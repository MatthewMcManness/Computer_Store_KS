-- =============================================================================
-- Migration: Add plan_tier column to customer_silver_plans
-- =============================================================================
--
-- Purpose: Add support for multiple protection plan tiers (bronze, silver, silver-plus, gold)
-- The is_silver_plan column is kept for backwards compatibility
--
-- Run this in Supabase SQL Editor
-- =============================================================================

-- Add the plan_tier column
ALTER TABLE customer_silver_plans
ADD COLUMN IF NOT EXISTS plan_tier TEXT;

-- Add a check constraint for valid tier values
ALTER TABLE customer_silver_plans
ADD CONSTRAINT valid_plan_tier
CHECK (plan_tier IS NULL OR plan_tier IN ('bronze', 'silver', 'silver-plus', 'gold'));

-- Migrate existing data: set plan_tier based on is_silver_plan
UPDATE customer_silver_plans
SET plan_tier = 'silver'
WHERE is_silver_plan = true AND plan_tier IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN customer_silver_plans.plan_tier IS 'Protection plan tier: bronze, silver, silver-plus, gold, or null for no plan';
