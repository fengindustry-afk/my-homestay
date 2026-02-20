-- First, let's create the admin user using the proper Supabase method
-- This will create a user with email confirmation already done

-- 1. Create the admin user in auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  banned_until,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@indahmorib.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- 2. Get the user ID and insert into public.users
INSERT INTO public.users (id, email, role)
SELECT 
  id,
  email,
  'admin'
FROM auth.users 
WHERE email = 'admin@indahmorib.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  updated_at = NOW();

-- 3. Verify the user was created
SELECT 
  u.id,
  u.email,
  u.role,
  au.email_confirmed_at
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'admin@indahmorib.com';
