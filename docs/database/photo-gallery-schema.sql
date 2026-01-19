-- Photo Gallery Schema
-- Schema documentation for the photo_gallery table
-- Note: This table already exists in production with this structure
-- Created: 2026-01-19

-- Table structure (already exists)
-- CREATE TABLE IF NOT EXISTS photo_gallery (
--   id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
--   caption VARCHAR(255) NOT NULL,          -- Maps to 'title' in API
--   alt_text VARCHAR(255),                  -- Maps to 'description' in API
--   image_url TEXT NOT NULL,
--   thumbnail_url TEXT,
--   category VARCHAR(100) DEFAULT 'general',
--   aspect_ratio NUMERIC DEFAULT 1.0,
--   sort_order INTEGER DEFAULT 0,
--   is_active BOOLEAN DEFAULT true,
--   archived_at TIMESTAMP WITH TIME ZONE,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Added category column (migration applied 2026-01-19)
-- ALTER TABLE photo_gallery ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'general';

-- Index for category filtering
-- CREATE INDEX IF NOT EXISTS idx_photo_gallery_category ON photo_gallery(category);

-- Column mapping for API:
-- Database Column -> API Field
-- caption        -> title
-- alt_text       -> description
-- image_url      -> imageUrl
-- thumbnail_url  -> thumbnailUrl
-- category       -> category
-- sort_order     -> sortOrder
-- is_active      -> isActive

-- RLS is enabled on this table
-- Public can view active photos
-- Service role has full access for admin operations
