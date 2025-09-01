-- 1) Add bidding_deadline to products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS bidding_deadline TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days');

-- Helpful index for deadline queries
CREATE INDEX IF NOT EXISTS idx_products_bidding_deadline ON public.products (bidding_deadline);

-- 2) Allow sellers to update bids on their own products (needed for accept/reject)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bids' AND policyname = 'Sellers can update bids on their products'
  ) THEN
    DROP POLICY "Sellers can update bids on their products" ON public.bids;
  END IF;
END$$;

CREATE POLICY "Sellers can update bids on their products"
ON public.bids
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT p.seller_id FROM public.products p WHERE p.id = bids.product_id
  )
);

-- 3) Prevent placing bids after the bidding deadline using a validation trigger
CREATE OR REPLACE FUNCTION public.prevent_bids_after_deadline()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

DROP TRIGGER IF EXISTS trg_prevent_bids_after_deadline ON public.bids;
CREATE TRIGGER trg_prevent_bids_after_deadline
BEFORE INSERT ON public.bids
FOR EACH ROW
EXECUTE FUNCTION public.prevent_bids_after_deadline();

-- 4) Notifications on bid status change (accepted/rejected)
CREATE OR REPLACE FUNCTION public.notify_bid_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.buyer_id,
      'bid_status',
      CASE WHEN NEW.status = 'accepted' THEN 'আপনার বিড গৃহীত হয়েছে' ELSE 'আপনার বিড প্রত্যাখ্যাত হয়েছে' END,
      CASE WHEN NEW.status = 'accepted' THEN 'বিক্রেতা আপনার বিড গ্রহণ করেছেন।' ELSE 'দুঃখিত, আপনার বিড গ্রহণ করা হয়নি।' END,
      jsonb_build_object('bid_id', NEW.id, 'product_id', NEW.product_id, 'status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_bid_status_change ON public.bids;
CREATE TRIGGER trg_notify_bid_status_change
AFTER UPDATE ON public.bids
FOR EACH ROW
EXECUTE FUNCTION public.notify_bid_status_change();

-- 5) Cleanup expired products (auto-delete 3 days after deadline) via pg_cron
CREATE OR REPLACE FUNCTION public.cleanup_expired_products()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Ensure pg_cron is available
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Recreate daily schedule at 02:00 UTC
DO $$
BEGIN
  PERFORM cron.unschedule('cleanup-expired-products-daily');
EXCEPTION WHEN OTHERS THEN
  -- ignore if it doesn't exist
  NULL;
END$$;

SELECT cron.schedule(
  'cleanup-expired-products-daily',
  '0 2 * * *',
  $$
  SELECT public.cleanup_expired_products();
  $$
);
