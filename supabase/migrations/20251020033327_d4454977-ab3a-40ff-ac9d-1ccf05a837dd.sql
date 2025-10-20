-- Fix function search path for security
CREATE OR REPLACE FUNCTION calculate_hours_worked()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.clock_out IS NOT NULL THEN
    NEW.hours_worked = EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 3600;
  END IF;
  RETURN NEW;
END;
$$;