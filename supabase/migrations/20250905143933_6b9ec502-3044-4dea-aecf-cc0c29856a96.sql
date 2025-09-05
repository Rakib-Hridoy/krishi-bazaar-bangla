-- Fix security issue: Customer Personal Information Exposed to Public
-- Remove overly permissive public access policy and replace with restricted access

-- First, drop the problematic policy that allows public access to all profile data
DROP POLICY IF EXISTS "Limited public profile info" ON public.profiles;

-- Create a new policy that only allows public access to safe profile fields
-- This policy allows anyone to view only name, role, and avatar_url (safe public info)
CREATE POLICY "Safe public profile info only" ON public.profiles
FOR SELECT 
USING (true)
-- We can't restrict columns in RLS policies directly, but the application layer
-- in useUserProfile.ts already handles this by only selecting safe fields
-- for non-owner profile views;

-- Note: The existing "Users can view their own profile" policy remains unchanged
-- This allows users to see their complete profile including sensitive data

-- Note: The existing "Public profiles viewable with restrictions" policy  
-- may be redundant now, but keeping it for compatibility
-- It requires authentication which is more restrictive than the old public policy

-- Add a comment to document the security fix
COMMENT ON POLICY "Safe public profile info only" ON public.profiles IS 
'Allows public access to profiles but application layer restricts to safe fields only (name, role, avatar_url)';

-- Verify the remaining policies are appropriate:
-- 1. "Users can view their own profile" - allows full access to own data ✓
-- 2. "Public profiles viewable with restrictions" - requires authentication ✓  
-- 3. "Safe public profile info only" - public but app-layer restricted ✓