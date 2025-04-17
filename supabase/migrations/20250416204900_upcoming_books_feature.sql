/*
  # Upcoming Books Feature

  1. New Tables
    - `upcoming_books` - Stores information about upcoming books
  
  2. Security
    - Enable RLS on the table
    - Add policies for authenticated users to manage data
    - Allow public read access
*/

-- Upcoming Books table
CREATE TABLE IF NOT EXISTS upcoming_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image_url TEXT NOT NULL,
  expected_release_date DATE NOT NULL,
  preorder_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Security policies
ALTER TABLE upcoming_books ENABLE ROW LEVEL SECURITY;

-- Policies for upcoming_books table
CREATE POLICY "Upcoming books are viewable by everyone" 
  ON upcoming_books FOR SELECT 
  USING (true);

CREATE POLICY "Upcoming books can be inserted by authenticated users only" 
  ON upcoming_books FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Upcoming books can be updated by authenticated users only" 
  ON upcoming_books FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Upcoming books can be deleted by authenticated users only" 
  ON upcoming_books FOR DELETE 
  TO authenticated 
  USING (true);