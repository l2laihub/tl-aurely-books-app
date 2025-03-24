/*
  # Add Amazon and Review Links to Books Table
  
  1. Changes
    - Add 'amazon_link' column to books table for Amazon product links
    - Add 'review_link' column to books table for book review links
    - These links will allow users to view the book on Amazon and read/write reviews
*/

-- Add amazon_link column to books table if it doesn't exist
ALTER TABLE books ADD COLUMN IF NOT EXISTS amazon_link TEXT;

-- Add review_link column to books table if it doesn't exist
ALTER TABLE books ADD COLUMN IF NOT EXISTS review_link TEXT;
