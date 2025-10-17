-- Add new columns to profiles table for user settings and customization
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS preferred_currency text DEFAULT 'CAD',
ADD COLUMN IF NOT EXISTS dashboard_income_color text DEFAULT 'hsl(142, 76%, 36%)',
ADD COLUMN IF NOT EXISTS dashboard_expense_color text DEFAULT 'hsl(0, 84%, 60%)',
ADD COLUMN IF NOT EXISTS primary_color text,
ADD COLUMN IF NOT EXISTS secondary_color text,
ADD COLUMN IF NOT EXISTS accent_color text;