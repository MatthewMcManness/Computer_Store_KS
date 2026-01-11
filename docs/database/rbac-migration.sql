-- =============================================================================
-- RBAC Migration: Single Role to Multi-Role Array
-- =============================================================================
--
-- Purpose:
--   Migrate from single 'role' column to 'roles' array for granular access control.
--
-- Role Structure:
--   Business Hierarchy (linear inheritance):
--     receptionist → technician → lead_technician → manager → owner
--
--   Add-On Roles (combined with business roles):
--     social_media - Blog access for roles below Manager
--     lead_developer - IT superuser with full system access
--
--   Customer Role (separate portal):
--     customer - Customer portal access
--
-- Migration Strategy:
--   1. Add roles[] column
--   2. Migrate existing data
--   3. Update RLS policies
--   4. Update helper functions
--   5. Keep old 'role' column temporarily for backward compatibility
--   6. Drop old column in future migration after code update
--
-- Created: 2026-01-11
-- =============================================================================

-- =============================================================================
-- STEP 1: ADD ROLES ARRAY COLUMN
-- =============================================================================

-- Add the new roles array column
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY['customer']::TEXT[];

-- Add check constraint for valid role values
-- Note: This constraint validates array elements
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS valid_roles_check;

ALTER TABLE user_profiles
ADD CONSTRAINT valid_roles_check CHECK (
  roles IS NOT NULL
  AND array_length(roles, 1) >= 1
  AND roles <@ ARRAY[
    'receptionist',
    'technician',
    'lead_technician',
    'manager',
    'owner',
    'social_media',
    'lead_developer',
    'customer'
  ]::TEXT[]
);

-- Create index for roles array queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_roles
  ON user_profiles USING GIN (roles);

-- =============================================================================
-- STEP 2: MIGRATE EXISTING DATA
-- =============================================================================

-- Migrate existing single roles to array format
-- admin → ['owner', 'lead_developer'] (full access)
-- technician → ['technician']
-- receptionist → ['receptionist']
-- customer → ['customer']

UPDATE user_profiles
SET roles = CASE
  WHEN role = 'admin' THEN ARRAY['owner', 'lead_developer']::TEXT[]
  WHEN role = 'technician' THEN ARRAY['technician']::TEXT[]
  WHEN role = 'receptionist' THEN ARRAY['receptionist']::TEXT[]
  WHEN role = 'customer' THEN ARRAY['customer']::TEXT[]
  ELSE ARRAY['customer']::TEXT[]
END
WHERE roles = ARRAY['customer']::TEXT[] OR roles IS NULL;

-- =============================================================================
-- STEP 3: UPDATE RLS POLICIES
-- =============================================================================

-- Drop existing policies (we'll recreate them)
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access" ON user_profiles;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile (except roles)
-- Note: Role changes require manager+ intervention via service_role
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Prevent users from changing their own roles
    AND roles = (SELECT roles FROM user_profiles WHERE id = auth.uid())
  );

-- Policy: Management (manager, owner, lead_developer) can read all profiles
CREATE POLICY "Management can read all profiles"
  ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND (
        up.roles && ARRAY['manager', 'owner', 'lead_developer']::TEXT[]
      )
    )
  );

-- Policy: Management can update all profiles
CREATE POLICY "Management can update all profiles"
  ON user_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND (
        up.roles && ARRAY['manager', 'owner', 'lead_developer']::TEXT[]
      )
    )
  );

-- Policy: Management can insert new profiles
CREATE POLICY "Management can insert profiles"
  ON user_profiles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND (
        up.roles && ARRAY['manager', 'owner', 'lead_developer']::TEXT[]
      )
    )
  );

-- Policy: Management can delete profiles
CREATE POLICY "Management can delete profiles"
  ON user_profiles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND (
        up.roles && ARRAY['manager', 'owner', 'lead_developer']::TEXT[]
      )
    )
  );

-- Policy: Service role bypasses RLS (for backend operations)
CREATE POLICY "Service role full access"
  ON user_profiles
  FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- STEP 4: UPDATE DEVICE MAPPINGS RLS
-- =============================================================================

-- Drop and recreate device mapping policies with new role system
DROP POLICY IF EXISTS "Staff can view all devices" ON device_mappings;
DROP POLICY IF EXISTS "Admins can manage devices" ON device_mappings;

-- Policy: Staff (technician+) can view all devices
CREATE POLICY "Staff can view all devices"
  ON device_mappings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND (
        up.roles && ARRAY[
          'technician',
          'lead_technician',
          'manager',
          'owner',
          'lead_developer'
        ]::TEXT[]
      )
    )
  );

-- Policy: Management can manage device mappings
CREATE POLICY "Management can manage devices"
  ON device_mappings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND (
        up.roles && ARRAY['manager', 'owner', 'lead_developer']::TEXT[]
      )
    )
  );

-- =============================================================================
-- STEP 5: UPDATE HELPER FUNCTIONS
-- =============================================================================

-- Function to get user roles (returns array)
CREATE OR REPLACE FUNCTION get_user_roles(p_user_id UUID DEFAULT auth.uid())
RETURNS TEXT[] AS $$
DECLARE
  v_roles TEXT[];
