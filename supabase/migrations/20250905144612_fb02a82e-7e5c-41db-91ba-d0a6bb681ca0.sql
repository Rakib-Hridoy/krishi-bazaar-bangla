-- Secure profiles: restrict sensitive data and expose safe public view

-- 1) Remove permissive SELECT policies on profiles
DROP POLICY IF EXISTS "Safe public profile info only" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles viewable with restrictions" ON public.profiles;

-- Keep "Users can view their own profile" and UPDATE policies as-is

-- 2) Create or replace a safe public view exposing only non-sensitive fields
CREATE OR REPLACE VIEW public.safe_public_profiles AS
SELECT 
  id,
  created_at,
  name,
  avatar_url,
  role
FROM public.profiles;

-- 3) Grant read access on the safe view to both anon and authenticated roles
GRANT SELECT ON public.safe_public_profiles TO anon;
GRANT SELECT ON public.safe_public_profiles TO authenticated;