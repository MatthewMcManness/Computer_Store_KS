-- =============================================================================
-- User Profiles & Device Mappings Schema
-- =============================================================================
--
-- Purpose:
--   - user_profiles: Link Supabase Auth users to RepairShopr IDs for unified
--     authentication across customer portal and employee dashboard
--   - device_mappings: Link RepairShopr asset IDs to NinjaOne device IDs for
--     RMM integration and remote monitoring
--
-- Integration Points:
--   - Supabase Auth (auth.users) - Primary authentication
--   - RepairShopr - Ticketing, customers, and employee records
--   - NinjaOne - Remote monitoring and management (RMM)
--
-- Created: 2025-12-26
-- Issue: #50 (Phase 1 Foundation - Database Schema)
-- =============================================================================

-- =============================================================================
-- USER PROFILES TABLE
-- =============================================================================
-- Links Supabase Auth users to RepairShopr and stores role/permissions

CREATE TABLE IF NOT EXISTS user_profiles (
  -- Primary key references Supabase Auth user
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Contact information (synced from auth.users.email)
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,

  -- Role-based access control
  -- admin: Full system access, can manage other users
  -- technician: Can view/manage tickets, access RMM tools
  -- receptionist: Can create tickets, view customer info
  -- customer: Can view own tickets and devices
  role TEXT NOT NULL DEFAULT 'customer'
    CHECK (role IN ('admin', 'technician', 'receptionist', 'customer')),

  -- RepairShopr integration
  -- repairshopr_user_id: For employees (technicians, admins, receptionists)
  -- repairshopr_customer_id: For customers
  repairshopr_user_id INTEGER,
  repairshopr_customer_id INTEGER,

  -- Protection plan tier for customers
  -- Determines service level and response times
  protection_plan_tier TEXT
    CHECK (protection_plan_tier IS NULL OR protection_plan_tier IN ('bronze', 'silver', 'gold')),

  -- Audit timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_repairshopr_user_id
  ON user_profiles(repairshopr_user_id) WHERE repairshopr_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_repairshopr_customer_id
  ON user_profiles(repairshopr_customer_id) WHERE repairshopr_customer_id IS NOT NULL;

-- Trigger for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER trigger_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- =============================================================================
-- USER PROFILES RLS POLICIES
-- =============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile (except role)
-- Note: Role changes require admin intervention via service_role
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Prevent users from changing their own role by checking it hasn't changed
    AND role = (SELECT role FROM user_profiles WHERE id = auth.uid())
  );

-- Policy: Admins can read all profiles
-- Uses a subquery to check if the current user is an admin
CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

-- Policy: Admins can update all profiles (including role changes)
CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

-- Policy: Admins can insert new profiles
CREATE POLICY "Admins can insert profiles"
  ON user_profiles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

-- Policy: Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON user_profiles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

-- Policy: Service role bypasses RLS (for backend operations)
CREATE POLICY "Service role full access"
  ON user_profiles
  FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- DEVICE MAPPINGS TABLE
-- =============================================================================
-- Links RepairShopr assets to NinjaOne devices for RMM integration

CREATE TABLE IF NOT EXISTS device_mappings (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- RepairShopr asset reference
  repairshopr_asset_id INTEGER NOT NULL,

  -- NinjaOne device reference
  ninjaone_device_id INTEGER NOT NULL,

  -- Device identification for manual matching
  device_name TEXT,
  serial_number TEXT,

  -- Owner reference (links to user_profiles for customers)
  owner_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- Sync tracking for cache invalidation
  last_sync_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  sync_status TEXT DEFAULT 'synced'
    CHECK (sync_status IN ('synced', 'pending', 'error', 'stale')),
  sync_error TEXT,

  -- Audit timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Ensure unique mappings
  CONSTRAINT unique_repairshopr_asset UNIQUE (repairshopr_asset_id),
  CONSTRAINT unique_ninjaone_device UNIQUE (ninjaone_device_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_device_mappings_repairshopr_asset
  ON device_mappings(repairshopr_asset_id);
CREATE INDEX IF NOT EXISTS idx_device_mappings_ninjaone_device
  ON device_mappings(ninjaone_device_id);
CREATE INDEX IF NOT EXISTS idx_device_mappings_owner
  ON device_mappings(owner_user_id) WHERE owner_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_device_mappings_serial
  ON device_mappings(serial_number) WHERE serial_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_device_mappings_sync_status
  ON device_mappings(sync_status);
CREATE INDEX IF NOT EXISTS idx_device_mappings_last_sync
  ON device_mappings(last_sync_at);

-- Trigger for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_device_mappings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_device_mappings_updated_at ON device_mappings;
CREATE TRIGGER trigger_device_mappings_updated_at
  BEFORE UPDATE ON device_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_device_mappings_updated_at();

-- =============================================================================
-- DEVICE MAPPINGS RLS POLICIES
-- =============================================================================

ALTER TABLE device_mappings ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can view their own devices
CREATE POLICY "Users can view own devices"
  ON device_mappings
  FOR SELECT
  USING (owner_user_id = auth.uid());

-- Policy: Technicians and admins can view all devices
CREATE POLICY "Staff can view all devices"
  ON device_mappings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'technician')
    )
  );

