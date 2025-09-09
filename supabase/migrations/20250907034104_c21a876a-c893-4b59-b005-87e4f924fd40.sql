-- 1) Ensure helper to get current user role exists
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 2) Admin policies: allow admins to update and delete any profile
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can delete all profiles" ON public.profiles;
CREATE POLICY "Admins can delete all profiles"
ON public.profiles
FOR DELETE
USING (public.get_current_user_role() = 'admin');

-- 3) Public-safe view for minimal profile info (name/avatar/role)
CREATE OR REPLACE VIEW public.safe_public_profiles AS
SELECT id, created_at, role, name, avatar_url
FROM public.profiles;

-- Ensure the view runs with definer privileges so it bypasses profiles RLS
ALTER VIEW public.safe_public_profiles SET (security_invoker = false);

-- Grant read access to both anonymous and authenticated users
GRANT SELECT ON public.safe_public_profiles TO anon, authenticated;