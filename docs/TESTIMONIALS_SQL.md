# Testimonial Management Feature - SQL Implementation

## Database Schema Creation

The following SQL script can be executed in the Supabase SQL Editor to create the necessary table and policies for the testimonial management feature.

```sql
-- Create testimonials table
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  date DATE NOT NULL,
  source TEXT,
  verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by book_id
CREATE INDEX testimonials_book_id_idx ON testimonials(book_id);

-- Enable Row Level Security
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Allow authenticated users (admins) to perform all operations
CREATE POLICY "Admins can do all operations" 
ON testimonials 
FOR ALL 
TO authenticated 
USING (true);

-- Allow anonymous users to read testimonials
CREATE POLICY "Anonymous users can read testimonials"
ON testimonials
FOR SELECT
TO anon
USING (true);

-- Allow public read access
CREATE POLICY "Public can view testimonials" 
ON testimonials 
FOR SELECT 
TO anon 
USING (true);

## Migration for Adding Title Column

If you've already created the testimonials table and need to add the title column, use the following SQL:

```sql
-- Add title column to existing testimonials table
ALTER TABLE testimonials ADD COLUMN title TEXT;
```

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on record update
CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON testimonials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional, for testing)
INSERT INTO testimonials (book_id, reviewer_name, rating, content, date, source, verified_purchase)
VALUES 
  -- Replace with actual book IDs from your database
  ('REPLACE_WITH_BOOK_ID', 'Jane Smith', 5, 'This book was amazing! My kids loved it and asked to read it every night.', '2025-03-15', 'Amazon', true),
  ('REPLACE_WITH_BOOK_ID', 'John Doe', 4, 'Great illustrations and engaging story. Would recommend for ages 5-8.', '2025-02-28', 'Goodreads', false),
  ('REPLACE_WITH_BOOK_ID', 'Sarah Johnson', 5, 'Beautiful message about kindness. This book has become a family favorite.', '2025-04-01', 'Amazon', true);
```

## How to Execute

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Paste the SQL script above
4. Replace `'REPLACE_WITH_BOOK_ID'` with actual book IDs from your database (for sample data)
5. Execute the script

## Verification Queries

After executing the script, you can verify the setup with these queries:

```sql
-- Check if table was created correctly
SELECT * FROM information_schema.tables WHERE table_name = 'testimonials';

-- Check if policies were created correctly
SELECT * FROM pg_policies WHERE tablename = 'testimonials';

-- Check if trigger was created correctly
SELECT * FROM information_schema.triggers WHERE trigger_name = 'update_testimonials_updated_at';

-- If you added sample data, check if it was inserted correctly
SELECT * FROM testimonials;
```

## Rollback Script

If you need to remove the testimonials feature, you can use this script:

```sql
-- Drop trigger
DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop table (will automatically drop associated policies)
DROP TABLE IF EXISTS testimonials;
```

## Notes

- The `ON DELETE CASCADE` constraint ensures that when a book is deleted, all associated testimonials are automatically deleted as well.
- The RLS policies ensure that:
  - Only authenticated users (admins) can create, update, or delete testimonials
  - Anyone can view testimonials
- The trigger automatically updates the `updated_at` timestamp whenever a testimonial is modified
