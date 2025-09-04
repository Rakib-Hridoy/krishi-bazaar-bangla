-- Address remaining Security Definer issues by reviewing each function
-- Some SECURITY DEFINER functions are legitimate for triggers, but let's review and fix where possible

-- The handle_new_user function needs SECURITY DEFINER to insert into profiles table
-- This is legitimate and necessary for the auth trigger to work

-- The notification functions might not need SECURITY DEFINER if we fix the RLS policies
-- Let's recreate them without SECURITY DEFINER and ensure proper RLS policies

-- First, let's check if we can make the notification functions work without SECURITY DEFINER
-- by ensuring the notifications table has proper INSERT policies

-- Update notification trigger functions to not use SECURITY DEFINER where possible
CREATE OR REPLACE FUNCTION public.notify_new_bid()
RETURNS TRIGGER
LANGUAGE plpgsql
-- Remove SECURITY DEFINER and let it use SECURITY INVOKER (default)
SET search_path = 'public'
AS $$
DECLARE
  product_info RECORD;
BEGIN
  -- Get product details
  SELECT title, seller_id INTO product_info
  FROM public.products 
  WHERE id = NEW.product_id;
  
  -- Notify the seller about new bid
  INSERT INTO public.notifications (user_id, type, title, message, metadata)
  VALUES (
    product_info.seller_id,
    'bid',
    'নতুন বিড পেয়েছেন',
    '"' || product_info.title || '" প্রোডাক্টের জন্য ৳' || NEW.amount || ' টাকার বিড পেয়েছেন।',
    jsonb_build_object(
      'bid_id', NEW.id, 
      'product_id', NEW.product_id,
      'product_title', product_info.title,
      'bid_amount', NEW.amount,
      'action', 'new_bid'
    )
  );
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_bid_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
-- Remove SECURITY DEFINER 
SET search_path = 'public'
AS $$
DECLARE
  product_info RECORD;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    -- Get product details
    SELECT title INTO product_info
    FROM public.products 
    WHERE id = NEW.product_id;
    
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.buyer_id,
      'bid',
      CASE WHEN NEW.status = 'accepted' THEN 'আপনার বিড গৃহীত হয়েছে' ELSE 'আপনার বিড প্রত্যাখ্যাত হয়েছে' END,
      CASE WHEN NEW.status = 'accepted' 
        THEN '"' || product_info.title || '" প্রোডাক্টের জন্য আপনার ৳' || NEW.amount || ' টাকার বিড গৃহীত হয়েছে।'
        ELSE '"' || product_info.title || '" প্রোডাক্টের জন্য আপনার ৳' || NEW.amount || ' টাকার বিড প্রত্যাখ্যাত হয়েছে।'
      END,
      jsonb_build_object(
        'bid_id', NEW.id, 
        'product_id', NEW.product_id,
        'product_title', product_info.title,
        'bid_amount', NEW.amount,
        'status', NEW.status,
        'action', 'bid_status_change'
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Update the cleanup function to not use SECURITY DEFINER if possible
CREATE OR REPLACE FUNCTION public.cleanup_expired_products()
RETURNS integer
LANGUAGE plpgsql
-- Remove SECURITY DEFINER - this function should run with caller's permissions
SET search_path = 'public'
AS $$
DECLARE
  deleted_count integer := 0;
BEGIN
  DELETE FROM public.products
  WHERE now() > (bidding_deadline + interval '3 days');

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;