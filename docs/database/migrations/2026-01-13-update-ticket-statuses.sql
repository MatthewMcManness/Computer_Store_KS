-- =============================================================================
-- Migration: Update Ticket Custom Statuses
-- Date: 2026-01-13
-- =============================================================================
--
-- Changes:
-- 1. Add new enum values: ready_for_pickup_no_payment_due, ready_for_pickup_payment_due
-- 2. Update call_customer to map to 'CNC' instead of 'Customer Reply'
-- 3. Update ready_for_pickup mappings to use 'Done Shelf'
--
-- IMPORTANT: Run each section separately if you encounter errors.
-- =============================================================================

-- =============================================================================
-- SECTION 1: Add new enum values (run this first, separately)
-- =============================================================================
-- NOTE: The enum is named ticket_custom_status_slug in the database
-- These statements must be run OUTSIDE of a transaction block in some cases

ALTER TYPE ticket_custom_status_slug ADD VALUE IF NOT EXISTS 'ready_for_pickup_no_payment_due';
ALTER TYPE ticket_custom_status_slug ADD VALUE IF NOT EXISTS 'ready_for_pickup_payment_due';

-- =============================================================================
-- SECTION 2: Update existing definitions and add new ones (run after Section 1)
-- =============================================================================

-- Update call_customer to use CNC
UPDATE ticket_status_definitions
SET repairshopr_status = 'CNC'
WHERE status = 'call_customer';

-- Insert new status definitions
INSERT INTO ticket_status_definitions (status, display_name, description, repairshopr_status, show_customer_question, customer_visible_status, sort_order)
VALUES
  ('ready_for_pickup_no_payment_due', 'Ready for Pickup (No Payment Due)', 'On done shelf, no payment required', 'Done Shelf', FALSE, 'Ready for Pickup', 10),
  ('ready_for_pickup_payment_due', 'Ready for Pickup (Payment Due)', 'On done shelf, payment required', 'Done Shelf', FALSE, 'Ready for Pickup - Payment Due', 11)
ON CONFLICT (status) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  repairshopr_status = EXCLUDED.repairshopr_status,
  show_customer_question = EXCLUDED.show_customer_question,
  customer_visible_status = EXCLUDED.customer_visible_status,
  sort_order = EXCLUDED.sort_order;

-- Update completed sort_order to accommodate new statuses
UPDATE ticket_status_definitions
SET sort_order = 12
WHERE status = 'completed';

-- Update old ready_for_pickup to use correct RepairShopr status (if it still exists)
UPDATE ticket_status_definitions
SET repairshopr_status = 'Done Shelf'
WHERE status = 'ready_for_pickup';

-- =============================================================================
-- SECTION 3: Migrate existing tickets (run manually as needed)
-- =============================================================================
-- For tickets that DON'T need payment:
-- UPDATE ticket_status_overrides
-- SET custom_status = 'ready_for_pickup_no_payment_due', updated_at = NOW()
-- WHERE custom_status = 'ready_for_pickup';
--
-- For tickets that DO need payment (run per ticket):
-- UPDATE ticket_status_overrides
-- SET custom_status = 'ready_for_pickup_payment_due', updated_at = NOW()
-- WHERE repairshopr_ticket_id = <ticket_id>;
-- =============================================================================
