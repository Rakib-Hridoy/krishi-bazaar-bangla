-- Enable Row Level Security for delivery_partners table
ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;

-- Allow delivery partners to view and update their own profile
CREATE POLICY "Delivery partners can view their own profile" 
ON public.delivery_partners 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Delivery partners can update their own profile" 
ON public.delivery_partners 
FOR UPDATE 
USING (auth.uid() = id);

-- Allow users involved in delivery tracking to view basic delivery partner info for their deliveries
CREATE POLICY "Users can view delivery partners for their deliveries" 
ON public.delivery_partners 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM delivery_tracking dt
    WHERE dt.delivery_partner_id = delivery_partners.id
    AND (dt.buyer_id = auth.uid() OR dt.seller_id = auth.uid())
  )
);

-- Allow admins to manage delivery partners (assuming admin role exists)
CREATE POLICY "Admins can manage delivery partners" 
ON public.delivery_partners 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);