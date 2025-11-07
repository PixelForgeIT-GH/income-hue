-- Seed test company and users

-- Insert test company (using a fixed UUID for consistency)
INSERT INTO public.companies (id, name, owner_id, created_at, updated_at)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Test Company',
  id,
  now(),
  now()
FROM auth.users
WHERE email = 'z.heil@outlook.com'
ON CONFLICT (id) DO NOTHING;

-- Update supervisor profile to have business subscription
UPDATE public.profiles
SET 
  subscription_status = 'pro',
  business_seats = 10,
  company_id = '00000000-0000-0000-0000-000000000001'::uuid,
  updated_at = now()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'z.heil@outlook.com');

-- Create supervisor employee record
INSERT INTO public.employees (company_id, user_id, first_name, last_name, email, role, hourly_rate, rate_type, is_active)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  id,
  'Supervisor',
  'Account',
  email,
  'supervisor'::user_role,
  50.00,
  'hourly',
  true
FROM auth.users
WHERE email = 'z.heil@outlook.com'
ON CONFLICT DO NOTHING;

-- Update employee profile and create employee record
UPDATE public.profiles
SET 
  company_id = '00000000-0000-0000-0000-000000000001'::uuid,
  updated_at = now()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'zach.heil@akituone.com');

INSERT INTO public.employees (company_id, user_id, first_name, last_name, email, role, hourly_rate, rate_type, is_active)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  id,
  'Employee',
  'Account',
  email,
  'employee'::user_role,
  25.00,
  'hourly',
  true
FROM auth.users
WHERE email = 'zach.heil@akituone.com'
ON CONFLICT DO NOTHING;