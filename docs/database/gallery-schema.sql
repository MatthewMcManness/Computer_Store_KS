-- Gallery Database Schema for Supabase
-- Run this in your Supabase SQL Editor to set up the gallery tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Gallery computers table
CREATE TABLE IF NOT EXISTS gallery_computers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('desktop', 'laptop')),
  category VARCHAR(20) NOT NULL CHECK (category IN ('refurbished', 'custom', 'new')),
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  specs JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery sales table (for global sales like Black Friday)
-- Stores available sale types and tracks which is currently active
CREATE TABLE IF NOT EXISTS gallery_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_type VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  applies_to TEXT[] DEFAULT ARRAY['refurbished'],
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gallery_computers_type ON gallery_computers(type);
CREATE INDEX IF NOT EXISTS idx_gallery_computers_category ON gallery_computers(category);
CREATE INDEX IF NOT EXISTS idx_gallery_computers_is_active ON gallery_computers(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_computers_sort_order ON gallery_computers(sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_sales_is_active ON gallery_sales(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_sales_sale_type ON gallery_sales(sale_type);

-- Use the existing update_updated_at_column function from blog schema
-- (If running gallery schema standalone, uncomment below)
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at on computers
DROP TRIGGER IF EXISTS update_gallery_computers_updated_at ON gallery_computers;
CREATE TRIGGER update_gallery_computers_updated_at
  BEFORE UPDATE ON gallery_computers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default sale options (matching AVAILABLE_SALES constant in types)
INSERT INTO gallery_sales (sale_type, name, discount_percent, applies_to, is_active) VALUES
  ('none', 'No Sale', 0, ARRAY['refurbished'], false),
  ('black-friday', 'Black Friday Sale', 10, ARRAY['refurbished'], true)
ON CONFLICT (sale_type) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE gallery_computers ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_sales ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to active computers
CREATE POLICY "Public can view active computers" ON gallery_computers
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view sales" ON gallery_sales
  FOR SELECT USING (true);

-- Create policies for service role (admin) full access
-- Note: Service role bypasses RLS by default, but these are here for clarity
CREATE POLICY "Service role full access to computers" ON gallery_computers
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to sales" ON gallery_sales
  FOR ALL USING (auth.role() = 'service_role');
