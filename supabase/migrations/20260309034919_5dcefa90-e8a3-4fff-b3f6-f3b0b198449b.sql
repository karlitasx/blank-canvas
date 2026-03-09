
-- Introduction likes table
CREATE TABLE public.introduction_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  introduction_id UUID NOT NULL REFERENCES public.introductions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(introduction_id, user_id)
);

ALTER TABLE public.introduction_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view introduction likes" ON public.introduction_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like introductions" ON public.introduction_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike introductions" ON public.introduction_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Introduction comments table
CREATE TABLE public.introduction_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  introduction_id UUID NOT NULL REFERENCES public.introductions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.introduction_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view introduction comments" ON public.introduction_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can comment on introductions" ON public.introduction_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.introduction_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Add likes_count and comments_count to introductions
ALTER TABLE public.introductions ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.introductions ADD COLUMN IF NOT EXISTS comments_count INTEGER NOT NULL DEFAULT 0;

-- Triggers for auto-updating counts
CREATE OR REPLACE FUNCTION public.increment_introduction_likes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.introductions SET likes_count = likes_count + 1 WHERE id = NEW.introduction_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_introduction_likes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.introductions SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.introduction_id;
  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_introduction_comments()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.introductions SET comments_count = comments_count + 1 WHERE id = NEW.introduction_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_introduction_comments()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.introductions SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.introduction_id;
  RETURN OLD;
END;
$$;

CREATE TRIGGER on_introduction_like_added
  AFTER INSERT ON public.introduction_likes
  FOR EACH ROW EXECUTE FUNCTION public.increment_introduction_likes();

CREATE TRIGGER on_introduction_like_removed
  AFTER DELETE ON public.introduction_likes
  FOR EACH ROW EXECUTE FUNCTION public.decrement_introduction_likes();

CREATE TRIGGER on_introduction_comment_added
  AFTER INSERT ON public.introduction_comments
  FOR EACH ROW EXECUTE FUNCTION public.increment_introduction_comments();

CREATE TRIGGER on_introduction_comment_removed
  AFTER DELETE ON public.introduction_comments
  FOR EACH ROW EXECUTE FUNCTION public.decrement_introduction_comments();
