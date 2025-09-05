-- Create admin-only policy for profiles table
-- This allows admin users to view all profile data for management purposes

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);