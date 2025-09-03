-- Ensure trigger exists to create notifications when bid status changes
DROP TRIGGER IF EXISTS trg_notify_bid_status_change ON public.bids;
CREATE TRIGGER trg_notify_bid_status_change
AFTER UPDATE ON public.bids
FOR EACH ROW
EXECUTE FUNCTION public.notify_bid_status_change();