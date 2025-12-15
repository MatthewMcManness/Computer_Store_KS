-- =============================================================================
-- Ticket Custom Statuses Schema
-- =============================================================================
--
-- Purpose: Define custom ticket statuses that map to RepairShopr statuses
-- and allow more granular tracking of ticket progress.
--
-- Custom statuses provide:
-- - More detailed workflow stages
-- - Customer-visible questions for certain statuses
-- - Mapping to RepairShopr's simpler status system
-- =============================================================================

-- Create enum for custom statuses
CREATE TYPE ticket_custom_status AS ENUM (
  'new',
  'diagnosing',
  'repairing',
  'data_transferring',
  'installing',
  'waiting_for_parts',
  'building',
  'call_customer',
  'waiting_for_customer_reply',
  'ready_for_pickup',
  'completed'
);

-- Table to store ticket status overrides and customer questions
CREATE TABLE IF NOT EXISTS ticket_status_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairshopr_ticket_id INTEGER NOT NULL UNIQUE,
  custom_status ticket_custom_status NOT NULL DEFAULT 'new',
  customer_question TEXT, -- Question to show customer for "call_customer" and "waiting_for_customer_reply" statuses
  updated_by VARCHAR(255), -- Employee who last updated the status
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ticket_status_overrides_ticket_id
  ON ticket_status_overrides(repairshopr_ticket_id);

CREATE INDEX IF NOT EXISTS idx_ticket_status_overrides_status
  ON ticket_status_overrides(custom_status);

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_ticket_status_overrides_updated_at
  BEFORE UPDATE ON ticket_status_overrides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE ticket_status_overrides ENABLE ROW LEVEL SECURITY;

-- Policy: Allow read for all (needed for customer portal)
CREATE POLICY ticket_status_overrides_select_all
  ON ticket_status_overrides
  FOR SELECT
  USING (true);

-- Policy: Service role can do anything
CREATE POLICY ticket_status_overrides_service_role_all
  ON ticket_status_overrides
  FOR ALL
  USING (auth.role() = 'service_role');

-- Reference table for status metadata (display names, descriptions, mappings)
-- This is a lookup table, not for storing per-ticket data
CREATE TABLE IF NOT EXISTS ticket_status_definitions (
  status ticket_custom_status PRIMARY KEY,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  repairshopr_status VARCHAR(50) NOT NULL, -- Maps to RepairShopr status
  show_customer_question BOOLEAN DEFAULT FALSE,
  customer_visible_status VARCHAR(100), -- What customers see in portal
  sort_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Insert status definitions
INSERT INTO ticket_status_definitions (status, display_name, description, repairshopr_status, show_customer_question, customer_visible_status, sort_order) VALUES
  ('new', 'New', 'Ticket just created, awaiting initial assessment', 'New', FALSE, 'Received', 1),
  ('diagnosing', 'Diagnosing', 'Technician is diagnosing the issue', 'In Progress', FALSE, 'Being Diagnosed', 2),
  ('repairing', 'Repairing', 'Active repair work in progress', 'In Progress', FALSE, 'Being Repaired', 3),
  ('data_transferring', 'Data Transferring', 'Transferring data between devices', 'In Progress', FALSE, 'Data Transfer in Progress', 4),
  ('installing', 'Installing', 'Installing software or components', 'In Progress', FALSE, 'Installation in Progress', 5),
  ('waiting_for_parts', 'Waiting for Parts', 'Waiting for parts to arrive', 'On Hold', FALSE, 'Waiting for Parts', 6),
  ('building', 'Building', 'Building custom system', 'In Progress', FALSE, 'Being Built', 7),
  ('call_customer', 'Call Customer', 'Need to call customer with a question', 'Customer Reply', TRUE, 'We Have a Question', 8),
  ('waiting_for_customer_reply', 'Waiting for Customer Reply', 'Waiting for customer to respond', 'Customer Reply', TRUE, 'Awaiting Your Response', 9),
  ('ready_for_pickup', 'Ready for Pickup', 'Repair complete, on done shelf', 'Resolved', FALSE, 'Ready for Pickup', 10),
  ('completed', 'Completed', 'Ticket fully resolved and closed', 'Resolved', FALSE, 'Completed', 11)
ON CONFLICT (status) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  repairshopr_status = EXCLUDED.repairshopr_status,
  show_customer_question = EXCLUDED.show_customer_question,
  customer_visible_status = EXCLUDED.customer_visible_status,
  sort_order = EXCLUDED.sort_order;

-- Add RLS for definitions table
ALTER TABLE ticket_status_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY ticket_status_definitions_select_all
  ON ticket_status_definitions
  FOR SELECT
  USING (true);

CREATE POLICY ticket_status_definitions_service_role_all
  ON ticket_status_definitions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE ticket_status_overrides IS 'Stores custom status for each ticket with optional customer question';
COMMENT ON COLUMN ticket_status_overrides.custom_status IS 'Our refined status for the ticket';
COMMENT ON COLUMN ticket_status_overrides.customer_question IS 'Question to display to customer for call_customer/waiting_for_customer_reply statuses';
COMMENT ON TABLE ticket_status_definitions IS 'Reference table defining all available statuses and their properties';
