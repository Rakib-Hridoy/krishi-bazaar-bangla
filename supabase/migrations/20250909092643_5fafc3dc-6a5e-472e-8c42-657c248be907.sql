-- Add new columns to bids table for confirmation and abandonment tracking
ALTER TABLE public.bids 
ADD COLUMN confirmation_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN abandoned_at TIMESTAMP WITH TIME ZONE;

-- Update the status constraint to include new statuses
ALTER TABLE public.bids 
DROP CONSTRAINT IF EXISTS bids_status_check;

ALTER TABLE public.bids 
ADD CONSTRAINT bids_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected', 'confirmed', 'completed', 'abandoned'));

-- Create function to automatically set confirmation deadline when bid is accepted
CREATE OR REPLACE FUNCTION public.set_confirmation_deadline()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changes to accepted, set confirmation deadline to 48 hours from now
  IF OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
    NEW.confirmation_deadline = now() + interval '48 hours';
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
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for confirmation deadline
CREATE TRIGGER set_bid_confirmation_deadline
  BEFORE UPDATE ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.set_confirmation_deadline();

-- Create function to auto-abandon expired bids
CREATE OR REPLACE FUNCTION public.abandon_expired_bids()
RETURNS INTEGER AS $$
DECLARE
  abandoned_count INTEGER := 0;
BEGIN
  -- Update accepted bids that have passed their confirmation deadline
  UPDATE public.bids 
  SET status = 'abandoned', abandoned_at = now()
  WHERE status = 'accepted' 
    AND confirmation_deadline IS NOT NULL 
    AND now() > confirmation_deadline;
    
  GET DIAGNOSTICS abandoned_count = ROW_COUNT;
  RETURN abandoned_count;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add penalty tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN bid_abandonment_count INTEGER DEFAULT 0,
ADD COLUMN last_abandonment_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN bid_suspension_until TIMESTAMP WITH TIME ZONE;

-- Create function to track bid abandonments and apply penalties
CREATE OR REPLACE FUNCTION public.track_bid_abandonment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'abandoned' AND OLD.status != 'abandoned' THEN
    -- Increment abandonment count for the buyer
    UPDATE public.profiles 
    SET bid_abandonment_count = COALESCE(bid_abandonment_count, 0) + 1,
        last_abandonment_at = now()
    WHERE id = NEW.buyer_id;
    
    -- Apply suspension if abandonment count reaches 3
    UPDATE public.profiles 
    SET bid_suspension_until = now() + interval '7 days'
    WHERE id = NEW.buyer_id 
      AND COALESCE(bid_abandonment_count, 0) >= 3;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for tracking abandonment
CREATE TRIGGER track_bid_abandonment_trigger
  AFTER UPDATE ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.track_bid_abandonment();

-- Create function to check if user can bid (not suspended)
CREATE OR REPLACE FUNCTION public.can_user_bid(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
      AND bid_suspension_until IS NOT NULL 
      AND bid_suspension_until > now()
  );
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Update the existing bid insertion trigger to check suspension
CREATE OR REPLACE FUNCTION public.check_bid_eligibility()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user is suspended from bidding
  IF NOT public.can_user_bid(NEW.buyer_id) THEN
    RAISE EXCEPTION 'আপনি সাময়িকভাবে বিডিং করা থেকে নিষিদ্ধ। পরে চেষ্টা করুন।';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for bid eligibility check
CREATE TRIGGER check_bid_eligibility_trigger
  BEFORE INSERT ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.check_bid_eligibility();