-- Ensure updated_at is maintained on bids updates
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_bids_updated_at'
  ) THEN
    CREATE TRIGGER set_bids_updated_at
    BEFORE UPDATE ON public.bids
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Send notifications when bid status changes
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_notify_bid_status_change'
  ) THEN
    CREATE TRIGGER trg_notify_bid_status_change
    AFTER UPDATE ON public.bids
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.notify_bid_status_change();
  END IF;
END $$;