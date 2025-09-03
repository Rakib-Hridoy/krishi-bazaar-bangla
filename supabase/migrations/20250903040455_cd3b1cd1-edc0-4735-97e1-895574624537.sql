-- Create trigger to notify sellers when new bids are placed
CREATE OR REPLACE FUNCTION public.notify_new_bid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create trigger for new bids
DROP TRIGGER IF EXISTS trg_notify_new_bid ON public.bids;
CREATE TRIGGER trg_notify_new_bid
AFTER INSERT ON public.bids
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_bid();

-- Update existing function to include product info in bid status notifications
CREATE OR REPLACE FUNCTION public.notify_bid_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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