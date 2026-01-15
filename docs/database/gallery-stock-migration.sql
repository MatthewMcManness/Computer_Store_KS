-- Migration: Add stock_quantity and archived_at columns to gallery_computers
-- Run this in Supabase SQL Editor to add inventory management

-- Add stock_quantity column (default 1 for existing computers)
ALTER TABLE gallery_computers
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER NOT NULL DEFAULT 1;

-- Add archived_at timestamp to track when items were archived
ALTER TABLE gallery_computers
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for stock queries
CREATE INDEX IF NOT EXISTS idx_gallery_computers_stock ON gallery_computers(stock_quantity);

-- Update existing computers to have stock_quantity of 1 (if any were null)
UPDATE gallery_computers
SET stock_quantity = 1
WHERE stock_quantity IS NULL;
