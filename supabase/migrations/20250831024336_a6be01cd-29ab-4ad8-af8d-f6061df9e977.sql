-- Fix security definer functions by converting to views where appropriate
-- and removing unnecessary SECURITY DEFINER properties

-- Drop the existing security definer functions that can be replaced with views
DROP FUNCTION IF EXISTS public.get_delivery_partner_public_info(uuid);
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);

-- Create RLS policies to allow public access to delivery partner public info
CREATE POLICY IF NOT EXISTS "Public delivery partner info is viewable by everyone"
ON public.delivery_partners
FOR SELECT
USING (is_active = true);

-- Create RLS policies to allow public access to basic profile info
CREATE POLICY IF NOT EXISTS "Public profile info is viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- The handle_new_user trigger function needs to keep SECURITY DEFINER
-- as it needs elevated privileges to insert into profiles table
-- This is a legitimate use case for SECURITY DEFINER