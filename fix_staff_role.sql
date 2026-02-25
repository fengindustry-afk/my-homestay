-- Fix staff role to match the UserRole type definition
UPDATE public.users 
SET role = 'staff' 
WHERE email = 'staff@indahmorib.com';

-- Verify the fix
SELECT id, email, role FROM public.users;
