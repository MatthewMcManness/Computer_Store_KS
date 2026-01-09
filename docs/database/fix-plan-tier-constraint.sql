-- =============================================================================
-- Fix: Update valid_plan_tier constraint to include silver-plus
-- =============================================================================
--
-- Issue: The constraint was created without 'silver-plus' as a valid value
-- This causes "violates check constraint" errors when saving Silver Plus plans
--
-- Run this in Supabase SQL Editor
-- =============================================================================

-- Drop the old constraint (it's missing 'silver-plus')
ALTER TABLE customer_silver_plans
DROP CONSTRAINT IF EXISTS valid_plan_tier;

-- Add the corrected constraint with ALL valid tiers
ALTER TABLE customer_silver_plans
ADD CONSTRAINT valid_plan_tier
CHECK (plan_tier IS NULL OR plan_tier IN ('bronze', 'silver', 'silver-plus', 'gold'));

-- Verify the fix worked
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'customer_silver_plans'::regclass
AND conname = 'valid_plan_tier';
