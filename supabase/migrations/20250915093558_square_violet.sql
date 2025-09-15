/*
  # Add Analytics and Penalty System

  1. New Tables
    - `penalties` - Track seller penalties for deal refusals
    - `price_history` - Track historical prices for analytics
    - `user_analytics` - Store computed analytics data
    - `product_analytics` - Store product-specific analytics

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for data access

  3. Functions
    - Function to calculate price trends
    - Function to update analytics data
    - Function to apply penalties
*/

-- Create penalties table
CREATE TABLE IF NOT EXISTS public.penalties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bid_id UUID NOT NULL,
  product_id UUID NOT NULL,
  penalty_type VARCHAR(50) NOT NULL CHECK (penalty_type IN ('deal_refusal', 'fake_listing', 'quality_issue')),
  penalty_amount DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paid', 'waived')),
  applied_by UUID,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create price_history table for analytics
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  location VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  seller_id UUID NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_analytics table
CREATE TABLE IF NOT EXISTS public.user_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_products_listed INTEGER DEFAULT 0,
  total_products_sold INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  average_product_price DECIMAL(10,2) DEFAULT 0,
  total_bids_placed INTEGER DEFAULT 0,
  total_purchases INTEGER DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  average_purchase_price DECIMAL(10,2) DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_analytics table
