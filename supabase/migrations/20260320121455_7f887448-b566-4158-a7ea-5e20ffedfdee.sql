
INSERT INTO storage.buckets (id, name, public)
VALUES ('hair-evolution', 'hair-evolution', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Hair admins can upload evolution photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'hair-evolution' AND
  (public.is_hair_admin(auth.uid()) OR public.is_admin())
);

CREATE POLICY "Anyone can view evolution photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hair-evolution');

CREATE POLICY "Hair admins can delete evolution photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'hair-evolution' AND
  (public.is_hair_admin(auth.uid()) OR public.is_admin())
);
