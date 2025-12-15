-- =============================================================================
-- Ticket Public Notes Schema
-- =============================================================================
--
-- Purpose: Store public notes for tickets that are visible to customers
-- in the customer portal. These notes are separate from RepairShopr's
-- internal comment system.
--
-- Private notes (internal) are handled by RepairShopr API
-- Public notes (customer-visible) are stored here in Supabase
-- =============================================================================

-- Create ticket_public_notes table
CREATE TABLE IF NOT EXISTS ticket_public_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repairshopr_ticket_id INTEGER NOT NULL,
  repairshopr_customer_id INTEGER NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_ticket_public_notes_ticket_id
  ON ticket_public_notes(repairshopr_ticket_id);

CREATE INDEX IF NOT EXISTS idx_ticket_public_notes_customer_id
  ON ticket_public_notes(repairshopr_customer_id);

CREATE INDEX IF NOT EXISTS idx_ticket_public_notes_created_at
  ON ticket_public_notes(created_at DESC);

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_ticket_public_notes_updated_at
  BEFORE UPDATE ON ticket_public_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE ticket_public_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read notes for their own tickets (via customer portal)
-- This will be enforced at the application level by checking customer_id
CREATE POLICY ticket_public_notes_select_by_customer
  ON ticket_public_notes
  FOR SELECT
  USING (true);

-- Policy: Service role can do anything (for admin operations)
CREATE POLICY ticket_public_notes_service_role_all
  ON ticket_public_notes
  FOR ALL
  USING (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON TABLE ticket_public_notes IS 'Public notes for tickets visible to customers in the portal';
COMMENT ON COLUMN ticket_public_notes.repairshopr_ticket_id IS 'RepairShopr ticket ID this note belongs to';
COMMENT ON COLUMN ticket_public_notes.repairshopr_customer_id IS 'RepairShopr customer ID who owns the ticket';
COMMENT ON COLUMN ticket_public_notes.author_name IS 'Name of the employee who created the note';
COMMENT ON COLUMN ticket_public_notes.author_email IS 'Email of the employee who created the note';
COMMENT ON COLUMN ticket_public_notes.content IS 'The note content (plain text or markdown)';
