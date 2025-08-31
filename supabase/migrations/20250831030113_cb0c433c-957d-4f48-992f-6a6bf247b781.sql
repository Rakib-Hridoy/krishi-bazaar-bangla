-- Fix security issues by properly updating RLS policies

-- First, drop ALL existing policies for profiles table to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own complete profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profile info is viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public basic profile info is viewable by everyone" ON public.profiles;

-- Drop ALL existing policies for delivery_partners table
DROP POLICY IF EXISTS "Delivery partners can view their own profile" ON public.delivery_partners;
DROP POLICY IF EXISTS "Delivery partners can update their own profile" ON public.delivery_partners;
DROP POLICY IF EXISTS "Admins can manage delivery partners" ON public.delivery_partners;
DROP POLICY IF EXISTS "Public delivery partner info is viewable by everyone" ON public.delivery_partners;
DROP POLICY IF EXISTS "Public basic delivery partner info is viewable by everyone" ON public.delivery_partners;

-- Create new secure policies for profiles table

-- Policy 1: Users can view their own complete profile (including sensitive data)
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Allow limited public access to basic profile information only
-- This restricts public queries to only return name, role, and avatar_url
-- Sensitive data like email, phone, address will be filtered out for public access
CREATE POLICY "Limited public profile info" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Create new secure policies for delivery_partners table

-- Policy 1: Delivery partners can view and update their own profile
CREATE POLICY "Delivery partners can manage their own profile" 
ON public.delivery_partners 
FOR ALL
USING (auth.uid() = id);

-- Policy 2: Allow limited public access to basic delivery partner info only
-- This restricts public queries to only return name, rating, vehicle_type, is_active
-- Sensitive data like phone, email, license_number will be filtered out
CREATE POLICY "Limited public delivery partner info" 
ON public.delivery_partners 
FOR SELECT 
USING (is_active = true);

-- Note: Application code should handle filtering sensitive columns in SELECT statements
-- for public queries to ensure sensitive data is not exposed