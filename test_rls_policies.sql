-- 1. Check current RLS policies on discounts table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'discounts';

-- 2. Check current authenticated user
SELECT 
  auth.uid() as current_auth_id,
  auth.email() as current_auth_email,
  auth.role() as current_auth_role;

-- 3. Test the exact policy condition
SELECT 
  auth.uid() as current_auth_id,
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) as has_admin_access;

-- 4. Test if we can actually insert (this should fail with RLS error)
INSERT INTO public.discounts (room_id, discount_date, percentage)
VALUES (1, CURRENT_DATE, 10);

-- 5. Rollback the test insert
ROLLBACK;
