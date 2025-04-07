-- Create author_info table for storing detailed author information
CREATE TABLE IF NOT EXISTS public.author_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  photo_url TEXT,
  bio TEXT[] DEFAULT '{}',
  quote TEXT,
  creative_process TEXT[] DEFAULT '{}'
);

-- Add RLS policies to ensure only authenticated users can modify author information
ALTER TABLE public.author_info ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to select author info
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'author_info' AND policyname = 'Anyone can view author info'
  ) THEN
    CREATE POLICY "Anyone can view author info" 
    ON public.author_info 
    FOR SELECT 
    USING (true);
  END IF;
END
$$;

-- Policy for authenticated users to insert author info
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'author_info' AND policyname = 'Authenticated users can insert author info'
  ) THEN
    CREATE POLICY "Authenticated users can insert author info" 
    ON public.author_info 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);
  END IF;
END
$$;

-- Policy for authenticated users to update author info
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'author_info' AND policyname = 'Authenticated users can update author info'
  ) THEN
    CREATE POLICY "Authenticated users can update author info" 
    ON public.author_info 
    FOR UPDATE 
    TO authenticated 
    USING (true);
  END IF;
END
$$;

-- Policy for authenticated users to delete author info
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'author_info' AND policyname = 'Authenticated users can delete author info'
  ) THEN
    CREATE POLICY "Authenticated users can delete author info" 
    ON public.author_info 
    FOR DELETE 
    TO authenticated 
    USING (true);
  END IF;
END
$$;

-- Note: Timestamp fields have been removed as they were causing issues with the current database structure

-- Add a comment to the table
COMMENT ON TABLE public.author_info IS 'Stores detailed information about the author for the About page';
