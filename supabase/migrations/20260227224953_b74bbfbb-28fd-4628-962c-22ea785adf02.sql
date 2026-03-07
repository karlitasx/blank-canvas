
-- Add advanced fields to habits table
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS frequency_type text NOT NULL DEFAULT 'daily',
  ADD COLUMN IF NOT EXISTS frequency_days text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS frequency_times_per_week integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS frequency_interval_days integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS goal_days integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS motivation text DEFAULT NULL;

-- Add emotional check-in fields to habit_completions
ALTER TABLE public.habit_completions
  ADD COLUMN IF NOT EXISTS mood text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS difficulty integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS note text DEFAULT NULL;
