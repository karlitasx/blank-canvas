
CREATE TABLE public.finance_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  card_type TEXT NOT NULL DEFAULT 'credit',
  brand TEXT NOT NULL DEFAULT 'Visa',
  last_digits TEXT DEFAULT '',
  card_color TEXT NOT NULL DEFAULT '#3b82f6',
  credit_limit NUMERIC DEFAULT 0,
  closing_day INTEGER DEFAULT 1,
  due_day INTEGER DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.finance_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cards" ON public.finance_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own cards" ON public.finance_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cards" ON public.finance_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cards" ON public.finance_cards FOR DELETE USING (auth.uid() = user_id);
