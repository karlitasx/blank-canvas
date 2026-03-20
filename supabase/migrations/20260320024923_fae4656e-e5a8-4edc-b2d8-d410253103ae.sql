-- 2. Expand hair_profiles with new fields
ALTER TABLE public.hair_profiles
  ADD COLUMN IF NOT EXISTS porosity text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS length text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS thickness text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS chemical_state text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS damage_level text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS scalp_type text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS complaints text DEFAULT NULL;

-- 3. hair_diagnoses
CREATE TABLE IF NOT EXISTS public.hair_diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_by uuid NOT NULL,
  analysis text NOT NULL,
  hydration_level text,
  recommended_proteins text,
  restrictions text,
  alerts text,
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hair_diagnoses ENABLE ROW LEVEL SECURITY;

-- 4. hair_products
CREATE TABLE IF NOT EXISTS public.hair_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES public.hair_schedules(id) ON DELETE CASCADE,
  name text NOT NULL,
  brand text,
  how_to_use text,
  purchase_link text,
  price_range text,
  substitute text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hair_products ENABLE ROW LEVEL SECURITY;

-- 5. hair_washing_steps
CREATE TABLE IF NOT EXISTS public.hair_washing_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES public.hair_schedules(id) ON DELETE CASCADE,
  pre_poo boolean DEFAULT false,
  pre_poo_instructions text,
  shampoo_instructions text,
  shampoo_frequency text,
  conditioner_instructions text,
  mask_instructions text,
  mask_duration text,
  leave_in_instructions text,
  finishing_instructions text,
  drying_technique text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hair_washing_steps ENABLE ROW LEVEL SECURITY;

-- 6. hair_restrictions
CREATE TABLE IF NOT EXISTS public.hair_restrictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES public.hair_schedules(id) ON DELETE CASCADE,
  ingredients_to_avoid text,
  contraindicated_procedures text,
  min_chemical_interval text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hair_restrictions ENABLE ROW LEVEL SECURITY;

-- 7. hair_evolution
CREATE TABLE IF NOT EXISTS public.hair_evolution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  photo_url text NOT NULL,
  month_label text NOT NULL,
  notes text,
  added_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hair_evolution ENABLE ROW LEVEL SECURITY;

-- 8. hair_weekly_checkins
CREATE TABLE IF NOT EXISTS public.hair_weekly_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  schedule_id uuid NOT NULL REFERENCES public.hair_schedules(id) ON DELETE CASCADE,
  week_number int NOT NULL,
  feedback text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hair_weekly_checkins ENABLE ROW LEVEL SECURITY;

-- 9. hair_goals
CREATE TABLE IF NOT EXISTS public.hair_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  main_goal text NOT NULL,
  target_length text,
  target_date date,
  brightness_progress int DEFAULT 0,
  elasticity_progress int DEFAULT 0,
  softness_progress int DEFAULT 0,
  overall_progress int DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hair_goals ENABLE ROW LEVEL SECURITY;

-- 10. hair_yara_tips
CREATE TABLE IF NOT EXISTS public.hair_yara_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tips_content text,
  personal_message text,
  nutrition_tips text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hair_yara_tips ENABLE ROW LEVEL SECURITY;

-- 11. hair_client_access
CREATE TABLE IF NOT EXISTS public.hair_client_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  granted_by uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hair_client_access ENABLE ROW LEVEL SECURITY;

-- 12. is_hair_admin function
CREATE OR REPLACE FUNCTION public.is_hair_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'hair_admin'
  )
$$;

-- 13. has_hair_access function
CREATE OR REPLACE FUNCTION public.has_hair_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.hair_client_access
    WHERE user_id = _user_id
      AND is_active = true
  )
$$;

