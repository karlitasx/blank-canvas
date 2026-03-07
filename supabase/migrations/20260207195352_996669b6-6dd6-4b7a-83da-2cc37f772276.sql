-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT comment_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 500)
);

-- Add comments_count to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS comments_count INTEGER NOT NULL DEFAULT 0;

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view comments"
ON public.comments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create comments"
ON public.comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.comments FOR DELETE
USING (auth.uid() = user_id);

-- Function to increment comments count
CREATE OR REPLACE FUNCTION public.increment_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

-- Function to decrement comments count
CREATE OR REPLACE FUNCTION public.decrement_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$;

-- Triggers for comments count
CREATE TRIGGER on_comment_insert
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_comments_count();

CREATE TRIGGER on_comment_delete
  AFTER DELETE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_comments_count();

-- Create point_history table for tracking all point gains
CREATE TABLE public.point_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  action_id TEXT,
  points INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_action_type CHECK (action_type IN ('habit_create', 'habit_complete', 'post_create', 'post_like', 'comment_create', 'challenge_join', 'challenge_complete', 'follow'))
);

-- Enable RLS on point_history
ALTER TABLE public.point_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for point_history
CREATE POLICY "Users can view their own point history"
ON public.point_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert point history"
ON public.point_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create connections table for networking feature
CREATE TABLE public.connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  connection_type TEXT NOT NULL DEFAULT 'friendship',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_action CHECK (action IN ('like', 'skip')),
  CONSTRAINT valid_connection_type CHECK (connection_type IN ('friendship', 'work', 'networking')),
  CONSTRAINT no_self_connection CHECK (user_id != target_user_id),
  CONSTRAINT unique_connection UNIQUE (user_id, target_user_id)
);

-- Enable RLS on connections
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for connections
CREATE POLICY "Users can view their connections"
ON public.connections FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = target_user_id);

CREATE POLICY "Users can create connections"
ON public.connections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their connections"
ON public.connections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their connections"
ON public.connections FOR DELETE
USING (auth.uid() = user_id);

-- Add bio and interests to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- Create index for faster connection lookups
CREATE INDEX idx_connections_user_id ON public.connections(user_id);
CREATE INDEX idx_connections_target_user_id ON public.connections(target_user_id);
CREATE INDEX idx_point_history_user_id ON public.point_history(user_id);
CREATE INDEX idx_point_history_created_at ON public.point_history(created_at);
CREATE INDEX idx_comments_post_id ON public.comments(post_id);