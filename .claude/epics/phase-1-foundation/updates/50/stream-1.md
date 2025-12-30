---
issue: 50
stream: Database Schema
agent: postgres-pro
started: 2025-12-26T22:35:20Z
completed: 2025-12-26T22:45:00Z
status: completed
---

# Stream 1: Database Schema

## Scope
Create the `user_profiles` table linking Supabase Auth users to RepairShopr IDs, and the `device_mappings` table for NinjaOne integration. Enable Row-Level Security with appropriate policies.

## Files
- `docs/database/user-profiles-schema.sql` (new)

## Progress
- [x] Created `user_profiles` table with all required columns
- [x] Created `device_mappings` table for NinjaOne device linking
- [x] Enabled RLS with policies for self-read/update
- [x] Added admin policies for full access
- [x] Created helper functions (get_user_role, is_admin, is_staff)
- [x] Added comprehensive documentation comments
- [x] Migration file saved to `docs/database/user-profiles-schema.sql`

## Implementation Summary

### user_profiles Table
- Primary key references `auth.users(id)` with CASCADE delete
- Columns: id, email, full_name, role, repairshopr_user_id, repairshopr_customer_id, protection_plan_tier, created_at, updated_at
- Role CHECK constraint: admin, technician, receptionist, customer
- Protection plan tier CHECK: bronze, silver, gold (nullable)
- Indexes on email, role, and RepairShopr IDs

### device_mappings Table
- Links RepairShopr asset IDs to NinjaOne device IDs
- Tracks sync status (synced, pending, error, stale) for cache invalidation
- Owner reference to user_profiles for customer device visibility
- Unique constraints on both asset ID and device ID

### RLS Policies

**user_profiles:**
- Users can read their own profile
- Users can update their own profile (role change prevented via WITH CHECK)
- Admins have full CRUD access to all profiles
- Service role bypasses RLS

**device_mappings:**
- Customers can view their own devices
- Staff (admin/technician) can view all devices
- Admins can manage (CRUD) all device mappings
- Service role bypasses RLS

### Helper Functions
- `get_user_role(user_id)` - Returns user's role (or 'anonymous')
- `is_admin(user_id)` - Boolean check for admin role
- `is_staff(user_id)` - Boolean check for staff roles (admin/technician/receptionist)
- `mark_device_stale(asset_id)` - Mark device for re-sync
- `update_device_sync(asset_id, status, error)` - Update sync status

## Manual Step Required
Schema must be applied to Supabase via SQL Editor:
1. Open Supabase Dashboard > SQL Editor
2. Paste contents of `docs/database/user-profiles-schema.sql`
3. Execute the migration
4. Verify tables created in Table Editor

## Acceptance Criteria Status
- [x] `user_profiles` table created with all required columns
- [x] RLS enabled with policies for self-read/update
- [x] `device_mappings` table created for NinjaOne device linking
- [x] Migration file saved to `docs/database/user-profiles-schema.sql`
- [ ] Schema applied to Supabase project (requires manual SQL Editor execution)
