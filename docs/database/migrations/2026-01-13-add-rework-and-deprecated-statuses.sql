-- =============================================================================
-- Migration: Add Rework and Deprecated RS Statuses
-- Date: 2026-01-13
-- =============================================================================
--
-- Changes:
-- 1. Add 'rework' enum value - highest priority status for tickets needing redo
-- 2. Add 'deprecated_rs_status' enum value - catches old RS statuses that shouldn't be used
-- 3. Add corresponding definitions to ticket_status_definitions table
--
-- Deprecated RS statuses being caught:
-- - 30 Day Notice, Called Customer, Final Notice, Remote Work,
-- - Rush Service, Scheduled, Waiting for Payment
--
-- IMPORTANT: Run each section separately if you encounter errors.
-- PostgreSQL's ALTER TYPE ... ADD VALUE cannot run inside a transaction block.
-- =============================================================================

-- =============================================================================
-- SECTION 1: Add new enum values (run this FIRST, SEPARATELY)
-- =============================================================================
-- NOTE: These statements must be run OUTSIDE of a transaction block
-- In Supabase SQL Editor, run each line individually if needed

ALTER TYPE ticket_custom_status ADD VALUE IF NOT EXISTS 'rework';
ALTER TYPE ticket_custom_status ADD VALUE IF NOT EXISTS 'deprecated_rs_status';

-- =============================================================================
-- SECTION 2: Add status definitions (run AFTER Section 1 completes)
-- =============================================================================

-- Add 'rework' status definition (sort_order 0 = highest priority)
INSERT INTO ticket_status_definitions (
  status,
  display_name,
  description,
  repairshopr_status,
  show_customer_question,
  customer_visible_status,
  sort_order,
  is_active
)
VALUES (
  'rework',
  'Rework',
  'Needs rework - ticket requires additional work after customer pickup or previous completion',
  'Rework',
  FALSE,
  'Being Repaired',
  0,
  TRUE
)
ON CONFLICT (status) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  repairshopr_status = EXCLUDED.repairshopr_status,
  show_customer_question = EXCLUDED.show_customer_question,
  customer_visible_status = EXCLUDED.customer_visible_status,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- Add 'deprecated_rs_status' definition (sort_order 99 = at bottom, is_active FALSE)
-- This catches tickets that were set to old RepairShopr statuses that we no longer use:
-- 30 Day Notice, Called Customer, Final Notice, Remote Work, Rush Service, Scheduled, Waiting for Payment
INSERT INTO ticket_status_definitions (
  status,
  display_name,
  description,
  repairshopr_status,
  show_customer_question,
  customer_visible_status,
  sort_order,
  is_active
)
VALUES (
  'deprecated_rs_status',
  'Stop Using RepairShopr!',
  'Ticket was set to a deprecated RepairShopr status. Review and assign correct status. Old RS statuses caught: 30 Day Notice, Called Customer, Final Notice, Remote Work, Rush Service, Scheduled, Waiting for Payment',
  'DEPRECATED',
  FALSE,
  'Being Processed',
  99,
  FALSE  -- Not shown in status dropdown, only appears when auto-mapped from deprecated RS status
)
ON CONFLICT (status) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  repairshopr_status = EXCLUDED.repairshopr_status,
  show_customer_question = EXCLUDED.show_customer_question,
  customer_visible_status = EXCLUDED.customer_visible_status,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- =============================================================================
-- VERIFICATION: Run after migration to confirm
-- =============================================================================

-- Check enum values exist:
-- SELECT enumlabel FROM pg_enum WHERE enumtypid = 'ticket_custom_status'::regtype ORDER BY enumsortorder;

-- Check definitions exist:
-- SELECT status, display_name, sort_order, is_active FROM ticket_status_definitions ORDER BY sort_order;

-- Check for any tickets with deprecated status (should be empty if none exist yet):
-- SELECT * FROM ticket_status_overrides WHERE custom_status = 'deprecated_rs_status';
