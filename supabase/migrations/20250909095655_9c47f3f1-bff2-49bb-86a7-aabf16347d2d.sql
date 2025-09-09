-- Update confirmation deadline from 48 hours to 6 hours
CREATE OR REPLACE FUNCTION public.set_confirmation_deadline()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- If status changes to accepted, set confirmation deadline to 6 hours from now
  IF OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
    NEW.confirmation_deadline = now() + interval '6 hours';
  END IF;
  
  -- If status changes to confirmed, set confirmed_at timestamp
  IF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
    NEW.confirmed_at = now();
  END IF;
  
  -- If status changes to abandoned, set abandoned_at timestamp
  IF OLD.status != 'abandoned' AND NEW.status = 'abandoned' THEN
    NEW.abandoned_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;