-- Create follows table for follower/following relationships
CREATE TABLE public.follows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT follows_no_self_follow CHECK (follower_id != following_id),
  CONSTRAINT follows_unique_pair UNIQUE (follower_id, following_id)
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Anyone can view follows (for follower counts)
CREATE POLICY "Anyone can view follows"
ON public.follows
FOR SELECT
USING (true);

-- Users can follow others (insert)
CREATE POLICY "Users can follow others"
ON public.follows
FOR INSERT
WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow (delete their own follows)
CREATE POLICY "Users can unfollow"
ON public.follows
FOR DELETE
USING (auth.uid() = follower_id);

-- Add indexes for performance
CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);

-- Add follower/following counts to profiles (denormalized for performance)
ALTER TABLE public.profiles 
ADD COLUMN followers_count integer NOT NULL DEFAULT 0,
ADD COLUMN following_count integer NOT NULL DEFAULT 0;

-- Function to update follower counts
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET followers_count = followers_count + 1 WHERE user_id = NEW.following_id;
    UPDATE public.profiles SET following_count = following_count + 1 WHERE user_id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE user_id = OLD.following_id;
    UPDATE public.profiles SET following_count = GREATEST(following_count - 1, 0) WHERE user_id = OLD.follower_id;
    RETURN OLD;
  END IF;
END;
$$;

-- Triggers to auto-update counts
CREATE TRIGGER on_follow_insert
AFTER INSERT ON public.follows
FOR EACH ROW
EXECUTE FUNCTION public.update_follow_counts();

CREATE TRIGGER on_follow_delete
AFTER DELETE ON public.follows
FOR EACH ROW
EXECUTE FUNCTION public.update_follow_counts();