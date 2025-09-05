-- Secure profiles: restrict sensitive data and expose safe public view

-- 1) Drop existing view if it exists
DROP VIEW IF EXISTS public.safe_public_profiles;

-- 2) Remove permissive SELECT policies on profiles 
DROP POLICY IF EXISTS "Safe public profile info only" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles viewable with restrictions" ON public.profiles;

-- 3) Create a safe public view exposing only non-sensitive fields
CREATE VIEW public.safe_public_profiles AS
SELECT 
  id,
  created_at,
  name,
  avatar_url,
  role
FROM public.profiles;

-- 4) Grant read access on the safe view to both anon and authenticated roles
GRANT SELECT ON public.safe_public_profiles TO anon;
GRANT SELECT ON public.safe_public_profiles TO authenticated;