-- RLS Policies
CREATE POLICY "Hair admins can manage all diagnoses" ON public.hair_diagnoses FOR ALL TO authenticated USING (is_hair_admin(auth.uid()) OR is_admin()) WITH CHECK (is_hair_admin(auth.uid()) OR is_admin());
CREATE POLICY "Clients can view own diagnosis" ON public.hair_diagnoses FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Hair admins can manage all products" ON public.hair_products FOR ALL TO authenticated USING (is_hair_admin(auth.uid()) OR is_admin()) WITH CHECK (is_hair_admin(auth.uid()) OR is_admin());
CREATE POLICY "Clients can view products of their schedules" ON public.hair_products FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.hair_schedules hs WHERE hs.id = hair_products.schedule_id AND hs.user_id = auth.uid()));

CREATE POLICY "Hair admins can manage all washing steps" ON public.hair_washing_steps FOR ALL TO authenticated USING (is_hair_admin(auth.uid()) OR is_admin()) WITH CHECK (is_hair_admin(auth.uid()) OR is_admin());
CREATE POLICY "Clients can view own washing steps" ON public.hair_washing_steps FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.hair_schedules hs WHERE hs.id = hair_washing_steps.schedule_id AND hs.user_id = auth.uid()));

CREATE POLICY "Hair admins can manage all restrictions" ON public.hair_restrictions FOR ALL TO authenticated USING (is_hair_admin(auth.uid()) OR is_admin()) WITH CHECK (is_hair_admin(auth.uid()) OR is_admin());
CREATE POLICY "Clients can view own restrictions" ON public.hair_restrictions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.hair_schedules hs WHERE hs.id = hair_restrictions.schedule_id AND hs.user_id = auth.uid()));

CREATE POLICY "Hair admins can manage all evolution" ON public.hair_evolution FOR ALL TO authenticated USING (is_hair_admin(auth.uid()) OR is_admin()) WITH CHECK (is_hair_admin(auth.uid()) OR is_admin());
CREATE POLICY "Clients can view own evolution" ON public.hair_evolution FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Hair admins can view all checkins" ON public.hair_weekly_checkins FOR SELECT TO authenticated USING (is_hair_admin(auth.uid()) OR is_admin());
CREATE POLICY "Clients can manage own checkins" ON public.hair_weekly_checkins FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hair admins can manage all goals" ON public.hair_goals FOR ALL TO authenticated USING (is_hair_admin(auth.uid()) OR is_admin()) WITH CHECK (is_hair_admin(auth.uid()) OR is_admin());
CREATE POLICY "Clients can view own goals" ON public.hair_goals FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Hair admins can manage all tips" ON public.hair_yara_tips FOR ALL TO authenticated USING (is_hair_admin(auth.uid()) OR is_admin()) WITH CHECK (is_hair_admin(auth.uid()) OR is_admin());
CREATE POLICY "Clients can view own tips" ON public.hair_yara_tips FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Hair admins can manage access" ON public.hair_client_access FOR ALL TO authenticated USING (is_hair_admin(auth.uid()) OR is_admin()) WITH CHECK (is_hair_admin(auth.uid()) OR is_admin());
CREATE POLICY "Users can check own access" ON public.hair_client_access FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Existing tables: add hair_admin policies
CREATE POLICY "Hair admins can manage all profiles" ON public.hair_profiles FOR ALL TO authenticated USING (is_hair_admin(auth.uid())) WITH CHECK (is_hair_admin(auth.uid()));
CREATE POLICY "Hair admins can manage all schedules" ON public.hair_schedules FOR ALL TO authenticated USING (is_hair_admin(auth.uid())) WITH CHECK (is_hair_admin(auth.uid()));
CREATE POLICY "Hair admins can manage all schedule items" ON public.hair_schedule_items FOR ALL TO authenticated USING (is_hair_admin(auth.uid())) WITH CHECK (is_hair_admin(auth.uid()));
CREATE POLICY "Hair admins can view all treatment logs" ON public.hair_treatment_logs FOR SELECT TO authenticated USING (is_hair_admin(auth.uid()));