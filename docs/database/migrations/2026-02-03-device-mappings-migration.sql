-- ============================================================================
-- Device Mappings Migration: repairshopr_asset_id → asset_id
-- ============================================================================
--
-- Purpose:
--   Replace repairshopr_asset_id (RepairShopr external ID) with asset_id
--   (rs_assets.id internal ID) so NinjaOne mappings link to Supabase, not
--   directly to RepairShopr.
--
-- Created: 2026-02-03
-- Phase: 5 - NinjaOne RMM Integration
--
-- ============================================================================

-- Step 1: Add new column
ALTER TABLE device_mappings ADD COLUMN IF NOT EXISTS asset_id INTEGER;

-- Step 2: Populate from existing data by joining rs_assets
-- Links repairshopr_asset_id to rs_assets.repairshopr_id to get rs_assets.id
UPDATE device_mappings dm
SET asset_id = ra.id
FROM rs_assets ra
WHERE dm.repairshopr_asset_id = ra.repairshopr_id
  AND dm.asset_id IS NULL;

-- Step 3: Drop old unique constraint (if it exists)
ALTER TABLE device_mappings
  DROP CONSTRAINT IF EXISTS unique_repairshopr_asset;

-- Step 4: Drop old column
ALTER TABLE device_mappings
  DROP COLUMN IF EXISTS repairshopr_asset_id;

-- Step 5: Drop old index (if it exists)
DROP INDEX IF EXISTS idx_device_mappings_repairshopr_asset;

-- Step 6: Add new constraint - unique asset mapping
ALTER TABLE device_mappings
  ADD CONSTRAINT unique_asset UNIQUE (asset_id);

-- Step 7: Add foreign key to rs_assets
ALTER TABLE device_mappings
  ADD CONSTRAINT fk_device_mappings_asset
  FOREIGN KEY (asset_id)
  REFERENCES rs_assets(id)
  ON DELETE CASCADE;

-- Step 8: Make asset_id NOT NULL after data is populated
-- Note: Run this after verifying all rows have been populated
ALTER TABLE device_mappings
  ALTER COLUMN asset_id SET NOT NULL;

-- Step 9: Add index for asset_id lookups
CREATE INDEX IF NOT EXISTS idx_device_mappings_asset_id
  ON device_mappings(asset_id);

-- Step 10: Update helper functions to use asset_id
CREATE OR REPLACE FUNCTION mark_device_stale(p_asset_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE device_mappings
  SET sync_status = 'stale', updated_at = NOW()
  WHERE asset_id = p_asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_device_sync(
  p_asset_id INTEGER,
  p_status TEXT,
  p_error TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE device_mappings
  SET
    sync_status = p_status,
    sync_error = p_error,
    last_sync_at = CASE WHEN p_status = 'synced' THEN NOW() ELSE last_sync_at END,
    updated_at = NOW()
  WHERE asset_id = p_asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Update comments
COMMENT ON COLUMN device_mappings.asset_id IS 'References rs_assets.id (Supabase internal ID)';
COMMENT ON FUNCTION mark_device_stale IS 'Mark a device mapping as stale for cache invalidation (uses asset_id)';
COMMENT ON FUNCTION update_device_sync IS 'Update device sync status after sync operation (uses asset_id)';

-- ============================================================================
-- Verification Queries (Run after migration)
-- ============================================================================
--
-- -- Check that all mappings have asset_id populated
-- SELECT COUNT(*) as total, COUNT(asset_id) as with_asset_id
-- FROM device_mappings;
--
-- -- Verify foreign key relationship
-- SELECT dm.id, dm.asset_id, ra.name as asset_name
-- FROM device_mappings dm
-- JOIN rs_assets ra ON dm.asset_id = ra.id
-- LIMIT 10;
--
-- -- Check for orphaned mappings (should be 0 after migration)
-- SELECT dm.id, dm.ninjaone_device_id
-- FROM device_mappings dm
-- LEFT JOIN rs_assets ra ON dm.asset_id = ra.id
-- WHERE ra.id IS NULL;
