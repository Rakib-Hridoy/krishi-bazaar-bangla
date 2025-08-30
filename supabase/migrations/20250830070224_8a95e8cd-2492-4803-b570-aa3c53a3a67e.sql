-- Create a function to get public delivery partner information
CREATE OR REPLACE FUNCTION public.get_delivery_partner_public_info(partner_id uuid)
RETURNS TABLE(
  id uuid,
  name character varying,
  rating numeric,
  vehicle_type character varying,
  is_active boolean
) 
LANGUAGE sql 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    dp.id,
    dp.name,
    dp.rating,
    dp.vehicle_type,
    dp.is_active
  FROM delivery_partners dp
  WHERE dp.id = partner_id;
$$;

-- Drop the existing policy for users viewing delivery partners
DROP POLICY IF EXISTS "Users can view delivery partners for their deliveries" ON delivery_partners;

-- Create a new restrictive policy that only allows viewing public info
CREATE POLICY "Users can view limited delivery partner info for their deliveries" 
ON delivery_partners 
FOR SELECT 
USING (
  -- Only allow access to public fields through the function
  -- This policy will be used in conjunction with application-level filtering
  EXISTS (
    SELECT 1 FROM delivery_tracking dt
    WHERE dt.delivery_partner_id = delivery_partners.id 
    AND (dt.buyer_id = auth.uid() OR dt.seller_id = auth.uid())
  )
  AND 
  -- Restrict which columns can be accessed by regular users
  -- Only name, rating, vehicle_type, and is_active should be visible
  current_setting('row_security.restricted_columns', true)::boolean IS NOT TRUE
);

-- Create a view for public delivery partner information
CREATE OR REPLACE VIEW public.delivery_partners_public AS
SELECT 
  id,
  name,
  rating,
  vehicle_type,
  is_active,
  created_at,
  updated_at
FROM delivery_partners;

-- Grant SELECT permission on the view to authenticated users
GRANT SELECT ON public.delivery_partners_public TO authenticated;

-- Create RLS policy for the view
ALTER VIEW public.delivery_partners_public SET (security_invoker = true);

-- Update the restrictive policy to be more specific
DROP POLICY IF EXISTS "Users can view limited delivery partner info for their deliveries" ON delivery_partners;

-- Create policy that completely blocks access to sensitive fields for regular users
CREATE POLICY "Users can only access delivery partners through public view" 
ON delivery_partners 
FOR SELECT 
USING (
  -- Only admins and the delivery partner themselves can access full records
  (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  ) 
  OR 
  (auth.uid() = delivery_partners.id)
);