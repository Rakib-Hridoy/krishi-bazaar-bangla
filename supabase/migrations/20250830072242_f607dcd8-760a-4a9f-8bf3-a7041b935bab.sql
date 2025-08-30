-- Fix sensitive delivery data access vulnerability
-- Remove the conflicting RLS policy and properly secure the delivery partners data

-- Drop the problematic policy that allows users to access the main table directly
DROP POLICY IF EXISTS "Users can only access delivery partners through public view" ON public.delivery_partners;

-- Create or replace the public view with only non-sensitive fields
CREATE OR REPLACE VIEW public.delivery_partners_public AS
SELECT 
  id,
  name,
  rating,
  vehicle_type,
  is_active,
  created_at,
  updated_at
FROM public.delivery_partners
WHERE is_active = true;

-- Grant SELECT permission on the view to authenticated users
GRANT SELECT ON public.delivery_partners_public TO authenticated;
GRANT SELECT ON public.delivery_partners_public TO anon;

-- Now the main delivery_partners table is only accessible by:
-- 1. Admins (via "Admins can manage delivery partners" policy)
-- 2. Delivery partners themselves (via existing policies)
-- All other users must use the public view which only shows safe fields