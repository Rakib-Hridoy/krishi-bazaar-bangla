-- Drop delivery related tables that are not being used in the project

-- Drop delivery_tracking table
DROP TABLE IF EXISTS public.delivery_tracking CASCADE;

-- Drop delivery_partners table  
DROP TABLE IF EXISTS public.delivery_partners CASCADE;

-- Drop delivery_partners_public view
DROP VIEW IF EXISTS public.delivery_partners_public CASCADE;

-- Drop pickup_points table
DROP TABLE IF EXISTS public.pickup_points CASCADE;