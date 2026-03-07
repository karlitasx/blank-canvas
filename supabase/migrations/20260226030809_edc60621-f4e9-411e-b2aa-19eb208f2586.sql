
CREATE TABLE public.finance_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'Tag',
  color TEXT NOT NULL DEFAULT '#6b7280',
  type TEXT NOT NULL DEFAULT 'expense',
  finance_type TEXT NOT NULL DEFAULT 'personal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.finance_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own categories" ON public.finance_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" ON public.finance_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON public.finance_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON public.finance_categories
  FOR DELETE USING (auth.uid() = user_id);
