/*
  # Add Amazon and Review Links to Books Table
  
  1. Changes
    - Add 'amazon_link' column to books table
    - Add 'review_link' column to books table
    - These links will allow users to view the book on Amazon and read/write reviews
*/

-- Add amazon_link column to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS amazon_link TEXT;

-- Add review_link column to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS review_link TEXT;
