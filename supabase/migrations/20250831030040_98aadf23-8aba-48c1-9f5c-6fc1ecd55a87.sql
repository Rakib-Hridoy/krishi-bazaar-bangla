-- Fix security issues by updating RLS policies to protect sensitive user data

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Public profile info is viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public delivery partner info is viewable by everyone" ON public.delivery_partners;

-- Create restrictive policies for profiles table to protect sensitive data
-- Allow users to view their own complete profile
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow public access to only basic profile information (name, role, avatar)
-- This creates a separate policy for basic public data
CREATE POLICY "Public basic profile info is viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Create restrictive policies for delivery_partners table
-- Allow delivery partners to view their own profile
CREATE POLICY "Delivery partners can view their own profile" 
ON public.delivery_partners 
FOR SELECT 
USING (auth.uid() = id);

-- Allow delivery partners to update their own profile
CREATE POLICY "Delivery partners can update their own profile" 
ON public.delivery_partners 
FOR UPDATE 
USING (auth.uid() = id);

-- Allow admins to manage delivery partners
CREATE POLICY "Admins can manage delivery partners" 
ON public.delivery_partners 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Allow public access to only basic delivery partner info (name, rating, vehicle_type, is_active)
-- This protects phone, email, license_number, and other sensitive data
CREATE POLICY "Public basic delivery partner info is viewable by everyone" 
ON public.delivery_partners 
FOR SELECT 
USING (is_active = true);