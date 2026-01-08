-- Employee Audit Log Schema
-- Tracks all employee actions for accountability and compliance

-- Create the audit log table
CREATE TABLE IF NOT EXISTS employee_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who performed the action
  employee_user_id UUID NOT NULL REFERENCES user_profiles(id),
  employee_email TEXT NOT NULL,
  employee_name TEXT,

  -- What action was performed
  action_type TEXT NOT NULL,  -- 'ticket_create', 'ticket_update', 'customer_create', etc.
  action_category TEXT NOT NULL,  -- 'ticket', 'customer', 'pos', 'asset'

  -- Target of the action
  target_type TEXT,  -- 'ticket', 'customer', 'asset', 'invoice'
  target_id TEXT,    -- RepairShopr ID
  target_name TEXT,  -- Human-readable name

  -- Details of the change
  changes JSONB,     -- Before/after or action details
  request_data JSONB,  -- Original API request payload (sanitized)

  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_employee ON employee_audit_log(employee_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON employee_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_target ON employee_audit_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON employee_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_category ON employee_audit_log(action_category);

-- Enable RLS
ALTER TABLE employee_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Service role has full access (for API routes)
CREATE POLICY "Service role full access on audit log"
ON employee_audit_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
ON employee_audit_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- Employees can view their own audit logs
CREATE POLICY "Employees can view their own audit logs"
ON employee_audit_log
FOR SELECT
TO authenticated
USING (employee_user_id = auth.uid());

-- Comments
COMMENT ON TABLE employee_audit_log IS 'Tracks all employee actions in the system for accountability and compliance';
COMMENT ON COLUMN employee_audit_log.action_type IS 'Specific action: ticket_create, ticket_update, customer_create, customer_update, asset_create, etc.';
COMMENT ON COLUMN employee_audit_log.action_category IS 'Category: ticket, customer, pos, asset, auth';
COMMENT ON COLUMN employee_audit_log.changes IS 'JSONB containing before/after values or action details';
COMMENT ON COLUMN employee_audit_log.request_data IS 'Sanitized request payload (no passwords or sensitive data)';
