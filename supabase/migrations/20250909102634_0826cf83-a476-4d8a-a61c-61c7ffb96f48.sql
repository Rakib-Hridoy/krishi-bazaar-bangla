-- Add new bid status for winners and update existing system for automatic auctions
ALTER TYPE bid_status ADD VALUE IF NOT EXISTS 'won';

-- Create function to automatically select highest bidder when auction ends
CREATE OR REPLACE FUNCTION public.process_auction_end(product_id_param uuid)
RETURNS TABLE(winner_bid_id uuid, winner_user_id uuid, winning_amount numeric)
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  highest_bid RECORD;
BEGIN
  -- Find the highest bid for this product
  SELECT id, buyer_id, amount INTO highest_bid
  FROM public.bids 
  WHERE product_id = product_id_param 
    AND status = 'pending'
  ORDER BY amount DESC, created_at ASC
  LIMIT 1;
  
  IF highest_bid.id IS NOT NULL THEN
    -- Update the winning bid
    UPDATE public.bids 
    SET status = 'won', 
        confirmation_deadline = now() + interval '6 hours'
    WHERE id = highest_bid.id;
    
    -- Mark all other bids as rejected
    UPDATE public.bids 
    SET status = 'rejected'
    WHERE product_id = product_id_param 
      AND status = 'pending' 
      AND id != highest_bid.id;
    
    -- Return winner information
    RETURN QUERY SELECT highest_bid.id, highest_bid.buyer_id, highest_bid.amount;
  END IF;
  
  RETURN;
END;
$$;

-- Create function to check for expired auctions and process them
CREATE OR REPLACE FUNCTION public.process_expired_auctions()
RETURNS TABLE(processed_product_id uuid, winner_user_id uuid, winning_amount numeric)
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  expired_product RECORD;
  winner_info RECORD;
BEGIN
  -- Find products with expired bidding deadlines that haven't been processed
  FOR expired_product IN 
    SELECT DISTINCT p.id, p.title
    FROM public.products p
    WHERE p.bidding_deadline < now()
      AND EXISTS (
        SELECT 1 FROM public.bids b 
        WHERE b.product_id = p.id AND b.status = 'pending'
      )
  LOOP
    -- Process each expired auction
    SELECT * INTO winner_info 
    FROM public.process_auction_end(expired_product.id);
    
    IF winner_info.winner_bid_id IS NOT NULL THEN
      -- Return the processed auction info
      RETURN QUERY SELECT expired_product.id, winner_info.winner_user_id, winner_info.winning_amount;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$;

-- Create notification trigger for auction winners
CREATE OR REPLACE FUNCTION public.notify_auction_winner()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  product_info RECORD;
BEGIN
  IF NEW.status = 'won' AND OLD.status != 'won' THEN
    -- Get product details
    SELECT title, seller_id INTO product_info
    FROM public.products 
    WHERE id = NEW.product_id;
    
    -- Notify the winner
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.buyer_id,
      'auction',
      'আপনি নিলামে জিতেছেন!',
      'অভিনন্দন! আপনি "' || product_info.title || '" পণ্যের নিলামে জিতেছেন। আপনার বিড: ৳' || NEW.amount || '। ৬ ঘন্টার মধ্যে বিক্রেতার সাথে যোগাযোগ করুন।',
      jsonb_build_object(
        'bid_id', NEW.id, 
        'product_id', NEW.product_id,
        'product_title', product_info.title,
        'winning_amount', NEW.amount,
        'seller_id', product_info.seller_id,
        'action', 'auction_won',
        'deadline', NEW.confirmation_deadline
      )
    );
    
    -- Also notify the seller
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      product_info.seller_id,
      'auction',
      'আপনার পণ্যের নিলাম শেষ',
      '"' || product_info.title || '" পণ্যের নিলাম শেষ হয়েছে। বিজয়ী: ৳' || NEW.amount || ' বিডে।',
      jsonb_build_object(
        'bid_id', NEW.id, 
        'product_id', NEW.product_id,
        'product_title', product_info.title,
        'winning_amount', NEW.amount,
        'winner_id', NEW.buyer_id,
        'action', 'auction_ended'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auction winner notifications
DROP TRIGGER IF EXISTS trigger_notify_auction_winner ON public.bids;
CREATE TRIGGER trigger_notify_auction_winner
  AFTER UPDATE ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_auction_winner();