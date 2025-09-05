-- Fix linter: ensure views run with invoker rights, not definer rights
ALTER VIEW public.safe_public_profiles SET (security_invoker = true);
ALTER VIEW public.delivery_partners_public SET (security_invoker = true);