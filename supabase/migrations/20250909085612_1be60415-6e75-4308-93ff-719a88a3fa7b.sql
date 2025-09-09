-- Add bidding start time column to products table
ALTER TABLE public.products 
ADD COLUMN bidding_start_time timestamp with time zone DEFAULT now();