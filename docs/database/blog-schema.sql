-- Blog Database Schema for Supabase
-- Run this in your Supabase SQL Editor to set up the blog tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table
CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post tags junction table (many-to-many)
CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some default categories
INSERT INTO blog_categories (name, slug, description) VALUES
  ('Tech Tips', 'tech-tips', 'Helpful technology tips and tricks for everyday users'),
  ('Repairs & Maintenance', 'repairs-maintenance', 'Guides on computer repair and maintenance'),
  ('Linux', 'linux', 'Everything about Linux and open-source software'),
  ('News & Updates', 'news-updates', 'Store news, updates, and announcements'),
  ('Security', 'security', 'Cybersecurity tips and how to stay safe online')
ON CONFLICT (slug) DO NOTHING;

-- Insert some default tags
INSERT INTO blog_tags (name, slug) VALUES
  ('Windows', 'windows'),
  ('Linux', 'linux'),
  ('Hardware', 'hardware'),
  ('Software', 'software'),
  ('Security', 'security'),
  ('Performance', 'performance'),
  ('Troubleshooting', 'troubleshooting'),
  ('How-To', 'how-to'),
  ('News', 'news'),
  ('Deals', 'deals')
ON CONFLICT (slug) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to published posts
CREATE POLICY "Public can view published posts" ON blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can view categories" ON blog_categories
  FOR SELECT USING (true);

CREATE POLICY "Public can view tags" ON blog_tags
  FOR SELECT USING (true);

CREATE POLICY "Public can view post tags for published posts" ON blog_post_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM blog_posts
      WHERE blog_posts.id = blog_post_tags.post_id
      AND blog_posts.status = 'published'
    )
  );

-- Create policies for service role (admin) full access
-- Note: Service role bypasses RLS by default, but these are here for clarity
CREATE POLICY "Service role full access to posts" ON blog_posts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to categories" ON blog_categories
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to tags" ON blog_tags
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to post_tags" ON blog_post_tags
  FOR ALL USING (auth.role() = 'service_role');
