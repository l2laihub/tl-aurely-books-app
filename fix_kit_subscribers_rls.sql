-- Direct SQL script to fix RLS policy for kit_subscribers table
-- Run this script directly in the Supabase SQL editor

-- First, check if RLS is enabled on the table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'kit_subscribers';

-- Make sure RLS is enabled
ALTER TABLE public.kit_subscribers ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies for the table to start fresh
DROP POLICY IF EXISTS "Anyone can insert kit subscribers" ON public.kit_subscribers;
DROP POLICY IF EXISTS "Authenticated users can read kit subscribers" ON public.kit_subscribers;
DROP POLICY IF EXISTS "Authenticated users can update kit subscribers" ON public.kit_subscribers;
DROP POLICY IF EXISTS "Authenticated users can delete kit subscribers" ON public.kit_subscribers;

-- Create the policies again with explicit roles
-- Allow anyone (including anonymous users) to insert subscribers
CREATE POLICY "Anyone can insert kit subscribers" 
  ON public.kit_subscribers FOR INSERT 
  TO anon, authenticated
  WITH CHECK (TRUE);

-- Only authenticated users can read subscribers
CREATE POLICY "Authenticated users can read kit subscribers" 
  ON public.kit_subscribers FOR SELECT 
  TO authenticated
  USING (TRUE);

-- Only authenticated users can update subscribers
CREATE POLICY "Authenticated users can update kit subscribers" 
  ON public.kit_subscribers FOR UPDATE 
  TO authenticated
  USING (TRUE);

-- Only authenticated users can delete subscribers
CREATE POLICY "Authenticated users can delete kit subscribers" 
  ON public.kit_subscribers FOR DELETE 
  TO authenticated
  USING (TRUE);

-- Verify the policies were created correctly
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'kit_subscribers';