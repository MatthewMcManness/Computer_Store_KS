-- ============================================================================
-- Add Default Location to User Profiles
-- ============================================================================
-- This migration adds a default_location_id column to user_profiles.
--
-- Purpose:
-- - Users with global access (owner, lead_developer) can access all locations
-- - This field stores their preferred/default location
-- - When they open the portal, their default location is pre-selected
-- - They can still switch to other locations using the location selector
--
-- For regular employees:
-- - Their location_id already determines both their access AND default
-- - This field can be set to match their location_id for consistency
-- - Or left NULL (system falls back to location_id)
--
-- Created: 2026-01-13
-- ============================================================================

-- Add default_location_id column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS default_location_id UUID REFERENCES locations(id);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_default_location
ON user_profiles(default_location_id)
WHERE default_location_id IS NOT NULL;

-- For existing users with global access, set their default_location_id
-- to match their current location_id (if they have one)
UPDATE user_profiles
SET default_location_id = location_id
WHERE location_id IS NOT NULL
  AND default_location_id IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.default_location_id IS
  'Default location for users with global access. Pre-selected when opening the portal.';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check which users have default locations set
-- SELECT
--   email,
--   roles,
--   (SELECT name FROM locations WHERE id = location_id) as assigned_location,
--   (SELECT name FROM locations WHERE id = default_location_id) as default_location
-- FROM user_profiles
-- WHERE role != 'customer'
-- ORDER BY email;
