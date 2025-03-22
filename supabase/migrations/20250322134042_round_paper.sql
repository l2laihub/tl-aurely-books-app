/*
  # Initial Schema for Literary Haven

  1. New Tables
    - `books` - Stores main book information like title, author, description
    - `book_genres` - Junction table for book genres (many-to-many)
    - `materials` - Stores downloadable materials related to books
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage data
*/

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT NOT NULL,
  coverImage TEXT NOT NULL,
  publishDate TEXT NOT NULL,
  isbn TEXT NOT NULL,
  pages INTEGER NOT NULL,
  ageRange TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Book genres junction table
CREATE TABLE IF NOT EXISTS book_genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  genre TEXT NOT NULL
);

-- Materials table for downloadable content
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  fileUrl TEXT NOT NULL,
  fileSize TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Security policies
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Policies for books table
CREATE POLICY "Books are viewable by everyone" 
  ON books FOR SELECT 
  USING (true);

CREATE POLICY "Books can be inserted by authenticated users only" 
  ON books FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Books can be updated by authenticated users only" 
  ON books FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Books can be deleted by authenticated users only" 
  ON books FOR DELETE 
  TO authenticated 
  USING (true);

-- Policies for book_genres table
CREATE POLICY "Book genres are viewable by everyone" 
  ON book_genres FOR SELECT 
  USING (true);

CREATE POLICY "Book genres can be inserted by authenticated users only" 
  ON book_genres FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Book genres can be updated by authenticated users only" 
  ON book_genres FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Book genres can be deleted by authenticated users only" 
  ON book_genres FOR DELETE 
  TO authenticated 
  USING (true);

-- Policies for materials table
CREATE POLICY "Materials are viewable by everyone" 
  ON materials FOR SELECT 
  USING (true);

CREATE POLICY "Materials can be inserted by authenticated users only" 
  ON materials FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Materials can be updated by authenticated users only" 
  ON materials FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Materials can be deleted by authenticated users only" 
  ON materials FOR DELETE 
  TO authenticated 
  USING (true);