
-- Add is_public column to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

-- Add created_by_admin column to track admin-created events
ALTER TABLE public.events ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS: allow users to see public events too
DROP POLICY IF EXISTS "Users can view their own events" ON public.events;
CREATE POLICY "Users can view own and public events"
  ON public.events FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

-- Allow admins to insert public events
CREATE POLICY "Admins can insert public events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR is_admin());

-- Allow admins to update public events
CREATE POLICY "Admins can update public events"
  ON public.events FOR UPDATE
  USING (auth.uid() = user_id OR is_admin());

-- Allow admins to delete public events
CREATE POLICY "Admins can delete public events"
  ON public.events FOR DELETE
  USING (auth.uid() = user_id OR is_admin());

-- Enable realtime for events
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
