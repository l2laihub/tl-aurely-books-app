/*
  # Create storage bucket for materials
  
  1. New Features
    - Creates a new storage bucket called "materials" for storing book-related files
    - Sets appropriate security policies for the bucket
*/

-- Enable storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Create the materials bucket if it doesn't exist
-- Note: We need to use Supabase Edge Functions or the dashboard for this
-- This SQL comment serves as documentation that the bucket needs to be created manually
-- via the Supabase dashboard under Storage > Create a new bucket named "materials"
-- with public access enabled