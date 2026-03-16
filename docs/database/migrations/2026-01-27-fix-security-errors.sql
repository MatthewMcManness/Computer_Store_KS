-- =============================================================================
-- Security Fix: SECURITY DEFINER view + RLS on businesses & locations
-- =============================================================================
-- Created: 2026-01-27
-- =============================================================================

-- =============================================================================
-- Fix 1: Recreate customer_protection_summary as SECURITY INVOKER (default)
-- =============================================================================
-- The view was created with SECURITY DEFINER, meaning it runs with the
-- creator's permissions rather than the querying user's. Recreate without it.

DROP VIEW IF EXISTS customer_protection_summary;

CREATE VIEW customer_protection_summary
WITH (security_invoker = on) AS
SELECT
  repairshopr_customer_id,
  COUNT(*) FILTER (WHERE plan_tier IS NOT NULL) AS protected_asset_count,
  COUNT(*) AS total_assets_with_records,
  BOOL_OR(plan_tier IN ('silver', 'silver-plus')) AS has_paid_plan,
  ARRAY_AGG(DISTINCT plan_tier) FILTER (WHERE plan_tier IS NOT NULL) AS plan_tiers
FROM asset_protection_plans
GROUP BY repairshopr_customer_id;

-- =============================================================================
-- Fix 2: Enable RLS on businesses table
-- =============================================================================

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Service role full access (backend operations)
CREATE POLICY "Service role full access to businesses"
ON businesses FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Staff can read all businesses
CREATE POLICY "Staff can read businesses"
ON businesses FOR SELECT
TO authenticated
USING (is_staff(auth.uid()));

-- Staff can manage businesses
CREATE POLICY "Staff can manage businesses"
ON businesses FOR INSERT
TO authenticated
WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Staff can update businesses"
ON businesses FOR UPDATE
TO authenticated
USING (is_staff(auth.uid()))
WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Staff can delete businesses"
ON businesses FOR DELETE
TO authenticated
USING (is_staff(auth.uid()));

-- =============================================================================
-- Fix 3: Enable RLS on locations table
-- =============================================================================

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Service role full access (backend operations)
CREATE POLICY "Service role full access to locations"
ON locations FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- All authenticated users can read locations (needed for location picker)
CREATE POLICY "Authenticated users can read locations"
ON locations FOR SELECT
TO authenticated
USING (true);

-- Only admin can manage locations
CREATE POLICY "Admin can manage locations"
ON locations FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin can update locations"
ON locations FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin can delete locations"
ON locations FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));
