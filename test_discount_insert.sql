-- Test discount creation with a valid room_id
SELECT 
  auth.uid() as current_auth_id,
  auth.email() as current_auth_email,
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) as has_admin_access;

-- Test insert with valid room_id (using room_id = 3 which exists)
INSERT INTO public.discounts (room_id, discount_date, percentage)
VALUES (3, CURRENT_DATE, 10)
RETURNING *;

-- Rollback the test
ROLLBACK;
