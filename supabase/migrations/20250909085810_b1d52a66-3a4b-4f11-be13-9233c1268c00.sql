-- Create trigger for bidding period validation (replacing the old one)
DROP TRIGGER IF EXISTS prevent_bids_after_deadline_trigger ON public.bids;
DROP TRIGGER IF EXISTS prevent_bids_outside_period_trigger ON public.bids;

CREATE TRIGGER prevent_bids_outside_period_trigger
  BEFORE INSERT ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_bids_outside_bidding_period();