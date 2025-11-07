-- Create Demo Company 1 and set up supervisor user
-- This migration assumes the user z.heil@outlook.com has already signed up

-- Get the user_id for the email
DO $$
DECLARE
  v_user_id uuid;
  v_company_id uuid := '00000000-0000-0000-0000-000000000002'::uuid;
BEGIN
  -- Get user_id from auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'z.heil@outlook.com';

  -- Only proceed if user exists
  IF v_user_id IS NOT NULL THEN
    -- Create Demo Company 1
    INSERT INTO public.companies (id, name, owner_id, created_at, updated_at)
    VALUES (
      v_company_id,
      'Demo Company 1',
      v_user_id,
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        owner_id = EXCLUDED.owner_id,
        updated_at = now();

    -- Update user profile to have pro subscription and business access
    INSERT INTO public.profiles (user_id, subscription_status, business_seats, company_id, updated_at)
    VALUES (
      v_user_id,
      'pro',
      10,
      v_company_id,
      now()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET subscription_status = 'pro',
        business_seats = 10,
        company_id = v_company_id,
        updated_at = now();

    -- Create supervisor employee record
    INSERT INTO public.employees (
      company_id,
      user_id,
      first_name,
      last_name,
      email,
      role,
      hourly_rate,
      rate_type,
      is_active,
      created_at,
      updated_at
    )
    VALUES (
      v_company_id,
      v_user_id,
      'Business',
      'Supervisor',
      'z.heil@outlook.com',
      'supervisor'::user_role,
      60.00,
      'hourly',
      true,
      now(),
      now()
    )
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Successfully set up Demo Company 1 with supervisor user';
  ELSE
    RAISE NOTICE 'User z.heil@outlook.com not found. Please sign up first.';
  END IF;
END $$;