-- ============================================================
-- Round 3 hardening: database functions + storage bucket.
-- Clears the Supabase advisor's function/storage findings.
--
-- Run in: Supabase Dashboard -> SQL Editor. Safe to re-run.
--
-- Context: the app makes NO .rpc() calls, so none of these functions
-- are invoked directly by the browser. handle_new_user is an auth
-- trigger; check_unit_availability is unused by the client; is_admin
-- MAY be referenced by RLS policies (see note in section 3).
-- ============================================================


-- ============================================================
-- 0. DIAGNOSTIC -- run first, review before changing anything.
-- ============================================================
-- 0a. Function definitions (confirm what they do + current settings)
SELECT p.proname,
       pg_get_function_identity_arguments(p.oid) AS args,
       p.prosecdef  AS is_security_definer,
       p.proconfig  AS current_settings
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('is_admin', 'handle_new_user', 'check_unit_availability');

-- 0b. Do any RLS policies reference is_admin()? If this returns rows,
--     keep `authenticated` EXECUTE on is_admin (section 3 leaves it).
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE qual ILIKE '%is_admin%' OR with_check ILIKE '%is_admin%';

-- 0c. Current storage policies touching the room-photos bucket
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
  AND (qual ILIKE '%room-photos%' OR with_check ILIKE '%room-photos%');


-- ============================================================
-- 1 + 2. Pin search_path on all three functions and revoke direct
--        EXECUTE from the public web roles.
-- (Signature-agnostic: works whatever arguments they declare.)
-- ============================================================
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('is_admin', 'handle_new_user', 'check_unit_availability')
  LOOP
    -- Stops SECURITY DEFINER search_path hijacking.
    EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = public, pg_temp',
                   r.proname, r.args);

    -- anon (public website) never needs to call these directly.
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM anon, public',
                   r.proname, r.args);

    -- These two are not used by the client OR by RLS, so drop
    -- authenticated too. (is_admin is handled separately below.)
    IF r.proname IN ('handle_new_user', 'check_unit_availability') THEN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM authenticated',
                     r.proname, r.args);
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- 3. is_admin(): authenticated EXECUTE is LEFT IN PLACE because RLS
--    policies may call it (check with diagnostic 0b).
--    If 0b returned NO rows, you can fully clear the "Signed-In Users
--    Can Execute" finding by also revoking authenticated -- run:
--
--    DO $$
--    DECLARE r record;
--    BEGIN
--      FOR r IN SELECT pg_get_function_identity_arguments(p.oid) AS args
--               FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
--               WHERE n.nspname='public' AND p.proname='is_admin'
--      LOOP
--        EXECUTE format('REVOKE EXECUTE ON FUNCTION public.is_admin(%s) FROM authenticated', r.args);
--      END LOOP;
--    END $$;
-- ============================================================


-- ============================================================
-- 4. OPTIONAL -- stop anonymous LISTING of the room-photos bucket.
--
--    Low severity: the bucket holds public marketing photos that are
--    already served by public URL. Public URL reads use the bucket's
--    `public` flag and do NOT depend on this SELECT policy, so removing
--    the anon listing policy stops enumeration without breaking images.
--    The app never lists the bucket (it stores paths in room_photos).
--
--    >>> After running, VERIFY the homepage/gallery images still load. <<<
--    Keep the bucket PUBLIC (do not flip it to private) or images break.
-- ============================================================
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND cmd IN ('SELECT', 'ALL')
      AND qual ILIKE '%room-photos%'
      AND ('anon' = ANY(roles) OR 'public' = ANY(roles))
  LOOP
    EXECUTE format('DROP POLICY %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;


-- ============================================================
-- 5. VERIFY functions
-- ============================================================
SELECT p.proname,
       p.proconfig AS settings,
       has_function_privilege('anon', p.oid, 'EXECUTE')          AS anon_can_exec,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS auth_can_exec
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('is_admin', 'handle_new_user', 'check_unit_availability');
