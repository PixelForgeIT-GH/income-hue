-- Add start_date column to expenses table for future expense planning
ALTER TABLE public.expenses 
ADD COLUMN start_date date NOT NULL DEFAULT CURRENT_DATE;

-- Add index for better performance on date-based queries
CREATE INDEX idx_expenses_start_date ON public.expenses(start_date);