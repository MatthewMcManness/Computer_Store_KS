-- =============================================================================
-- Security Fix: Tighten Overly Permissive RLS Policies
-- =============================================================================
-- Fixes Supabase security linter warning: "Policy is always true"
--
-- Replaces 4 RLS policies that use USING (true) / WITH CHECK (true) with
-- proper role-based checks using is_staff(auth.uid()).
--
-- Safe because: Our app uses supabaseAdmin (service role key) for all
-- server-side operations, which bypasses RLS entirely. These policies
-- only affect direct client-side Supabase access.
--
-- Created: 2026-01-27
-- =============================================================================

-- =============================================================================
-- Fix 1: call_logs — "Service role can update call logs"
-- =============================================================================
-- Old: USING (true) WITH CHECK (true) — any authenticated user could update
-- New: Only staff can update call logs

DROP POLICY IF EXISTS "Service role can update call logs" ON call_logs;

CREATE POLICY "Staff can update call logs"
ON call_logs FOR UPDATE
TO authenticated
USING (is_staff(auth.uid()))
WITH CHECK (is_staff(auth.uid()));

-- =============================================================================
-- Fix 2-4: families — Three overly permissive policies
-- =============================================================================

-- Fix INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert families" ON families;

CREATE POLICY "Staff can insert families"
ON families FOR INSERT
TO authenticated
WITH CHECK (is_staff(auth.uid()));

-- Fix UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update families" ON families;

CREATE POLICY "Staff can update families"
ON families FOR UPDATE
TO authenticated
USING (is_staff(auth.uid()))
WITH CHECK (is_staff(auth.uid()));

-- Fix DELETE policy
DROP POLICY IF EXISTS "Authenticated users can delete families" ON families;

CREATE POLICY "Staff can delete families"
ON families FOR DELETE
TO authenticated
USING (is_staff(auth.uid()));