BEGIN
  SELECT roles INTO v_roles
  FROM user_profiles
  WHERE id = p_user_id;

  RETURN COALESCE(v_roles, ARRAY['anonymous']::TEXT[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to get user role (deprecated - returns highest business role for backward compatibility)
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
DECLARE
  v_roles TEXT[];
  v_role TEXT;
BEGIN
  SELECT roles INTO v_roles
  FROM user_profiles
  WHERE id = p_user_id;

  IF v_roles IS NULL THEN
    RETURN 'anonymous';
  END IF;

  -- Return highest business role for backward compatibility
  -- Priority: owner > manager > lead_technician > technician > receptionist > customer
  IF 'owner' = ANY(v_roles) OR 'lead_developer' = ANY(v_roles) THEN
    RETURN 'admin'; -- Map to old 'admin' for backward compatibility
  ELSIF 'manager' = ANY(v_roles) THEN
    RETURN 'admin';
  ELSIF 'lead_technician' = ANY(v_roles) THEN
    RETURN 'technician';
  ELSIF 'technician' = ANY(v_roles) THEN
    RETURN 'technician';
  ELSIF 'receptionist' = ANY(v_roles) THEN
    RETURN 'receptionist';
  ELSIF 'customer' = ANY(v_roles) THEN
    RETURN 'customer';
  ELSE
    RETURN 'anonymous';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user has any of the specified roles
CREATE OR REPLACE FUNCTION has_any_role(p_roles TEXT[], p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = p_user_id
    AND roles && p_roles
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user has all of the specified roles
CREATE OR REPLACE FUNCTION has_all_roles(p_roles TEXT[], p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = p_user_id
    AND roles @> p_roles
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user is admin (owner, manager, or lead_developer)
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = p_user_id
    AND roles && ARRAY['owner', 'manager', 'lead_developer']::TEXT[]
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user is staff (any employee role)
CREATE OR REPLACE FUNCTION is_staff(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = p_user_id
    AND roles && ARRAY[
      'receptionist',
      'technician',
      'lead_technician',
      'manager',
      'owner',
      'lead_developer'
    ]::TEXT[]
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user is lead developer (superuser)
CREATE OR REPLACE FUNCTION is_lead_developer(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = p_user_id
    AND 'lead_developer' = ANY(roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user has blog access (social_media role OR manager+)
CREATE OR REPLACE FUNCTION has_blog_access(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = p_user_id
    AND roles && ARRAY['social_media', 'manager', 'owner', 'lead_developer']::TEXT[]
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to get the highest business role level (for inheritance)
-- Returns: 0=none, 1=receptionist, 2=technician, 3=lead_technician, 4=manager, 5=owner
CREATE OR REPLACE FUNCTION get_business_role_level(p_user_id UUID DEFAULT auth.uid())
RETURNS INTEGER AS $$
DECLARE
  v_roles TEXT[];
BEGIN
  SELECT roles INTO v_roles
  FROM user_profiles
  WHERE id = p_user_id;

  IF v_roles IS NULL THEN
    RETURN 0;
  END IF;

  -- Lead developer has equivalent to owner level
  IF 'lead_developer' = ANY(v_roles) THEN
    RETURN 5;
  ELSIF 'owner' = ANY(v_roles) THEN
    RETURN 5;
  ELSIF 'manager' = ANY(v_roles) THEN
    RETURN 4;
  ELSIF 'lead_technician' = ANY(v_roles) THEN
    RETURN 3;
  ELSIF 'technician' = ANY(v_roles) THEN
    RETURN 2;
  ELSIF 'receptionist' = ANY(v_roles) THEN
    RETURN 1;
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- STEP 6: ADD FUNCTION COMMENTS
-- =============================================================================

COMMENT ON FUNCTION get_user_roles IS 'Get all roles for a user as an array';
COMMENT ON FUNCTION get_user_role IS 'DEPRECATED: Get primary role for backward compatibility';
COMMENT ON FUNCTION has_any_role IS 'Check if user has any of the specified roles';
COMMENT ON FUNCTION has_all_roles IS 'Check if user has all of the specified roles';
COMMENT ON FUNCTION is_admin IS 'Check if user is admin (owner, manager, or lead_developer)';
COMMENT ON FUNCTION is_staff IS 'Check if user is any employee role';
COMMENT ON FUNCTION is_lead_developer IS 'Check if user is lead developer (superuser)';
COMMENT ON FUNCTION has_blog_access IS 'Check if user has blog access (social_media or manager+)';
COMMENT ON FUNCTION get_business_role_level IS 'Get numeric level of highest business role (for inheritance checks)';

-- =============================================================================
-- STEP 7: UPDATE COLUMN COMMENTS
-- =============================================================================

COMMENT ON COLUMN user_profiles.roles IS 'Array of user roles. Business roles: receptionist, technician, lead_technician, manager, owner. Add-ons: social_media, lead_developer. Customer: customer.';

-- =============================================================================
-- VERIFICATION QUERIES (Run after migration)
-- =============================================================================

-- Verify migration completed
-- SELECT id, email, role, roles FROM user_profiles ORDER BY email;

-- Verify role distribution
-- SELECT roles, COUNT(*) FROM user_profiles GROUP BY roles;

-- Test helper functions
-- SELECT get_user_roles(auth.uid());
-- SELECT has_any_role(ARRAY['manager', 'owner']);
-- SELECT is_admin();
-- SELECT is_staff();
-- SELECT has_blog_access();
-- SELECT get_business_role_level();

-- =============================================================================
-- FUTURE MIGRATION: DROP OLD ROLE COLUMN
-- =============================================================================
-- After all code is updated to use 'roles' array, run:
--
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS role;
--
-- This should be done in a separate migration after verifying the new system works.
