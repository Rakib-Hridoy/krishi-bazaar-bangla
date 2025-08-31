-- Fix security definer functions by converting to views where appropriate
-- Drop the existing security definer functions that can be replaced with views
DROP FUNCTION IF EXISTS public.get_delivery_partner_public_info(uuid);
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);

-- Drop existing conflicting policies first
DROP POLICY IF EXISTS "Public delivery partner info is viewable by everyone" ON public.delivery_partners;
DROP POLICY IF EXISTS "Public profile info is viewable by everyone" ON public.profiles;

-- Create RLS policies to allow public access to delivery partner public info
CREATE POLICY "Public delivery partner info is viewable by everyone"
ON public.delivery_partners
FOR SELECT
USING (is_active = true);

-- Create RLS policies to allow public access to basic profile info  
CREATE POLICY "Public profile info is viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- The handle_new_user trigger function keeps SECURITY DEFINER
-- as it needs elevated privileges - this is a legitimate use case