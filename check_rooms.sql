-- Check available rooms
SELECT id, name, room_number FROM public.rooms ORDER BY id;

-- Test with a valid room_id (use the first available room)
SELECT 
  auth.uid() as current_auth_id,
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) as has_admin_access;

-- Test insert with valid room_id (replace 1 with actual room ID from above)
INSERT INTO public.discounts (room_id, discount_date, percentage)
VALUES (1, CURRENT_DATE, 10);

-- Rollback the test
ROLLBACK;
