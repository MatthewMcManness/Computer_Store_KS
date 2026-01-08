# Admin Login Issue - Troubleshooting Log

**Date:** 2026-01-08
**Issue:** Admin user (matthewmcmanness@gmail.com) is being redirected to Customer Dashboard instead of Admin Dashboard after login.

---

## Problem Summary

When logging in with an admin account, the system:
1. Successfully authenticates with Supabase
2. Looks up the user profile in `user_profiles` table
3. **FAILS** to retrieve the profile (or retrieves wrong role)
4. Defaults to `role: 'customer'` / `userType: 'customer'`
5. Redirects to `/portal` (Customer Dashboard) instead of `/admin`

---

## Database State

### user_profiles Table
| id | email | role | repairshopr_user_id |
|----|-------|------|---------------------|
| `5e5c0212-4e8d-4181-8077-bb8e4c1fb2fc` | matthewmcmanness@gmail.com | **admin** | 2120835 |

### auth.users Table
| id | email |
|----|-------|
| `5e5c0212-4e8d-4181-8077-bb8e4c1fb2fc` | matthewmcmanness@gmail.com |

**Note:** IDs match correctly between tables.

---

## Debug Output from API Response

```json
{
  "success": true,
  "user": {
    "email": "matthewmcmanness@gmail.com",
    "name": "...",
    "role": "limited",
    "userType": "customer"
  },
  "_debug": {
    "authUserId": "5e5c0212-4e8d-4181-8077-bb8e4c1fb2fc",
    "profileFound": false,
    "profileRole": null,
    "profileError": "42P17"
  }
}
```

**Key Finding:** `profileFound: false` and `profileError: "42P17"` (invalid recursion)

---

## Fixes Attempted

### 1. Swapped Auth Order (Supabase first, RepairShopr fallback)
- **File:** `src/app/api/auth/login/route.ts`
- **Status:** ✅ Completed
- **Result:** Now we can see `_debug` info, but profile still not found

### 2. Fixed RLS Policies on user_profiles
- **Status:** ✅ Completed
- **Actions taken:**
  - Dropped all existing policies (some had recursive queries)
  - Created simple non-recursive policies:
    - `Service role full access` - FOR ALL TO service_role
    - `Users can view own profile` - FOR SELECT where auth.uid() = id
    - `Users can update own profile` - FOR UPDATE where auth.uid() = id
    - `Users can insert own profile` - FOR INSERT where auth.uid() = id
  - Re-enabled RLS
- **Result:** Still getting error 42P17

### 3. Temporarily Disabled RLS (Nuclear Option)
- **Status:** ✅ Tested
- **Result:** ✅ Login worked correctly when RLS disabled
- **Conclusion:** RLS is the problem

### 4. Fixed SUPABASE_SERVICE_ROLE_KEY in Render
- **Status:** ✅ Completed
- **Issue Found:** Render had the `anon` key instead of `service_role` key
- **Action:** Updated to correct service_role key
- **Result:** ❌ Still not working

---

## Current State

- RLS is enabled on `user_profiles`
- Service role policy exists
- Service role key is (supposedly) correct in Render
- Still getting `profileError: "42P17"` or `profileFound: false`

---

## Hypotheses

### H1: Service role key still not being used correctly
- **Test:** Add logging to verify which key is being used
- **Status:** Not tested

### H2: Supabase client caching the wrong credentials
- **Test:** The `supabaseAdmin` is created at module load time - maybe the old key is cached
- **Status:** Not tested

### H3: Render deployment didn't pick up new env var
- **Test:** Check Render logs, verify deployment completed
- **Status:** Not tested

### H4: There's still a problematic RLS policy or trigger
- **Test:** Query `pg_policies` and `pg_trigger` for user_profiles
- **Status:** Not tested

---

## Next Steps

1. [ ] Check Render deployment logs - did it redeploy after env var change?
2. [ ] Check Render service logs during login attempt
3. [ ] Verify in Supabase SQL Editor that RLS policies are correct:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
   ```
4. [ ] Try disabling RLS again to confirm it's still the issue:
   ```sql
   ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
   ```
5. [ ] If disabling RLS works, the service_role key is NOT being used properly

---

## Relevant Files

- `src/app/api/auth/login/route.ts` - Login API endpoint
- `src/lib/auth.ts` - Authentication logic (`authenticateWithSupabase` function)
- `src/lib/supabase.ts` - Supabase client initialization
- `src/middleware.ts` - Route protection and role checking

---

## Environment Variables (Render)

| Variable | Status |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Set |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ Updated (was wrong, now should be correct) |

---

## SQL Commands for Testing

### Check current RLS policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'user_profiles';
```

### Check if RLS is enabled
```sql
SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class
WHERE relname = 'user_profiles';
```

### Disable RLS (temporary test)
```sql
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
```

### Re-enable RLS
```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

### Query profile directly
```sql
SELECT * FROM user_profiles WHERE email = 'matthewmcmanness@gmail.com';
```
