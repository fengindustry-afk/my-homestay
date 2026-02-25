-- Check current user and policies
SELECT 
  auth.uid() as current_auth_id,
  auth.email() as current_email,
  auth.role() as auth_role;

-- Check if current user exists in public.users
SELECT 
  u.id,
  u.email,
  u.role
FROM public.users u
WHERE u.id = auth.uid();

-- Test the exact policy condition
SELECT 
  auth.uid() as current_auth_id,
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) as policy_condition_result;

-- Check all current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'discounts';
