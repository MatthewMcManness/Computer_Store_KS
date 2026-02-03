-- =============================================================================
-- Unified Devices System Migration
-- =============================================================================
-- This migration creates the new unified `devices` table that merges
-- assets and devices into a single concept, eliminating RepairShopr dependency
-- and using Supabase as the sole data store while preserving NinjaOne RMM
-- functionality for managed devices.
--
-- Run this AFTER backing up existing data from rs_assets, device_mappings,
-- and asset_protection_plans tables.
-- =============================================================================

-- Create the unified devices table
CREATE TABLE IF NOT EXISTS devices (
  id SERIAL PRIMARY KEY,

  -- Core device info
  name VARCHAR(255) NOT NULL,
  device_type VARCHAR(100), -- 'Desktop', 'Laptop', 'Server', etc.
  serial_number VARCHAR(255),

  -- Customer relationship (references rs_customers which syncs from RepairShopr)
  customer_id INTEGER REFERENCES rs_customers(repairshopr_id) ON DELETE SET NULL,

  -- Protection plan tier
  -- NULL = unmanaged device (no monitoring)
  -- 'eset' = ESET Protect monitoring
  -- 'silver' = NinjaOne RMM monitoring
  -- 'silver-plus' = NinjaOne RMM + priority support
  protection_tier VARCHAR(20) CHECK (protection_tier IN ('eset', 'silver', 'silver-plus')),

  -- NinjaOne linking (for silver/silver-plus tiers)
  ninjaone_device_id INTEGER UNIQUE,
  ninjaone_org_id INTEGER,

  -- ESET linking (for eset tier - future API integration)
  eset_device_id VARCHAR(255) UNIQUE,
  eset_status VARCHAR(50), -- 'protected', 'expired', 'unprotected'
  eset_last_scan TIMESTAMPTZ,

  -- Device details (editable for unmanaged, synced for managed)
  os VARCHAR(255),
  manufacturer VARCHAR(255),
  model VARCHAR(255),

  -- Hardware specs (synced from NinjaOne for silver/silver-plus)
  processor VARCHAR(255),
  ram_gb DECIMAL(10,2),

  -- Status tracking
  status VARCHAR(20) DEFAULT 'unknown' CHECK (status IN ('online', 'offline', 'unknown')),
  last_seen TIMESTAMPTZ,

  -- Metadata
  notes TEXT,
  properties JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_devices_customer ON devices(customer_id);
CREATE INDEX IF NOT EXISTS idx_devices_protection_tier ON devices(protection_tier);
CREATE INDEX IF NOT EXISTS idx_devices_ninjaone_id ON devices(ninjaone_device_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_device_type ON devices(device_type);
CREATE INDEX IF NOT EXISTS idx_devices_serial_number ON devices(serial_number);

-- Enable Row Level Security
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Admin/employee access (bypass for service role)
CREATE POLICY "Admin full access to devices" ON devices
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Note: In production, you would add more restrictive policies for customer access
-- For example:
-- CREATE POLICY "Customers view their own devices" ON devices
--   FOR SELECT
--   USING (customer_id = current_setting('app.current_customer_id', true)::integer);

-- =============================================================================
-- Data Migration
-- =============================================================================
-- This migrates data from the old tables to the new unified devices table.
-- Run this section after the table creation if you have existing data.

-- Migrate data from rs_assets + device_mappings + asset_protection_plans
INSERT INTO devices (
  name,
  device_type,
  serial_number,
  customer_id,
  protection_tier,
  ninjaone_device_id,
  eset_status,
  os,
  properties,
  notes,
  created_at,
  updated_at
)
SELECT
  a.name,
  a.asset_type_name AS device_type,
  (a.properties->>'serial_number')::VARCHAR(255) AS serial_number,
  a.customer_id,
  pp.plan_tier AS protection_tier,
  dm.ninjaone_device_id,
  pp.eset_status,
  (a.properties->>'os')::VARCHAR(255) AS os,
  a.properties,
  (a.properties->>'notes')::TEXT AS notes,
  a.created_at,
  a.updated_at
FROM rs_assets a
LEFT JOIN device_mappings dm ON dm.asset_id = a.id
LEFT JOIN asset_protection_plans pp ON pp.repairshopr_asset_id = a.id
WHERE NOT EXISTS (
  -- Don't insert if already migrated (check by name + customer_id)
  SELECT 1 FROM devices d
  WHERE d.name = a.name
  AND d.customer_id = a.customer_id
);

-- =============================================================================
-- Utility Functions
-- =============================================================================

-- Function to update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_devices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at
DROP TRIGGER IF EXISTS trigger_devices_updated_at ON devices;
CREATE TRIGGER trigger_devices_updated_at
  BEFORE UPDATE ON devices
  FOR EACH ROW
  EXECUTE FUNCTION update_devices_updated_at();

-- =============================================================================
-- Verification Queries (run after migration to verify data)
-- =============================================================================

-- Count migrated devices
-- SELECT COUNT(*) AS total_devices FROM devices;

-- Count by protection tier
-- SELECT protection_tier, COUNT(*) FROM devices GROUP BY protection_tier;

-- Count devices with NinjaOne links
-- SELECT COUNT(*) AS linked_to_ninjaone FROM devices WHERE ninjaone_device_id IS NOT NULL;

-- Count devices per customer
-- SELECT customer_id, COUNT(*) FROM devices GROUP BY customer_id ORDER BY COUNT(*) DESC LIMIT 10;

-- =============================================================================
-- Cleanup (run ONLY after verifying migration is complete)
-- =============================================================================

-- WARNING: Only run these after confirming the migration is successful!

-- DROP TABLE IF EXISTS rs_assets CASCADE;
-- DROP TABLE IF EXISTS device_mappings CASCADE;
-- DROP TABLE IF EXISTS asset_protection_plans CASCADE;
