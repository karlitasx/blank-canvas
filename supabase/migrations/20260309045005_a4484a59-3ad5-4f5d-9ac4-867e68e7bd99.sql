
-- Subscriptions table for premium access
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan text NOT NULL DEFAULT 'premium',
  status text NOT NULL DEFAULT 'active',
  starts_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own subscription" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscription" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions FOR SELECT USING (is_admin());

-- Hair profiles
CREATE TABLE public.hair_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  hair_type text NOT NULL,
  texture text NOT NULL,
  main_problem text NOT NULL,
  wash_frequency text NOT NULL,
  goal text NOT NULL,
  extra_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.hair_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own hair profile" ON public.hair_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own hair profile" ON public.hair_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own hair profile" ON public.hair_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all hair profiles" ON public.hair_profiles FOR SELECT USING (is_admin());

-- Hair schedules (created by Yara for users)
CREATE TABLE public.hair_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_by uuid NOT NULL,
  title text NOT NULL DEFAULT 'Cronograma Capilar',
  duration_weeks integer NOT NULL DEFAULT 4,
  starts_at date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.hair_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own schedules" ON public.hair_schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all schedules" ON public.hair_schedules FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Hair schedule items (individual treatments)
CREATE TABLE public.hair_schedule_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES public.hair_schedules(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL,
  week_number integer NOT NULL DEFAULT 1,
  treatment_type text NOT NULL,
  product_recommendation text,
  yara_note text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.hair_schedule_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items of their schedules" ON public.hair_schedule_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.hair_schedules hs WHERE hs.id = hair_schedule_items.schedule_id AND hs.user_id = auth.uid())
);
CREATE POLICY "Admins can manage all items" ON public.hair_schedule_items FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Treatment logs (user feedback)
CREATE TABLE public.hair_treatment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  schedule_item_id uuid NOT NULL REFERENCES public.hair_schedule_items(id) ON DELETE CASCADE,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  treatment_date date NOT NULL DEFAULT CURRENT_DATE,
  rating text NOT NULL DEFAULT 'good',
  hair_reaction text,
  user_note text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.hair_treatment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own logs" ON public.hair_treatment_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own logs" ON public.hair_treatment_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own logs" ON public.hair_treatment_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all logs" ON public.hair_treatment_logs FOR SELECT USING (is_admin());
