
ALTER TABLE public.challenges
ADD COLUMN difficulty text NOT NULL DEFAULT 'medium',
ADD COLUMN points_per_checkin integer NOT NULL DEFAULT 10;
