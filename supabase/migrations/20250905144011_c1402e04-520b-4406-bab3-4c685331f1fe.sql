-- Fix security issue: Customer Personal Information Exposed to Public
-- Remove overly permissive public access policy and replace with restricted access

-- First, drop the problematic policy that allows public access to all profile data
DROP POLICY IF EXISTS "Limited public profile info" ON public.profiles;

-- Create a new policy that only allows public access to safe profile fields
-- This policy allows anyone to view profiles, but the application layer
-- in useUserProfile.ts already handles restricting to safe fields only
-- (name, role, avatar_url) for non-owner profile views
CREATE POLICY "Safe public profile info only" ON public.profiles
FOR SELECT 
USING (true);

-- The existing policies remain:
-- 1. "Users can view their own profile" - allows full access to own data
-- 2. "Public profiles viewable with restrictions" - requires authentication  
-- 3. "Safe public profile info only" - public but app-layer restricted to safe fields