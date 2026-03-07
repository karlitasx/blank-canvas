-- Create challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT NOT NULL DEFAULT '🏆',
  challenge_type TEXT NOT NULL DEFAULT 'habits', -- habits, savings, streak, custom
  target_value INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge participants table
CREATE TABLE public.challenge_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  current_progress INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(challenge_id, user_id)
);

-- Enable RLS on challenges
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Everyone can view public challenges
CREATE POLICY "Anyone can view public challenges"
ON public.challenges
FOR SELECT
USING (is_public = true OR auth.uid() = created_by);

-- Users can create challenges
CREATE POLICY "Users can create challenges"
ON public.challenges
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Creators can update their challenges
CREATE POLICY "Creators can update their challenges"
ON public.challenges
FOR UPDATE
USING (auth.uid() = created_by);

-- Creators can delete their challenges
CREATE POLICY "Creators can delete their challenges"
ON public.challenges
FOR DELETE
USING (auth.uid() = created_by);

-- Enable RLS on participants
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- Anyone can view participants of public challenges
CREATE POLICY "Anyone can view challenge participants"
ON public.challenge_participants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.challenges c 
    WHERE c.id = challenge_id AND (c.is_public = true OR c.created_by = auth.uid())
  )
);

-- Users can join challenges
CREATE POLICY "Users can join challenges"
ON public.challenge_participants
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update their progress"
ON public.challenge_participants
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can leave challenges
CREATE POLICY "Users can leave challenges"
ON public.challenge_participants
FOR DELETE
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_challenges_updated_at
BEFORE UPDATE ON public.challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();