-- Run in Supabase Dashboard -> SQL Editor, AFTER the /api/availability
-- code is deployed and the public calendar/modal/rooms pages are verified.
-- Removes all anon access to bookings (guest PII lives here).
-- Safe to re-run.

DROP POLICY IF EXISTS "Anon reads paid booking availability" ON public.bookings;
DROP POLICY IF EXISTS "Allow public read paid bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public read bookings (dev)" ON public.bookings;

REVOKE ALL ON public.bookings FROM anon;

-- Verify: should list no anon grants and no anon policies
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name = 'bookings' AND grantee = 'anon';

SELECT policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'bookings';
