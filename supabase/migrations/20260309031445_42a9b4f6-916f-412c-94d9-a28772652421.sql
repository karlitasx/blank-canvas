
-- Business settings table
CREATE TABLE public.business_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  business_type text NOT NULL DEFAULT 'mei' CHECK (business_type IN ('mei', 'simples_nacional', 'autonomo')),
  company_name text,
  cnpj text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings" ON public.business_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON public.business_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.business_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings" ON public.business_settings FOR DELETE USING (auth.uid() = user_id);

-- Business sales table
CREATE TABLE public.business_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  sale_date date NOT NULL DEFAULT CURRENT_DATE,
  client_name text,
  amount numeric NOT NULL,
  payment_method text NOT NULL DEFAULT 'pix',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.business_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sales" ON public.business_sales FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sales" ON public.business_sales FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sales" ON public.business_sales FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sales" ON public.business_sales FOR DELETE USING (auth.uid() = user_id);

-- Business expenses table
CREATE TABLE public.business_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  category text NOT NULL DEFAULT 'outros',
  amount numeric NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.business_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expenses" ON public.business_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own expenses" ON public.business_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses" ON public.business_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses" ON public.business_expenses FOR DELETE USING (auth.uid() = user_id);

-- DAS payments table (MEI)
CREATE TABLE public.das_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reference_month text NOT NULL,
  amount numeric NOT NULL DEFAULT 71.60,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago')),
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.das_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own das" ON public.das_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own das" ON public.das_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own das" ON public.das_payments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own das" ON public.das_payments FOR DELETE USING (auth.uid() = user_id);

-- Fiscal reminders table
CREATE TABLE public.fiscal_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  due_date date NOT NULL,
  reminder_type text NOT NULL DEFAULT 'das',
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.fiscal_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminders" ON public.fiscal_reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reminders" ON public.fiscal_reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reminders" ON public.fiscal_reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reminders" ON public.fiscal_reminders FOR DELETE USING (auth.uid() = user_id);
