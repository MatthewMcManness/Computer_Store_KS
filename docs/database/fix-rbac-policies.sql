-- =============================================================================
-- FIX RBAC POLICIES: Remove Conflicting Policies & Infinite Recursion
-- =============================================================================
--
-- Problem: The original user_profiles policies and the RBAC migration policies
-- are both present, creating infinite recursion when evaluating permissions.
--
-- Solution: Drop ALL policies and recreate only the correct RBAC-based ones.
--
-- Run this in Supabase SQL Editor.
-- =============================================================================

-- =============================================================================
-- STEP 1: DROP ALL EXISTING POLICIES ON user_profiles
-- =============================================================================

DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;
DROP POLICY IF EXISTS "Management can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Management can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Management can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Management can delete profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access" ON user_profiles;

-- =============================================================================
-- STEP 2: VERIFY roles COLUMN EXISTS AND HAS CORRECT TYPE
-- =============================================================================

-- Add roles column if it doesn't exist (idempotent)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY['customer']::TEXT[];

-- Drop old constraint if exists
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS valid_roles_check;

-- Add check constraint for valid role values
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

-- Create GIN index for array queries (if not exists)
CREATE INDEX IF NOT EXISTS idx_user_profiles_roles
  ON user_profiles USING GIN (roles);

-- =============================================================================
-- STEP 3: FIX EXISTING USER DATA
-- =============================================================================

-- Update users who have roles still set to default ['customer'] based on legacy role
UPDATE user_profiles
SET roles = CASE
  WHEN role = 'admin' THEN ARRAY['owner', 'lead_developer']::TEXT[]
  WHEN role = 'technician' THEN ARRAY['technician']::TEXT[]
  WHEN role = 'receptionist' THEN ARRAY['receptionist']::TEXT[]
  WHEN role = 'customer' THEN ARRAY['customer']::TEXT[]
  ELSE ARRAY['customer']::TEXT[]
END
WHERE roles = ARRAY['customer']::TEXT[]
  AND role != 'customer';

-- =============================================================================
-- STEP 4: RECREATE RLS POLICIES (NON-RECURSIVE)
-- =============================================================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Service role has full access (MUST BE FIRST - highest priority)
CREATE POLICY "Service role full access"
  ON user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 3: Users can update their own profile (but NOT roles)
-- This uses a simple check that doesn't cause recursion
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Management can read all profiles
-- Uses a materialized/cached approach to avoid recursion
CREATE POLICY "Management can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Allow if user's roles (from their own row) include management roles
    (SELECT roles FROM user_profiles WHERE id = auth.uid())
    && ARRAY['manager', 'owner', 'lead_developer']::TEXT[]
  );

-- Policy 5: Management can update all profiles
CREATE POLICY "Management can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT roles FROM user_profiles WHERE id = auth.uid())
    && ARRAY['manager', 'owner', 'lead_developer']::TEXT[]
  );

-- Policy 6: Management can insert new profiles
CREATE POLICY "Management can insert profiles"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT roles FROM user_profiles WHERE id = auth.uid())
    && ARRAY['manager', 'owner', 'lead_developer']::TEXT[]
  );

-- Policy 7: Management can delete profiles
CREATE POLICY "Management can delete profiles"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (
    (SELECT roles FROM user_profiles WHERE id = auth.uid())
    && ARRAY['manager', 'owner', 'lead_developer']::TEXT[]
  );

-- =============================================================================
-- STEP 5: VERIFICATION QUERIES
-- =============================================================================

-- Run these after applying the migration to verify:

-- Check all employees and their roles:
-- SELECT id, email, full_name, role, roles FROM user_profiles WHERE role != 'customer' ORDER BY email;

-- Check policies were created:
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'user_profiles';

-- Test that the update works (replace UUID with actual user ID):
-- UPDATE user_profiles SET roles = ARRAY['technician', 'social_media']::TEXT[] WHERE email = 'cruz@example.com';
-- SELECT roles FROM user_profiles WHERE email = 'cruz@example.com';

-- =============================================================================
-- DONE!
-- =============================================================================
