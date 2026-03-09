
-- Routine tasks table
CREATE TABLE public.routine_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📋',
  category TEXT NOT NULL DEFAULT 'geral',
  difficulty TEXT NOT NULL DEFAULT 'medium',
  points_value INTEGER NOT NULL DEFAULT 10,
  start_time TIME WITHOUT TIME ZONE,
  end_time TIME WITHOUT TIME ZONE,
  frequency_type TEXT NOT NULL DEFAULT 'daily',
  frequency_days TEXT[] DEFAULT '{}'::TEXT[],
  is_recurring BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Routine completions table
CREATE TABLE public.routine_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.routine_tasks(id) ON DELETE CASCADE NOT NULL,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, completed_date)
);

-- Enable RLS
ALTER TABLE public.routine_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for routine_tasks
CREATE POLICY "Users can view their own routine tasks" ON public.routine_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own routine tasks" ON public.routine_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own routine tasks" ON public.routine_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own routine tasks" ON public.routine_tasks FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for routine_completions
CREATE POLICY "Users can view their own completions" ON public.routine_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own completions" ON public.routine_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own completions" ON public.routine_completions FOR DELETE USING (auth.uid() = user_id);
