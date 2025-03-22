/*
  # Fix ageRange column naming issue
  
  1. Changes
    - Rename 'agerange' column to 'age_range' in books table
    - We're changing the column name to follow SQL convention (snake_case)
    - The application code will map between camelCase and snake_case
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'books' AND column_name = 'agerange'
  ) THEN
    ALTER TABLE books RENAME COLUMN agerange TO age_range;
  END IF;
END $$;