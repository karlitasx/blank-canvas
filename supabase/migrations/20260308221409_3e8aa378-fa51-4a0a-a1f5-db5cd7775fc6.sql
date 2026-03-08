
-- Add image_url column to finance_goals
ALTER TABLE public.finance_goals ADD COLUMN image_url text DEFAULT NULL;

-- Create storage bucket for goal images
INSERT INTO storage.buckets (id, name, public) VALUES ('goal-images', 'goal-images', true);

-- Allow authenticated users to upload goal images
CREATE POLICY "Users can upload goal images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'goal-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow anyone to view goal images (public bucket)
CREATE POLICY "Anyone can view goal images"
ON storage.objects FOR SELECT
USING (bucket_id = 'goal-images');

-- Allow users to delete their own goal images
CREATE POLICY "Users can delete their goal images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'goal-images' AND (storage.foldername(name))[1] = auth.uid()::text);
