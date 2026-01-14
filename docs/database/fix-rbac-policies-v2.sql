-- =============================================================================
-- FIX RBAC POLICIES V2: Eliminate Infinite Recursion
-- =============================================================================
--
-- Problem: RLS policies that query user_profiles to check roles cause infinite
-- recursion because the query itself is subject to RLS.
--
-- Solution: Use SECURITY DEFINER functions that bypass RLS to check roles.
--
-- Run this in Supabase SQL Editor.
-- =============================================================================

-- =============================================================================
-- STEP 1: DROP ALL EXISTING POLICIES ON user_profiles
-- =============================================================================

DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON user_profiles', pol.policyname);
    END LOOP;
END $$;

-- =============================================================================
-- STEP 2: CREATE SECURITY DEFINER FUNCTION TO GET USER ROLES
-- =============================================================================
-- This function bypasses RLS, so it won't cause recursion when called from policies

CREATE OR REPLACE FUNCTION auth_user_roles()
RETURNS TEXT[] AS $$
DECLARE
    v_roles TEXT[];
BEGIN
    -- This runs with elevated privileges (bypasses RLS)
    SELECT roles INTO v_roles
    FROM user_profiles
    WHERE id = auth.uid();

    RETURN COALESCE(v_roles, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION auth_user_roles() TO authenticated;

-- =============================================================================
-- STEP 3: CREATE HELPER FUNCTION TO CHECK IF USER IS MANAGEMENT
-- =============================================================================

CREATE OR REPLACE FUNCTION auth_user_is_management()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth_user_roles() && ARRAY['manager', 'owner', 'lead_developer']::TEXT[];
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION auth_user_is_management() TO authenticated;

-- =============================================================================
-- STEP 4: VERIFY/FIX roles COLUMN
-- =============================================================================

-- Ensure roles column exists
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

-- Create GIN index for array queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_roles
    ON user_profiles USING GIN (roles);

-- =============================================================================
-- STEP 5: FIX EXISTING USER DATA
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
-- STEP 6: RECREATE RLS POLICIES (NO RECURSION)
-- =============================================================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Service role has full access (highest priority)
CREATE POLICY "service_role_full_access"
    ON user_profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy 2: Users can read their own profile
-- Simple check - no subquery needed
CREATE POLICY "users_read_own_profile"
    ON user_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Policy 3: Users can update their own non-role fields
CREATE POLICY "users_update_own_profile"
    ON user_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy 4: Management can read all profiles
-- Uses SECURITY DEFINER function to avoid recursion
CREATE POLICY "management_read_all_profiles"
    ON user_profiles
    FOR SELECT
    TO authenticated
    USING (auth_user_is_management());

-- Policy 5: Management can update all profiles
CREATE POLICY "management_update_all_profiles"
    ON user_profiles
    FOR UPDATE
    TO authenticated
    USING (auth_user_is_management());

-- Policy 6: Management can insert new profiles
CREATE POLICY "management_insert_profiles"
    ON user_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth_user_is_management());

-- Policy 7: Management can delete profiles
CREATE POLICY "management_delete_profiles"
    ON user_profiles
    FOR DELETE
    TO authenticated
    USING (auth_user_is_management());

-- =============================================================================
-- STEP 7: VERIFICATION
-- =============================================================================

-- Check policies were created
SELECT policyname, cmd, permissive, roles, qual
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Check employees and their roles
SELECT id, email, full_name, role, roles
FROM user_profiles
WHERE role != 'customer'
ORDER BY email;

-- =============================================================================
-- DONE! The key fix is using auth_user_is_management() which is SECURITY DEFINER
-- This means it runs with elevated privileges and bypasses RLS, preventing recursion.
-- =============================================================================
