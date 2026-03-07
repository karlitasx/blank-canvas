
CREATE TABLE public.introductions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint so each user can only have one introduction
ALTER TABLE public.introductions ADD CONSTRAINT introductions_user_id_unique UNIQUE (user_id);

-- Enable RLS
ALTER TABLE public.introductions ENABLE ROW LEVEL SECURITY;

-- Anyone can view introductions
CREATE POLICY "Anyone can view introductions" ON public.introductions FOR SELECT USING (true);

-- Users can insert their own introduction
CREATE POLICY "Users can insert their own introduction" ON public.introductions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own introduction
CREATE POLICY "Users can update their own introduction" ON public.introductions FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own introduction
CREATE POLICY "Users can delete their own introduction" ON public.introductions FOR DELETE USING (auth.uid() = user_id);
