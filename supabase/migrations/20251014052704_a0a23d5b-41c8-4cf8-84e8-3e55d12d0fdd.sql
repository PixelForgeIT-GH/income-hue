-- Create table for Plaid Items (bank connections)
-- This stores the connection between user and their bank
CREATE TABLE public.plaid_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token text NOT NULL, -- Encrypted at rest by Supabase
  item_id text NOT NULL UNIQUE, -- Plaid's item identifier
  institution_id text, -- Bank institution ID
  institution_name text, -- Bank name for display
  status text NOT NULL DEFAULT 'active', -- active, requires_update, disabled
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_synced_at timestamp with time zone
);

-- Create table for Plaid Accounts (individual bank accounts)
CREATE TABLE public.plaid_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plaid_item_id uuid NOT NULL REFERENCES public.plaid_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id text NOT NULL UNIQUE, -- Plaid's account identifier
  name text NOT NULL, -- Account name (e.g., "Checking")
  official_name text, -- Official account name
  type text NOT NULL, -- depository, credit, loan, investment
  subtype text, -- checking, savings, credit card, etc.
  mask text, -- Last 4 digits of account number
  current_balance numeric,
  available_balance numeric,
  currency_code text NOT NULL DEFAULT 'CAD',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for imported Plaid Transactions
CREATE TABLE public.plaid_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plaid_account_id uuid NOT NULL REFERENCES public.plaid_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id text NOT NULL UNIQUE, -- Plaid's transaction identifier
  amount numeric NOT NULL,
  date date NOT NULL,
  name text NOT NULL,
  merchant_name text,
  category_id text,
  category text[], -- Plaid's hierarchical categories
  pending boolean NOT NULL DEFAULT false,
  imported_to_app boolean NOT NULL DEFAULT false, -- Track if synced to transactions table
  app_transaction_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.plaid_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plaid_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plaid_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plaid_items
CREATE POLICY "Users can view their own plaid items"
  ON public.plaid_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plaid items"
  ON public.plaid_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plaid items"
  ON public.plaid_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plaid items"
  ON public.plaid_items FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for plaid_accounts
CREATE POLICY "Users can view their own plaid accounts"
  ON public.plaid_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plaid accounts"
  ON public.plaid_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plaid accounts"
  ON public.plaid_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plaid accounts"
  ON public.plaid_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for plaid_transactions
CREATE POLICY "Users can view their own plaid transactions"
  ON public.plaid_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plaid transactions"
  ON public.plaid_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plaid transactions"
  ON public.plaid_transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plaid transactions"
  ON public.plaid_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_plaid_items_user_id ON public.plaid_items(user_id);
CREATE INDEX idx_plaid_accounts_user_id ON public.plaid_accounts(user_id);
CREATE INDEX idx_plaid_accounts_item_id ON public.plaid_accounts(plaid_item_id);
CREATE INDEX idx_plaid_transactions_user_id ON public.plaid_transactions(user_id);
CREATE INDEX idx_plaid_transactions_account_id ON public.plaid_transactions(plaid_account_id);
CREATE INDEX idx_plaid_transactions_date ON public.plaid_transactions(date);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_plaid_items_updated_at
  BEFORE UPDATE ON public.plaid_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plaid_accounts_updated_at
  BEFORE UPDATE ON public.plaid_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plaid_transactions_updated_at
  BEFORE UPDATE ON public.plaid_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();