-- Add the slug column to the books table
ALTER TABLE public.books
ADD COLUMN slug TEXT;

-- Add an index to the slug column for performance
CREATE INDEX idx_books_slug ON public.books(slug);

-- Optional: Backfill slugs for existing books
-- This requires a function to generate slugs, which might be better done
-- in application code or a separate script after the column exists.
-- Example (conceptual - needs a slugify function):
-- UPDATE public.books
-- SET slug = slugify(title)
-- WHERE slug IS NULL;

-- Add a comment to the column
COMMENT ON COLUMN public.books.slug IS 'URL-friendly version of the book title for SEO and routing.';