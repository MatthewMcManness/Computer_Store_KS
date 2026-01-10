-- ============================================================================
-- Assets Updated Migration
-- Version: 1.0
-- Created: 2026-01-10
-- Description: Adds assets_updated flag to rs_customers for protection plan
--              migration tracking. When FALSE, protection plans are sourced
--              from RepairShopr customer-level tracking. When TRUE, plans are
--              sourced from asset-level tracking in our asset_protection_plans.
-- ============================================================================

-- Add assets_updated column with default FALSE for existing customers
ALTER TABLE rs_customers
ADD COLUMN IF NOT EXISTS assets_updated BOOLEAN DEFAULT FALSE;

-- Add index for filtering by migration status
CREATE INDEX IF NOT EXISTS idx_rs_customers_assets_updated ON rs_customers(assets_updated);

-- Add comment explaining the column
COMMENT ON COLUMN rs_customers.assets_updated IS
  'Migration flag for protection plan tracking. FALSE = use RepairShopr customer-level plans, TRUE = use asset-level plans from asset_protection_plans table';

-- ============================================================================
-- Verification Queries
-- ============================================================================
--
-- -- Check migration progress
-- SELECT
--   COUNT(*) FILTER (WHERE assets_updated = TRUE) as migrated,
--   COUNT(*) FILTER (WHERE assets_updated = FALSE OR assets_updated IS NULL) as not_migrated,
--   COUNT(*) as total,
--   ROUND(100.0 * COUNT(*) FILTER (WHERE assets_updated = TRUE) / NULLIF(COUNT(*), 0), 1) as percent_complete
-- FROM rs_customers;
--
-- -- List customers not yet migrated
-- SELECT repairshopr_id, fullname, business_name, email
-- FROM rs_customers
-- WHERE assets_updated = FALSE OR assets_updated IS NULL
-- ORDER BY fullname;
--