CREATE TABLE IF NOT EXISTS public.product_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL UNIQUE,
  total_bids INTEGER DEFAULT 0,
  highest_bid DECIMAL(10,2) DEFAULT 0,
  lowest_bid DECIMAL(10,2) DEFAULT 0,
  average_bid DECIMAL(10,2) DEFAULT 0,
  final_price DECIMAL(10,2),
  views_count INTEGER DEFAULT 0,
  interest_score DECIMAL(5,2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.penalties
ADD CONSTRAINT fk_penalties_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_penalties_bid_id FOREIGN KEY (bid_id) REFERENCES public.bids(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_penalties_product_id FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_penalties_applied_by FOREIGN KEY (applied_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.price_history
ADD CONSTRAINT fk_price_history_product_id FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_price_history_seller_id FOREIGN KEY (seller_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_analytics
ADD CONSTRAINT fk_user_analytics_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.product_analytics
ADD CONSTRAINT fk_product_analytics_product_id FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for penalties
CREATE POLICY "Users can view their own penalties"
ON public.penalties
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all penalties"
ON public.penalties
FOR ALL
USING (public.get_current_user_role() = 'admin');

-- RLS Policies for price_history
CREATE POLICY "Everyone can view price history"
ON public.price_history
FOR SELECT
USING (true);

CREATE POLICY "System can insert price history"
ON public.price_history
FOR INSERT
WITH CHECK (true);

-- RLS Policies for user_analytics
CREATE POLICY "Users can view their own analytics"
ON public.user_analytics
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view public analytics"
ON public.user_analytics
FOR SELECT
USING (true);

CREATE POLICY "System can update analytics"
ON public.user_analytics
FOR ALL
WITH CHECK (true);

-- RLS Policies for product_analytics
CREATE POLICY "Everyone can view product analytics"
ON public.product_analytics
FOR SELECT
USING (true);

CREATE POLICY "System can update product analytics"
ON public.product_analytics
FOR ALL
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_penalties_user_id ON public.penalties(user_id);
CREATE INDEX IF NOT EXISTS idx_penalties_status ON public.penalties(status);
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON public.price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at ON public.price_history(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_category ON public.price_history(category);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_product_id ON public.product_analytics(product_id);

-- Function to record price history when product is created
CREATE OR REPLACE FUNCTION public.record_price_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.price_history (
    product_id, price, quantity, unit, location, category, seller_id
  ) VALUES (
    NEW.id, NEW.price, NEW.quantity, NEW.unit, NEW.location, NEW.category, NEW.seller_id
  );
  RETURN NEW;
END;
$$;

-- Create trigger for price history
DROP TRIGGER IF EXISTS trg_record_price_history ON public.products;
CREATE TRIGGER trg_record_price_history
AFTER INSERT ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.record_price_history();

-- Function to update analytics when bid is accepted
CREATE OR REPLACE FUNCTION public.update_analytics_on_sale()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  product_info RECORD;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    -- Get product info
    SELECT * INTO product_info FROM public.products WHERE id = NEW.product_id;
    
    -- Update seller analytics
    INSERT INTO public.user_analytics (user_id, total_products_sold, total_revenue)
    VALUES (product_info.seller_id, 1, NEW.amount)
    ON CONFLICT (user_id) DO UPDATE SET
      total_products_sold = user_analytics.total_products_sold + 1,
      total_revenue = user_analytics.total_revenue + NEW.amount,
      last_updated = now();
    
    -- Update buyer analytics
    INSERT INTO public.user_analytics (user_id, total_purchases, total_spent)
    VALUES (NEW.buyer_id, 1, NEW.amount)
    ON CONFLICT (user_id) DO UPDATE SET
      total_purchases = user_analytics.total_purchases + 1,
      total_spent = user_analytics.total_spent + NEW.amount,
      last_updated = now();
    
    -- Update product analytics
    INSERT INTO public.product_analytics (product_id, final_price)
    VALUES (NEW.product_id, NEW.amount)
    ON CONFLICT (product_id) DO UPDATE SET
      final_price = NEW.amount,
      last_updated = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for analytics updates
DROP TRIGGER IF EXISTS trg_update_analytics_on_sale ON public.bids;
CREATE TRIGGER trg_update_analytics_on_sale
AFTER UPDATE ON public.bids
FOR EACH ROW
EXECUTE FUNCTION public.update_analytics_on_sale();

-- Function to update product analytics when bids are placed
CREATE OR REPLACE FUNCTION public.update_product_analytics_on_bid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.product_analytics (
      product_id, total_bids, highest_bid, lowest_bid, average_bid
    )
    SELECT 
      NEW.product_id,
      COUNT(*),
      MAX(amount),
      MIN(amount),
      AVG(amount)
    FROM public.bids 
    WHERE product_id = NEW.product_id
    ON CONFLICT (product_id) DO UPDATE SET
      total_bids = (SELECT COUNT(*) FROM public.bids WHERE product_id = NEW.product_id),
      highest_bid = (SELECT MAX(amount) FROM public.bids WHERE product_id = NEW.product_id),
      lowest_bid = (SELECT MIN(amount) FROM public.bids WHERE product_id = NEW.product_id),
      average_bid = (SELECT AVG(amount) FROM public.bids WHERE product_id = NEW.product_id),
      last_updated = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for product analytics
DROP TRIGGER IF EXISTS trg_update_product_analytics_on_bid ON public.bids;
CREATE TRIGGER trg_update_product_analytics_on_bid
AFTER INSERT ON public.bids
FOR EACH ROW
EXECUTE FUNCTION public.update_product_analytics_on_bid();

-- Function to get price trends for a category
CREATE OR REPLACE FUNCTION public.get_price_trends(
  category_name TEXT,
  time_period INTERVAL DEFAULT '6 months'::INTERVAL
)
RETURNS TABLE(
  date DATE,
  avg_price DECIMAL(10,2),
  min_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  total_quantity DECIMAL(10,2)
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    recorded_at::DATE as date,
    AVG(price) as avg_price,
    MIN(price) as min_price,
    MAX(price) as max_price,
    SUM(quantity) as total_quantity
  FROM public.price_history
  WHERE category = category_name
    AND recorded_at >= (now() - time_period)
  GROUP BY recorded_at::DATE
  ORDER BY date DESC;
$$;

-- Function to apply penalty
CREATE OR REPLACE FUNCTION public.apply_penalty(
  target_user_id UUID,
  target_bid_id UUID,
  target_product_id UUID,
  penalty_type_param TEXT,
  penalty_amount_param DECIMAL DEFAULT 0,
  description_param TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  penalty_id UUID;
BEGIN
  -- Check if caller is admin
  IF public.get_current_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Only admins can apply penalties';
  END IF;
  
  INSERT INTO public.penalties (
    user_id, bid_id, product_id, penalty_type, penalty_amount, description, applied_by
  ) VALUES (
    target_user_id, target_bid_id, target_product_id, penalty_type_param, penalty_amount_param, description_param, auth.uid()
  ) RETURNING id INTO penalty_id;
  
  -- Send notification to penalized user
  INSERT INTO public.notifications (user_id, type, title, message, metadata)
  VALUES (
    target_user_id,
    'order',
    'পেনাল্টি প্রয়োগ করা হয়েছে',
    'আপনার অ্যাকাউন্টে ' || penalty_type_param || ' এর জন্য পেনাল্টি প্রয়োগ করা হয়েছে।',
    jsonb_build_object('penalty_id', penalty_id, 'amount', penalty_amount_param)
  );
  
  RETURN penalty_id;
END;
$$;

-- Add status column to bids for withdrawal tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bids' AND column_name = 'withdrawn_at'
  ) THEN
    ALTER TABLE public.bids ADD COLUMN withdrawn_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Function to withdraw bid
CREATE OR REPLACE FUNCTION public.withdraw_bid(bid_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bid_record RECORD;
BEGIN
  -- Get bid details
  SELECT * INTO bid_record FROM public.bids WHERE id = bid_id_param;
  
  -- Check if bid exists and belongs to current user
  IF bid_record IS NULL OR bid_record.buyer_id != auth.uid() THEN
    RAISE EXCEPTION 'Bid not found or unauthorized';
  END IF;
  
  -- Check if bid is still pending
  IF bid_record.status != 'pending' THEN
    RAISE EXCEPTION 'Can only withdraw pending bids';
  END IF;
  
  -- Update bid status to withdrawn
  UPDATE public.bids 
  SET status = 'withdrawn', withdrawn_at = now()
  WHERE id = bid_id_param;
  
  RETURN TRUE;
END;
$$;