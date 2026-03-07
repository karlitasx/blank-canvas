
ALTER TABLE public.transactions 
  ADD COLUMN finance_type text NOT NULL DEFAULT 'personal',
  ADD COLUMN cnpj text NULL,
  ADD COLUMN invoice_number text NULL,
  ADD COLUMN cost_center text NULL;
