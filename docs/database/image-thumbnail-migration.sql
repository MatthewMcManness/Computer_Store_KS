-- Image Thumbnail Migration
-- Run this in your Supabase SQL Editor to add thumbnail support
-- This migration is backwards compatible - NULL thumbnails will fallback to full image

-- Add thumbnail_url column to gallery_computers table
ALTER TABLE gallery_computers ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add featured_image_thumbnail column to blog_posts table
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS featured_image_thumbnail TEXT;

-- Optional: Add comment for documentation
COMMENT ON COLUMN gallery_computers.thumbnail_url IS 'Small 400x300 WebP thumbnail for grid display';
COMMENT ON COLUMN blog_posts.featured_image_thumbnail IS 'Small 400x300 WebP thumbnail for blog listing';
