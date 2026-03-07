
-- Table for selfcare emotional check-ins
CREATE TABLE public.selfcare_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  emotional_state TEXT NOT NULL,
  note TEXT,
  energy_level INTEGER DEFAULT 5,
  gratitudes TEXT[] DEFAULT '{}',
  ritual_completed BOOLEAN DEFAULT false,
  ritual_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Table for pillar actions (mind, body, energy)
CREATE TABLE public.selfcare_pillar_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pillar TEXT NOT NULL CHECK (pillar IN ('mind', 'body', 'energy')),
  action_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  action_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Enable RLS
ALTER TABLE public.selfcare_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selfcare_pillar_actions ENABLE ROW LEVEL SECURITY;

-- RLS policies for selfcare_checkins
CREATE POLICY "Users can view their own checkins" ON public.selfcare_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own checkins" ON public.selfcare_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own checkins" ON public.selfcare_checkins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own checkins" ON public.selfcare_checkins FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for selfcare_pillar_actions
CREATE POLICY "Users can view their own pillar actions" ON public.selfcare_pillar_actions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own pillar actions" ON public.selfcare_pillar_actions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own pillar actions" ON public.selfcare_pillar_actions FOR DELETE USING (auth.uid() = user_id);
