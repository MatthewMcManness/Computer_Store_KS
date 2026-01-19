-- ============================================================================
-- Call Logs Table for Cytracom Phone Integration
-- ============================================================================
-- This migration creates a table to log click-to-call actions initiated by
-- employees through the employee portal.
--
-- Purpose:
-- - Track which employee initiated each outbound call
-- - Record the extension used and destination number
-- - Store call outcome and Cytracom call ID
-- - Enable reporting on employee call activity
-- - Optionally link to RepairShopr customer records
--
-- Created: 2026-01-19
-- ============================================================================

-- Create call_logs table
CREATE TABLE IF NOT EXISTS call_logs (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Employee who initiated the call
  employee_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Extension used to make the call
  extension VARCHAR(10) NOT NULL,

  -- Destination phone number (normalized)
  destination_number VARCHAR(20) NOT NULL,

  -- Destination phone number (original format for display)
  destination_display VARCHAR(30),

  -- Cytracom call ID returned by API
  cytracom_call_id VARCHAR(100),

  -- Call outcome
  status VARCHAR(20) NOT NULL DEFAULT 'initiated',
  -- Possible values: initiated, connected, failed, no_answer, busy

  -- Error message if call failed
  error_message TEXT,

  -- Optional: Link to RepairShopr customer if we can match
  repairshopr_customer_id INTEGER,

  -- Optional: Customer name for quick reference
  customer_name VARCHAR(200),

  -- Optional: Context about why call was made (e.g., ticket number)
  context VARCHAR(500),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_call_logs_employee
ON call_logs(employee_id);

CREATE INDEX IF NOT EXISTS idx_call_logs_created_at
ON call_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_call_logs_destination
ON call_logs(destination_number);

CREATE INDEX IF NOT EXISTS idx_call_logs_customer
ON call_logs(repairshopr_customer_id)
WHERE repairshopr_customer_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Employees can view all call logs (for team coordination)
CREATE POLICY "Employees can view all call logs"
ON call_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role != 'customer'
  )
);

-- Policy: Employees can insert their own call logs
CREATE POLICY "Employees can insert call logs"
ON call_logs FOR INSERT
TO authenticated
WITH CHECK (
  employee_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role != 'customer'
  )
);

-- Policy: System can update call logs (for status updates)
-- Using service role key for backend updates
CREATE POLICY "Service role can update call logs"
ON call_logs FOR UPDATE
USING (true)
WITH CHECK (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_call_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER call_logs_updated_at
  BEFORE UPDATE ON call_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_call_logs_updated_at();

-- Add comments for documentation
COMMENT ON TABLE call_logs IS 'Logs of click-to-call actions initiated through the employee portal';
COMMENT ON COLUMN call_logs.employee_id IS 'User profile ID of employee who initiated the call';
COMMENT ON COLUMN call_logs.extension IS 'Cytracom extension used to place the call (e.g., 106)';
COMMENT ON COLUMN call_logs.destination_number IS 'Phone number called (normalized, digits only)';
COMMENT ON COLUMN call_logs.destination_display IS 'Original phone number format for display';
COMMENT ON COLUMN call_logs.cytracom_call_id IS 'Call ID returned by Cytracom API for tracking';
COMMENT ON COLUMN call_logs.status IS 'Call outcome: initiated, connected, failed, no_answer, busy';
COMMENT ON COLUMN call_logs.repairshopr_customer_id IS 'Optional RepairShopr customer ID if call is customer-related';
COMMENT ON COLUMN call_logs.context IS 'Optional context like ticket number or reason for call';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- View recent call logs with employee names
-- SELECT
--   cl.created_at,
--   up.full_name as employee,
--   cl.extension,
--   cl.destination_display,
--   cl.status,
--   cl.customer_name,
--   cl.context
-- FROM call_logs cl
-- JOIN user_profiles up ON cl.employee_id = up.id
-- ORDER BY cl.created_at DESC
-- LIMIT 20;

-- Call volume by employee (last 7 days)
-- SELECT
--   up.full_name as employee,
--   COUNT(*) as total_calls,
--   COUNT(*) FILTER (WHERE cl.status = 'connected') as connected,
--   COUNT(*) FILTER (WHERE cl.status = 'failed') as failed
-- FROM call_logs cl
-- JOIN user_profiles up ON cl.employee_id = up.id
-- WHERE cl.created_at > NOW() - INTERVAL '7 days'
-- GROUP BY up.full_name
-- ORDER BY total_calls DESC;
