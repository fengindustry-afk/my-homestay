-- 1. Check current RLS policies on discounts table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'discounts';

-- 2. Check current authenticated user
SELECT 
  auth.uid() as current_auth_id,
  auth.email() as current_auth_email,
  auth.role() as current_auth_role;

-- 3. Check if current user exists in public.users
SELECT 
  auth.uid() as current_auth_id,
  u.id as user_id,
  u.email,
  u.role
FROM public.users u
WHERE u.id = auth.uid();

-- 4. Test the policy condition directly
SELECT 
  auth.uid() as current_auth_id,
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) as has_admin_access;

-- 5. Check all users with their auth IDs
SELECT 
  au.id as auth_id,
  au.email as auth_email,
  u.id as public_user_id,
  u.email as public_email,
  u.role
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE au.email IN ('mail@indahmorib.com', 'staff@indahmorib.com');
