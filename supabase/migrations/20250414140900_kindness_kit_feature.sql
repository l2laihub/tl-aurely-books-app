-- Migration for Kindness Kit Feature
-- This migration creates the necessary tables for the kindness kit feature

-- Create kindness_kits table
CREATE TABLE IF NOT EXISTS kindness_kits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  headline TEXT,
  subheadline TEXT,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  hero_image_url TEXT,
  mailerlite_group_id TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create kit_files table
CREATE TABLE IF NOT EXISTS kit_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kit_id UUID NOT NULL REFERENCES kindness_kits(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create kit_subscribers table
CREATE TABLE IF NOT EXISTS kit_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kit_id UUID NOT NULL REFERENCES kindness_kits(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_kindness_kits_book_id ON kindness_kits(book_id);
CREATE INDEX IF NOT EXISTS idx_kit_files_kit_id ON kit_files(kit_id);
CREATE INDEX IF NOT EXISTS idx_kit_subscribers_kit_id ON kit_subscribers(kit_id);
CREATE INDEX IF NOT EXISTS idx_kit_subscribers_email ON kit_subscribers(email);

-- Add RLS (Row Level Security) policies
-- These policies control who can access the data

-- Enable RLS on all tables
ALTER TABLE kindness_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies for kindness_kits table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read active kindness kits" ON kindness_kits;
DROP POLICY IF EXISTS "Authenticated users can read all kindness kits" ON kindness_kits;
DROP POLICY IF EXISTS "Authenticated users can insert kindness kits" ON kindness_kits;
DROP POLICY IF EXISTS "Authenticated users can update kindness kits" ON kindness_kits;
DROP POLICY IF EXISTS "Authenticated users can delete kindness kits" ON kindness_kits;

-- Anyone can read active kits
CREATE POLICY "Anyone can read active kindness kits"
  ON kindness_kits FOR SELECT
  USING (active = TRUE);

-- Only authenticated users can read all kits (including inactive ones)
CREATE POLICY "Authenticated users can read all kindness kits"
  ON kindness_kits FOR SELECT
  TO authenticated
  USING (TRUE);

-- Only authenticated users can insert, update, or delete kits
CREATE POLICY "Authenticated users can insert kindness kits"
  ON kindness_kits FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can update kindness kits"
  ON kindness_kits FOR UPDATE
  TO authenticated
  USING (TRUE);

CREATE POLICY "Authenticated users can delete kindness kits"
  ON kindness_kits FOR DELETE
  TO authenticated
  USING (TRUE);

-- Create policies for kit_files table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read files for active kits" ON kit_files;
DROP POLICY IF EXISTS "Authenticated users can read all kit files" ON kit_files;
DROP POLICY IF EXISTS "Authenticated users can insert kit files" ON kit_files;
DROP POLICY IF EXISTS "Authenticated users can update kit files" ON kit_files;
DROP POLICY IF EXISTS "Authenticated users can delete kit files" ON kit_files;

-- Anyone can read files for active kits
CREATE POLICY "Anyone can read files for active kits"
  ON kit_files FOR SELECT
  USING (
    kit_id IN (
      SELECT id FROM kindness_kits WHERE active = TRUE
    )
  );

-- Only authenticated users can read all files
CREATE POLICY "Authenticated users can read all kit files"
  ON kit_files FOR SELECT
  TO authenticated
  USING (TRUE);

-- Only authenticated users can insert, update, or delete files
CREATE POLICY "Authenticated users can insert kit files"
  ON kit_files FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can update kit files"
  ON kit_files FOR UPDATE
  TO authenticated
  USING (TRUE);

CREATE POLICY "Authenticated users can delete kit files"
  ON kit_files FOR DELETE
  TO authenticated
  USING (TRUE);

-- Create policies for kit_subscribers table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can read kit subscribers" ON kit_subscribers;
DROP POLICY IF EXISTS "Anyone can insert kit subscribers" ON kit_subscribers;
DROP POLICY IF EXISTS "Authenticated users can update kit subscribers" ON kit_subscribers;
DROP POLICY IF EXISTS "Authenticated users can delete kit subscribers" ON kit_subscribers;

-- Only authenticated users can read subscribers
CREATE POLICY "Authenticated users can read kit subscribers"
  ON kit_subscribers FOR SELECT
  TO authenticated
  USING (TRUE);

-- Anyone can insert subscribers (for signup form)
CREATE POLICY "Anyone can insert kit subscribers"
  ON kit_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

-- Only authenticated users can update or delete subscribers
CREATE POLICY "Authenticated users can update kit subscribers"
  ON kit_subscribers FOR UPDATE
  TO authenticated
  USING (TRUE);

CREATE POLICY "Authenticated users can delete kit subscribers"
  ON kit_subscribers FOR DELETE
  TO authenticated
  USING (TRUE);

-- Create storage rules for kindness kit files
-- This assumes you have a 'public' bucket in Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the 'kindness-kits' folder
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read kindness kit files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload kindness kit files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update kindness kit files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete kindness kit files" ON storage.objects;

-- Anyone can read files in the 'kindness-kits' folder
CREATE POLICY "Anyone can read kindness kit files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'public' AND name LIKE 'kindness-kits/%');

-- Only authenticated users can upload files to the 'kindness-kits' folder
CREATE POLICY "Authenticated users can upload kindness kit files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'public' AND name LIKE 'kindness-kits/%');

-- Only authenticated users can update files in the 'kindness-kits' folder
CREATE POLICY "Authenticated users can update kindness kit files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'public' AND name LIKE 'kindness-kits/%');

-- Only authenticated users can delete files in the 'kindness-kits' folder
CREATE POLICY "Authenticated users can delete kindness kit files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'public' AND name LIKE 'kindness-kits/%');