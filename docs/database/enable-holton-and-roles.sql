-- ============================================================================
-- Enable Holton Location & Update User Roles
-- ============================================================================
-- Run this script in Supabase SQL Editor
--
-- Changes:
-- 1. Enables Holton location for testing/demo
-- 2. Sets Joseph as lead_technician
-- 3. Sets Cruz as technician + social_media
-- ============================================================================

-- ============================================================================
-- STEP 1: Enable Holton Location
-- ============================================================================

UPDATE locations
SET is_active = true
WHERE slug = 'holton';

-- Verify the update
-- SELECT * FROM locations ORDER BY sort_order;

-- ============================================================================
-- STEP 2: Set Joseph's roles to lead_technician
-- ============================================================================
-- Note: Adjust the email if it's different

UPDATE user_profiles
SET roles = ARRAY['lead_technician'],
    role = 'technician'  -- Legacy role for backwards compatibility
WHERE email ILIKE '%joseph%'
  AND email ILIKE '%computerstoreks%';

-- Alternative: If you know Joseph's exact email
-- UPDATE user_profiles
-- SET roles = ARRAY['lead_technician'],
--     role = 'technician'
-- WHERE email = 'joseph@thecomputerstoreks.com';

-- ============================================================================
-- STEP 3: Set Cruz's roles to technician + social_media
-- ============================================================================
-- Note: Adjust the email pattern if needed

UPDATE user_profiles
SET roles = ARRAY['technician', 'social_media'],
    role = 'technician'  -- Legacy role for backwards compatibility
WHERE email ILIKE '%cruz%';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check Holton is now active
SELECT slug, name, is_active FROM locations ORDER BY sort_order;

-- Check user roles were updated
SELECT email, role, roles, location_id
FROM user_profiles
WHERE email ILIKE '%joseph%'
   OR email ILIKE '%cruz%'
   OR email ILIKE '%matthew%';

-- List all employees with their roles
SELECT email, role, roles,
       (SELECT name FROM locations WHERE id = location_id) as location_name
FROM user_profiles
WHERE role != 'customer'
ORDER BY email;
