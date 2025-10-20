-- Create user roles enum
CREATE TYPE user_role AS ENUM ('supervisor', 'employee');

-- Create companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(owner_id)
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage their company"
  ON companies FOR ALL
  USING (auth.uid() = owner_id);

-- Create employees table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'employee',
  hourly_rate NUMERIC,
  weekly_rate NUMERIC,
  biweekly_rate NUMERIC,
  rate_type TEXT CHECK (rate_type IN ('hourly', 'weekly', 'biweekly')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Now add the company policy that references employees
CREATE POLICY "Employees can view their company"
  ON companies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.company_id = companies.id
      AND employees.user_id = auth.uid()
    )
  );

CREATE POLICY "Supervisors can manage employees"
  ON employees FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employees supervisor
      WHERE supervisor.company_id = employees.company_id
      AND supervisor.user_id = auth.uid()
      AND supervisor.role = 'supervisor'
    )
  );

CREATE POLICY "Employees can view themselves"
  ON employees FOR SELECT
  USING (auth.uid() = user_id);

-- Create time entries table
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out TIMESTAMP WITH TIME ZONE,
  hours_worked NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Supervisors can manage time entries"
  ON time_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.company_id = time_entries.company_id
      AND employees.user_id = auth.uid()
      AND employees.role = 'supervisor'
    )
  );

CREATE POLICY "Employees can manage their time entries"
  ON time_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = time_entries.employee_id
      AND employees.user_id = auth.uid()
    )
  );

-- Create function to calculate hours worked
CREATE OR REPLACE FUNCTION calculate_hours_worked()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.clock_out IS NOT NULL THEN
    NEW.hours_worked = EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 3600;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_hours_trigger
  BEFORE INSERT OR UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_hours_worked();

-- Create forecasts table
CREATE TABLE forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  forecasted_hours NUMERIC NOT NULL,
  forecasted_cost NUMERIC NOT NULL,
  actual_hours NUMERIC,
  actual_cost NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Supervisors can manage forecasts"
  ON forecasts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.company_id = forecasts.company_id
      AND employees.user_id = auth.uid()
      AND employees.role = 'supervisor'
    )
  );

-- Add business subscription fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_seats INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Update subscriptions table for business plan
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS seats INTEGER DEFAULT 1;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS price_per_seat NUMERIC;

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forecasts_updated_at
  BEFORE UPDATE ON forecasts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();