-- Policy: Admins can manage device mappings
CREATE POLICY "Admins can manage devices"
  ON device_mappings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

-- Policy: Service role bypasses RLS (for sync operations)
CREATE POLICY "Service role full access to devices"
  ON device_mappings
  FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to mark device mapping as stale (for cache invalidation)
CREATE OR REPLACE FUNCTION mark_device_stale(p_repairshopr_asset_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE device_mappings
  SET sync_status = 'stale', updated_at = NOW()
  WHERE repairshopr_asset_id = p_repairshopr_asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update device sync status
CREATE OR REPLACE FUNCTION update_device_sync(
  p_repairshopr_asset_id INTEGER,
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
  WHERE repairshopr_asset_id = p_repairshopr_asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role (useful for application code)
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role
  FROM user_profiles
  WHERE id = p_user_id;

  RETURN COALESCE(v_role, 'anonymous');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = p_user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user is staff (admin, technician, or receptionist)
CREATE OR REPLACE FUNCTION is_staff(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = p_user_id AND role IN ('admin', 'technician', 'receptionist')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- TABLE DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE user_profiles IS 'User profiles linking Supabase Auth to RepairShopr. Stores roles and integration IDs.';
COMMENT ON COLUMN user_profiles.id IS 'Primary key, references auth.users(id)';
COMMENT ON COLUMN user_profiles.email IS 'User email address (synced from auth.users)';
COMMENT ON COLUMN user_profiles.full_name IS 'User display name';
COMMENT ON COLUMN user_profiles.role IS 'Access level: admin, technician, receptionist, or customer';
COMMENT ON COLUMN user_profiles.repairshopr_user_id IS 'RepairShopr user ID for employees';
COMMENT ON COLUMN user_profiles.repairshopr_customer_id IS 'RepairShopr customer ID for customers';
COMMENT ON COLUMN user_profiles.protection_plan_tier IS 'Customer protection plan: bronze, silver, or gold';

COMMENT ON TABLE device_mappings IS 'Maps RepairShopr assets to NinjaOne devices for RMM integration.';
COMMENT ON COLUMN device_mappings.repairshopr_asset_id IS 'RepairShopr asset/inventory ID';
COMMENT ON COLUMN device_mappings.ninjaone_device_id IS 'NinjaOne device/node ID';
COMMENT ON COLUMN device_mappings.device_name IS 'Human-readable device name for matching';
COMMENT ON COLUMN device_mappings.serial_number IS 'Device serial number for cross-reference';
COMMENT ON COLUMN device_mappings.owner_user_id IS 'Customer who owns this device';
COMMENT ON COLUMN device_mappings.last_sync_at IS 'Last successful sync timestamp';
COMMENT ON COLUMN device_mappings.sync_status IS 'Current sync state: synced, pending, error, stale';
COMMENT ON COLUMN device_mappings.sync_error IS 'Error message if sync failed';

COMMENT ON FUNCTION mark_device_stale IS 'Mark a device mapping as stale for cache invalidation';
COMMENT ON FUNCTION update_device_sync IS 'Update device sync status after sync operation';
COMMENT ON FUNCTION get_user_role IS 'Get the role of a user (returns anonymous if not found)';
COMMENT ON FUNCTION is_admin IS 'Check if a user has admin role';
COMMENT ON FUNCTION is_staff IS 'Check if a user is staff (admin, technician, or receptionist)';

-- =============================================================================
-- INITIAL DATA (Optional - Run separately if needed)
-- =============================================================================
-- Note: Initial admin user should be created through Supabase Auth UI or API,
-- then manually insert the profile record with admin role.
--
-- Example:
-- INSERT INTO user_profiles (id, email, full_name, role)
-- VALUES ('uuid-from-auth-users', 'admin@computerstoreks.com', 'Admin User', 'admin');
