-- ============================================================================
-- RepairShopr Data Sync Tables
-- Version: 1.0
-- Created: 2026-01-08
-- Description: Tables to mirror RepairShopr data in Supabase for faster queries
--              and eventual migration away from RepairShopr
-- ============================================================================

-- ============================================================================
-- CUSTOMERS
-- Mirrors RepairShoprCustomer
-- ============================================================================
CREATE TABLE IF NOT EXISTS rs_customers (
  id SERIAL PRIMARY KEY,
  repairshopr_id INTEGER UNIQUE NOT NULL,
  firstname TEXT,
  lastname TEXT,
  fullname TEXT,
  business_name TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  address TEXT,
  address_2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  tags TEXT[],
  properties JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rs_customers_repairshopr_id ON rs_customers(repairshopr_id);
CREATE INDEX IF NOT EXISTS idx_rs_customers_email ON rs_customers(email);
CREATE INDEX IF NOT EXISTS idx_rs_customers_fullname ON rs_customers(fullname);
CREATE INDEX IF NOT EXISTS idx_rs_customers_phone ON rs_customers(phone);
CREATE INDEX IF NOT EXISTS idx_rs_customers_business ON rs_customers(business_name);

COMMENT ON TABLE rs_customers IS 'Synced customer data from RepairShopr';
COMMENT ON COLUMN rs_customers.repairshopr_id IS 'Original ID from RepairShopr API';
COMMENT ON COLUMN rs_customers.synced_at IS 'When this record was last synced from RepairShopr';

-- ============================================================================
-- TICKETS
-- Mirrors RepairShoprTicket
-- ============================================================================
CREATE TABLE IF NOT EXISTS rs_tickets (
  id SERIAL PRIMARY KEY,
  repairshopr_id INTEGER UNIQUE NOT NULL,
  number TEXT,
  subject TEXT,
  customer_id INTEGER,  -- References rs_customers.repairshopr_id
  customer_business_then_name TEXT,
  status TEXT,
  problem_type TEXT,
  priority TEXT,
  due_date TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  user_id INTEGER,  -- RepairShopr user who owns it
  properties JSONB,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rs_tickets_repairshopr_id ON rs_tickets(repairshopr_id);
CREATE INDEX IF NOT EXISTS idx_rs_tickets_customer_id ON rs_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_rs_tickets_status ON rs_tickets(status);
CREATE INDEX IF NOT EXISTS idx_rs_tickets_number ON rs_tickets(number);
CREATE INDEX IF NOT EXISTS idx_rs_tickets_created ON rs_tickets(created_at DESC);

COMMENT ON TABLE rs_tickets IS 'Synced ticket/work order data from RepairShopr';

-- ============================================================================
-- TICKET COMMENTS
-- Mirrors RepairShoprTicketComment
-- ============================================================================
CREATE TABLE IF NOT EXISTS rs_ticket_comments (
  id SERIAL PRIMARY KEY,
  repairshopr_id INTEGER UNIQUE NOT NULL,
  ticket_id INTEGER,  -- References rs_tickets.repairshopr_id
  subject TEXT,
  body TEXT,
  tech TEXT,
  hidden BOOLEAN DEFAULT FALSE,
  user_id INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rs_comments_ticket_id ON rs_ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_rs_comments_created ON rs_ticket_comments(created_at DESC);

COMMENT ON TABLE rs_ticket_comments IS 'Synced ticket comments from RepairShopr';
COMMENT ON COLUMN rs_ticket_comments.hidden IS 'True = private/internal note, False = visible to customer';

-- ============================================================================
-- ASSETS
-- Mirrors RepairShoprAsset (devices/equipment)
-- ============================================================================
CREATE TABLE IF NOT EXISTS rs_assets (
  id SERIAL PRIMARY KEY,
  repairshopr_id INTEGER UNIQUE NOT NULL,
  name TEXT,
  asset_type_name TEXT,
  customer_id INTEGER,  -- References rs_customers.repairshopr_id
  properties JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rs_assets_repairshopr_id ON rs_assets(repairshopr_id);
CREATE INDEX IF NOT EXISTS idx_rs_assets_customer_id ON rs_assets(customer_id);
CREATE INDEX IF NOT EXISTS idx_rs_assets_type ON rs_assets(asset_type_name);

COMMENT ON TABLE rs_assets IS 'Synced customer devices/assets from RepairShopr';

-- ============================================================================
-- INVOICES
-- Mirrors RepairShoprInvoice
-- ============================================================================
CREATE TABLE IF NOT EXISTS rs_invoices (
  id SERIAL PRIMARY KEY,
  repairshopr_id INTEGER UNIQUE NOT NULL,
  number TEXT,
  customer_id INTEGER,  -- References rs_customers.repairshopr_id
  customer_business_then_name TEXT,
  ticket_id INTEGER,    -- References rs_tickets.repairshopr_id
  total DECIMAL(10,2),
  balance_due DECIMAL(10,2),
  status TEXT,
  date DATE,
  due_date DATE,
  po_number TEXT,
  note TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rs_invoices_repairshopr_id ON rs_invoices(repairshopr_id);
CREATE INDEX IF NOT EXISTS idx_rs_invoices_customer_id ON rs_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_rs_invoices_ticket_id ON rs_invoices(ticket_id);
CREATE INDEX IF NOT EXISTS idx_rs_invoices_number ON rs_invoices(number);
CREATE INDEX IF NOT EXISTS idx_rs_invoices_status ON rs_invoices(status);
CREATE INDEX IF NOT EXISTS idx_rs_invoices_date ON rs_invoices(date DESC);

COMMENT ON TABLE rs_invoices IS 'Synced invoices from RepairShopr';

-- ============================================================================
-- LINE ITEMS
-- Mirrors RepairShoprLineItem (invoice line items)
-- ============================================================================
CREATE TABLE IF NOT EXISTS rs_line_items (
  id SERIAL PRIMARY KEY,
  repairshopr_id INTEGER UNIQUE NOT NULL,
  invoice_id INTEGER,  -- References rs_invoices.repairshopr_id
  item TEXT,
  name TEXT,
  description TEXT,
  quantity DECIMAL(10,2),
  price DECIMAL(10,2),
  cost DECIMAL(10,2),
  total DECIMAL(10,2),
  taxable BOOLEAN DEFAULT FALSE,
  product_id INTEGER,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rs_line_items_invoice_id ON rs_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_rs_line_items_product_id ON rs_line_items(product_id);

COMMENT ON TABLE rs_line_items IS 'Synced invoice line items from RepairShopr';

-- ============================================================================
-- PAYMENTS
-- Mirrors RepairShoprPayment
-- ============================================================================
CREATE TABLE IF NOT EXISTS rs_payments (
  id SERIAL PRIMARY KEY,
  repairshopr_id INTEGER UNIQUE NOT NULL,
  invoice_id INTEGER,   -- References rs_invoices.repairshopr_id
  customer_id INTEGER,  -- References rs_customers.repairshopr_id
  customer_business_then_name TEXT,
  amount DECIMAL(10,2),
  payment_method TEXT,
  reference TEXT,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rs_payments_repairshopr_id ON rs_payments(repairshopr_id);
CREATE INDEX IF NOT EXISTS idx_rs_payments_invoice_id ON rs_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_rs_payments_customer_id ON rs_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_rs_payments_created ON rs_payments(created_at DESC);

COMMENT ON TABLE rs_payments IS 'Synced payments from RepairShopr';

-- ============================================================================
-- SYNC LOG
-- Tracks sync operations for monitoring and debugging
-- ============================================================================
CREATE TABLE IF NOT EXISTS rs_sync_log (
  id SERIAL PRIMARY KEY,
  sync_type TEXT NOT NULL,      -- 'full', 'incremental', 'entity'
  entity_type TEXT,             -- 'customers', 'tickets', 'invoices', 'payments', 'assets'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  records_synced INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  errors JSONB,
  status TEXT DEFAULT 'running'  -- 'running', 'completed', 'failed'
);

CREATE INDEX IF NOT EXISTS idx_rs_sync_log_status ON rs_sync_log(status);
CREATE INDEX IF NOT EXISTS idx_rs_sync_log_started ON rs_sync_log(started_at DESC);

COMMENT ON TABLE rs_sync_log IS 'Tracks RepairShopr sync operations';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all rs_* tables
ALTER TABLE rs_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rs_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE rs_ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rs_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE rs_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE rs_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rs_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rs_sync_log ENABLE ROW LEVEL SECURITY;

-- Service role has full access (for sync operations via API)
-- These policies allow the service_role to do anything
CREATE POLICY "Service role full access on rs_customers" ON rs_customers
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on rs_tickets" ON rs_tickets
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on rs_ticket_comments" ON rs_ticket_comments
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on rs_assets" ON rs_assets
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on rs_invoices" ON rs_invoices
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on rs_line_items" ON rs_line_items
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on rs_payments" ON rs_payments
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on rs_sync_log" ON rs_sync_log
  FOR ALL USING (auth.role() = 'service_role');

-- Staff (admin, technician, receptionist) can read all synced data
CREATE POLICY "Staff read rs_customers" ON rs_customers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('admin', 'technician', 'receptionist')
  ));

CREATE POLICY "Staff read rs_tickets" ON rs_tickets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('admin', 'technician', 'receptionist')
  ));

CREATE POLICY "Staff read rs_ticket_comments" ON rs_ticket_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('admin', 'technician', 'receptionist')
  ));

CREATE POLICY "Staff read rs_assets" ON rs_assets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('admin', 'technician', 'receptionist')
  ));

