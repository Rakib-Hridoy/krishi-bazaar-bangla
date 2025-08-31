-- Fix sensitive delivery data access vulnerability
-- Remove the conflicting RLS policy that allows broader access to the main delivery_partners table

-- Drop the problematic policy that allows users to access the main table
DROP POLICY IF EXISTS "Users can only access delivery partners through public view" ON public.delivery_partners;

-- Ensure the main delivery_partners table is only accessible by:
-- 1. Admins (for management)
-- 2. Delivery partners themselves (for their own profiles)

-- The existing policies already handle this correctly:
-- "Admins can manage delivery partners" - allows admins full access
-- "Delivery partners can update their own profile" - allows delivery partners to update themselves
-- "Delivery partners can view their own profile" - allows delivery partners to view themselves

-- Ensure the delivery_partners_public view exists and is accessible to everyone
-- (This should already exist based on the schema, but let's make sure)

-- Create a policy on the public view to allow everyone to read it
DROP POLICY IF EXISTS "Everyone can view public delivery partner info" ON public.delivery_partners_public;
CREATE POLICY "Everyone can view public delivery partner info" 
ON public.delivery_partners_public 
FOR SELECT 
USING (true);

-- Verify RLS is enabled on both tables
ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_partners_public ENABLE ROW LEVEL SECURITY;