
-- Create storage bucket for group banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('group-banners', 'group-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload group banners
CREATE POLICY "Authenticated users can upload group banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'group-banners');

-- Allow anyone to view group banners (public bucket)
CREATE POLICY "Anyone can view group banners"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'group-banners');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update group banners"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'group-banners');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete group banners"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'group-banners');
