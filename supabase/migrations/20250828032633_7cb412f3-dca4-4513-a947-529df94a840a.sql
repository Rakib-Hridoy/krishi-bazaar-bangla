-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create new restrictive policies for profile access
-- Policy 1: Users can view their own complete profile
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Authenticated users can view basic public info of other profiles
-- This will be handled in the application layer by creating a security definer function
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  role text,
  avatar_url text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    p.id,
    p.name,
    p.role,
    p.avatar_url,
    p.created_at
  FROM public.profiles p
  WHERE p.id = profile_user_id;
$$;

-- Update the existing update policy to be more explicit
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);