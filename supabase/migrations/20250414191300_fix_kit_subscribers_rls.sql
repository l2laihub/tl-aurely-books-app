-- Migration to fix RLS policy for kit_subscribers table
-- This migration updates the RLS policy to explicitly allow anonymous users to insert subscribers

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anyone can insert kit subscribers" ON kit_subscribers;

-- Create updated policy that explicitly allows both anonymous and authenticated users
CREATE POLICY "Anyone can insert kit subscribers" 
  ON kit_subscribers FOR INSERT 
  TO anon, authenticated
  WITH CHECK (TRUE);

-- Ensure RLS is enabled on the table
ALTER TABLE kit_subscribers ENABLE ROW LEVEL SECURITY;