-- Fix remaining SECURITY DEFINER functions
-- Keep only the essential ones that truly need elevated privileges

-- The prevent_bids_after_deadline function can work without SECURITY DEFINER
-- since it only needs to read from products table and that's already accessible
CREATE OR REPLACE FUNCTION public.prevent_bids_after_deadline()
RETURNS TRIGGER
LANGUAGE plpgsql
-- Remove SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  prod_deadline timestamptz;
BEGIN
  SELECT bidding_deadline INTO prod_deadline FROM public.products WHERE id = NEW.product_id;
  IF prod_deadline IS NULL THEN
    RETURN NEW;
  END IF;

  IF now() > prod_deadline THEN
    RAISE EXCEPTION 'Bidding period ended for this product';
  END IF;

  RETURN NEW;
END;
$$;

-- The handle_new_user function MUST keep SECURITY DEFINER because:
-- 1. It's a trigger that runs in the context of auth.users table operations
-- 2. It needs to insert into profiles table even when RLS would normally block it
-- 3. This is a legitimate use case for SECURITY DEFINER in auth triggers
-- So we'll keep this one as is since it's necessary for the auth flow to work

-- Note: The handle_new_user function will remain SECURITY DEFINER as it's essential
-- for the authentication trigger to work properly and insert user profiles