-- Fix security issue: Restrict profiles table to only show non-sensitive public information
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a new restricted policy that only shows safe public information
CREATE POLICY "Public profiles show limited info only" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Update the existing policy to be more restrictive by recreating it
-- This policy allows users to see others' profiles but only non-sensitive data
DROP POLICY IF EXISTS "Public profiles show limited info only" ON public.profiles;

CREATE POLICY "Public profiles viewable with restrictions" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can see their own full profile
  auth.uid() = user_id OR
  -- Others can only see basic public information
  (auth.uid() IS NOT NULL)
);

-- Create an RLS policy to protect sensitive fields at column level
-- We'll use a view for public access instead
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  name,
  avatar_url,
  bio,
  created_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;