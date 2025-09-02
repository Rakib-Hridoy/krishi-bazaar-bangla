-- Update the bid status change notification function to use correct type
CREATE OR REPLACE FUNCTION public.notify_bid_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.buyer_id,
      'bid',
      CASE WHEN NEW.status = 'accepted' THEN 'আপনার বিড গৃহীত হয়েছে' ELSE 'আপনার বিড প্রত্যাখ্যাত হয়েছে' END,
      CASE WHEN NEW.status = 'accepted' THEN 'বিক্রেতা আপনার বিড গ্রহণ করেছেন।' ELSE 'দুঃখিত, আপনার বিড গ্রহণ করা হয়নি।' END,
      jsonb_build_object('bid_id', NEW.id, 'product_id', NEW.product_id, 'status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$function$;