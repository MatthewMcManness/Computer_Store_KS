-- =============================================================================
-- Security Fix: Add SET search_path to All Functions
-- =============================================================================
-- Fixes Supabase security linter warning: "Function has a mutable search_path"
--
-- All 23 functions are recreated with SET search_path = 'public' to prevent
-- search path manipulation attacks. CREATE OR REPLACE preserves existing
-- permissions and dependencies.
--
-- Created: 2026-01-27
-- =============================================================================

-- =============================================================================
-- RBAC Functions (from rbac-migration.sql) — 9 SECURITY DEFINER functions
-- =============================================================================

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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = 'public';

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

  IF 'owner' = ANY(v_roles) OR 'lead_developer' = ANY(v_roles) THEN
    RETURN 'admin';
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = 'public';

CREATE OR REPLACE FUNCTION has_any_role(p_roles TEXT[], p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = p_user_id
    AND roles && p_roles
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = 'public';

CREATE OR REPLACE FUNCTION has_all_roles(p_roles TEXT[], p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = p_user_id
    AND roles @> p_roles
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = 'public';

CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = p_user_id
    AND roles && ARRAY['owner', 'manager', 'lead_developer']::TEXT[]
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = 'public';

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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = 'public';

CREATE OR REPLACE FUNCTION is_lead_developer(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = p_user_id
    AND 'lead_developer' = ANY(roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = 'public';

CREATE OR REPLACE FUNCTION has_blog_access(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = p_user_id
    AND roles && ARRAY['social_media', 'manager', 'owner', 'lead_developer']::TEXT[]
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = 'public';

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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = 'public';

-- =============================================================================
-- RBAC Helper Functions (from fix-rbac-policies-v2.sql) — 2 SECURITY DEFINER
-- =============================================================================

CREATE OR REPLACE FUNCTION auth_user_roles()
RETURNS TEXT[] AS $$
DECLARE
    v_roles TEXT[];
BEGIN
    SELECT roles INTO v_roles
    FROM user_profiles
    WHERE id = auth.uid();

    RETURN COALESCE(v_roles, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = 'public';

CREATE OR REPLACE FUNCTION auth_user_is_management()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth_user_roles() && ARRAY['manager', 'owner', 'lead_developer']::TEXT[];
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = 'public';

-- =============================================================================
-- Location Helper Functions (from locations-migration.sql) — 2 functions
-- =============================================================================

CREATE OR REPLACE FUNCTION can_access_all_locations(user_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    'owner' = ANY(user_roles) OR
    'lead_developer' = ANY(user_roles) OR
    'admin' = ANY(user_roles)
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = 'public';

CREATE OR REPLACE FUNCTION get_user_location_id(user_id UUID)
RETURNS UUID AS $$
DECLARE
  loc_id UUID;
BEGIN
  SELECT location_id INTO loc_id FROM user_profiles WHERE id = user_id;
  RETURN loc_id;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = 'public';

-- =============================================================================
-- Device/Profile Functions (from user-profiles-schema.sql) — 4 functions
-- =============================================================================

CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = 'public';

CREATE OR REPLACE FUNCTION update_device_mappings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = 'public';

CREATE OR REPLACE FUNCTION mark_device_stale(p_repairshopr_asset_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE device_mappings
  SET sync_status = 'stale', updated_at = NOW()
  WHERE repairshopr_asset_id = p_repairshopr_asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- =============================================================================
-- Timestamp Trigger Functions (from various files) — 6 functions
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = 'public';

CREATE OR REPLACE FUNCTION update_asset_plan_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = 'public';

CREATE OR REPLACE FUNCTION update_families_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = 'public';

CREATE OR REPLACE FUNCTION update_call_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = 'public';

CREATE OR REPLACE FUNCTION update_businesses_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = 'public';

CREATE OR REPLACE FUNCTION link_customer_to_business()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.business_name IS NOT NULL AND NEW.business_name != '' THEN
    INSERT INTO businesses (name)
    VALUES (NEW.business_name)
    ON CONFLICT (name) DO NOTHING;

    SELECT id INTO NEW.business_id
    FROM businesses
    WHERE name = NEW.business_name;
  ELSE
    NEW.business_id := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = 'public';
