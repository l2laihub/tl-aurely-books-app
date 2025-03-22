/*
  # Add Multimedia Content Table
  
  1. New Tables
    - `multimedia` - Stores video and audio content related to books
      - `id` (uuid, primary key)
      - `book_id` (uuid, foreign key to books)
      - `title` (text, title of the content)
      - `description` (text, description of the content)
      - `type` (text, either 'video' or 'audio')
      - `url` (text, URL to the content)
      - `thumbnail` (text, URL to the thumbnail image)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on the new table
    - Add policies for authenticated users to manage data
    - Add policy for public to view data
*/

-- Create the multimedia table
CREATE TABLE IF NOT EXISTS multimedia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable row level security
ALTER TABLE multimedia ENABLE ROW LEVEL SECURITY;

-- Add security policies
CREATE POLICY "Multimedia is viewable by everyone" 
  ON multimedia FOR SELECT 
  USING (true);

CREATE POLICY "Multimedia can be inserted by authenticated users only" 
  ON multimedia FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Multimedia can be updated by authenticated users only" 
  ON multimedia FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Multimedia can be deleted by authenticated users only" 
  ON multimedia FOR DELETE 
  TO authenticated 
  USING (true);