CREATE POLICY "Staff read rs_invoices" ON rs_invoices FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('admin', 'technician', 'receptionist')
  ));

CREATE POLICY "Staff read rs_line_items" ON rs_line_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('admin', 'technician', 'receptionist')
  ));

CREATE POLICY "Staff read rs_payments" ON rs_payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('admin', 'technician', 'receptionist')
  ));

-- Only admins can view sync logs
CREATE POLICY "Admin read rs_sync_log" ON rs_sync_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  ));

-- ============================================================================
-- VERIFICATION QUERIES
-- Run these after sync to verify data integrity
-- ============================================================================
--
-- -- Count all synced records
-- SELECT 'customers' as entity, COUNT(*) as count FROM rs_customers
-- UNION ALL SELECT 'tickets', COUNT(*) FROM rs_tickets
-- UNION ALL SELECT 'comments', COUNT(*) FROM rs_ticket_comments
-- UNION ALL SELECT 'assets', COUNT(*) FROM rs_assets
-- UNION ALL SELECT 'invoices', COUNT(*) FROM rs_invoices
-- UNION ALL SELECT 'line_items', COUNT(*) FROM rs_line_items
-- UNION ALL SELECT 'payments', COUNT(*) FROM rs_payments;
--
-- -- Check recent sync operations
-- SELECT * FROM rs_sync_log ORDER BY started_at DESC LIMIT 10;
--
-- -- Find customers without any tickets
-- SELECT c.repairshopr_id, c.fullname
-- FROM rs_customers c
-- LEFT JOIN rs_tickets t ON t.customer_id = c.repairshopr_id
-- WHERE t.id IS NULL;
