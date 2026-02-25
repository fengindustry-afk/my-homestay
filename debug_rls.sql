-- Check current RLS policies on discounts table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'discounts';

-- Check if the current user exists in public.users with correct role
SELECT 
  auth.uid() as current_auth_id,
  u.id,
  u.email,
  u.role
FROM public.users u
WHERE u.id = auth.uid();

-- Test the policy condition directly
SELECT 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) as has_admin_access;

-- Check all users and their roles
SELECT id, email, role FROM public.users ORDER BY role;
