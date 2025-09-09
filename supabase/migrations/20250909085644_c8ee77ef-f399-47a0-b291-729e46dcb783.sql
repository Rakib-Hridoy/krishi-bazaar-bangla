-- Update the existing bidding validation function to check both start and end times
CREATE OR REPLACE FUNCTION public.prevent_bids_outside_bidding_period()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  prod_start_time timestamptz;
  prod_end_time timestamptz;
BEGIN
  SELECT bidding_start_time, bidding_deadline 
  INTO prod_start_time, prod_end_time 
  FROM public.products 
  WHERE id = NEW.product_id;
  
  IF prod_start_time IS NULL OR prod_end_time IS NULL THEN
    RETURN NEW;
  END IF;

  IF now() < prod_start_time THEN
    RAISE EXCEPTION 'Bidding has not started yet for this product';
  END IF;

  IF now() > prod_end_time THEN
    RAISE EXCEPTION 'Bidding period ended for this product';
  END IF;

  RETURN NEW;
END;
$function$