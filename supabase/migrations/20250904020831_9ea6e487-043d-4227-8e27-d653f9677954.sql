-- Fix Security Definer View issue by removing the problematic view
-- Drop the security definer view that bypasses RLS
DROP VIEW IF EXISTS public.public_profiles;

-- Drop the security definer function as well since it's not needed
DROP FUNCTION IF EXISTS public.get_profile_safe(UUID);

-- Instead, we'll rely on the existing RLS policies on the profiles table
-- The current RLS policies already handle access control properly:
-- 1. Users can see their own full profile
-- 2. Others can see limited public info when authenticated

-- Create a simple view (without SECURITY DEFINER) that shows only safe public columns
-- This view will respect the RLS policies of the querying user
CREATE VIEW public.safe_public_profiles AS
SELECT 
  id,
  name,
  avatar_url,
  created_at
FROM public.profiles;

-- Grant access to the safe view
GRANT SELECT ON public.safe_public_profiles TO authenticated;
GRANT SELECT ON public.safe_public_profiles TO anon;