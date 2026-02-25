-- Check current table constraints
SELECT conname, pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass;

-- Show current role values in the table
SELECT DISTINCT role FROM public.users;

-- Show rows with invalid role values (not admin or staff)
SELECT id, email, role FROM public.users 
WHERE role NOT IN ('admin', 'staff');

-- Fix invalid role values first
UPDATE public.users 
SET role = 'staff' 
WHERE role = 'user' OR role IS NULL;

-- Drop the existing constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new constraint that allows both admin and staff
ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'staff'));

-- Now update the staff role
UPDATE public.users 
SET role = 'staff' 
WHERE email = 'staff@indahmorib.com';

-- Verify the fix
SELECT id, email, role FROM public.users;
