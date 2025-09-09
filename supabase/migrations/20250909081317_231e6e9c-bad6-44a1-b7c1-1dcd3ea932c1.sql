-- Create storage bucket for product videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-videos', 'product-videos', true);

-- Create RLS policies for product-videos bucket
CREATE POLICY "Anyone can view product videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-videos');

CREATE POLICY "Authenticated users can upload product videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-videos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own product videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own product videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add video field to products table
ALTER TABLE public.products 
ADD COLUMN video_url text;

-- Update the updated_at trigger to include the new column
CREATE OR REPLACE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();