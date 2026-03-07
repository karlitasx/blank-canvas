-- Allow anyone to view user achievements for public profiles
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;

CREATE POLICY "Anyone can view achievements"
ON public.user_achievements
FOR SELECT
USING (true);

-- Add a column to track if user wants to share achievements publicly
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_achievements BOOLEAN NOT NULL DEFAULT true;

-- Create a table for achievement shares in feed
CREATE TABLE public.achievement_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.achievement_shares ENABLE ROW LEVEL SECURITY;

-- Anyone can view shared achievements
CREATE POLICY "Anyone can view achievement shares"
ON public.achievement_shares
FOR SELECT
USING (true);

-- Users can share their own achievements
CREATE POLICY "Users can share their achievements"
ON public.achievement_shares
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own shares
CREATE POLICY "Users can delete their shares"
ON public.achievement_shares
FOR DELETE
USING (auth.uid() = user_id);

-- Update profiles policy to allow public viewing (for community features)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Anyone can view profiles"
ON public.profiles
FOR SELECT
USING (true);