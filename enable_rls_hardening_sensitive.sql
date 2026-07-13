-- ============================================================
-- RLS + privilege hardening for the SENSITIVE tables:
--   bookings (guest PII: name, email/phone, IC number), discounts, users
--
-- Run in: Supabase Dashboard -> SQL Editor. Safe to re-run.
--
-- IMPORTANT: In Supabase the `anon` and `authenticated` roles are
-- granted table DML by default, so RLS + column GRANTs are the real
-- gate. service_role (our API routes via supabaseAdmin) bypasses RLS.
--
-- >>> READ THE "bookings" SECTION NOTE BEFORE RUNNING <<<
-- The bookings lockdown assumes the success page has been changed to
-- fetch booking details from a SERVER route (service_role) instead of
-- the anon browser client, and no longer updates payment_status from
-- the client. If you run this before that app change ships, the
-- /success page will stop showing booking details (the signed Billplz
-- webhook still marks bookings paid correctly).
-- ============================================================


-- ============================================================
-- 0. DIAGNOSTIC -- run this FIRST and review before changing anything
-- ============================================================
SELECT c.relname AS table_name,
       c.relrowsecurity AS rls_enabled,
       COALESCE(p.policyname, '(no policy)') AS policy,
       p.cmd AS command,
       p.roles AS roles,
       p.qual AS using_expr
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policies p ON p.schemaname = n.nspname AND p.tablename = c.relname
WHERE n.nspname = 'public'
  AND c.relname IN ('bookings', 'discounts', 'users')
ORDER BY c.relname, p.policyname;


-- ============================================================
-- 1. Wipe existing policies on the 3 tables (clears leftover
--    over-permissive ones we can't see).
-- ============================================================
DO $$
DECLARE
  pol record; tbl text;
  tables text[] := ARRAY['bookings', 'discounts', 'users'];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    FOR pol IN SELECT policyname FROM pg_policies
               WHERE schemaname = 'public' AND tablename = tbl LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl);
    END LOOP;
  END LOOP;
END $$;


-- ============================================================
-- 2. bookings  (guest PII -- lock down hard)
--    anon: may read ONLY availability columns of PAID bookings
--          (this is all the public calendar / booking modal need).
--          NO write access.
--    authenticated (admin/staff): read all columns, rows gated by role.
--    all writes happen server-side via service_role (API routes).
-- ============================================================
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Strip default blanket grants, then re-grant precisely.
REVOKE ALL ON public.bookings FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.bookings FROM authenticated;

-- anon can SELECT only these non-PII columns (never guest_name /
-- guest_email / ic_number / total_price / amount_paid / billplz_id /
-- admin_notes).
GRANT SELECT (room_id, unit_name, units_count,
              check_in, check_out, check_in_time, check_out_time,
              payment_status) ON public.bookings TO anon;

CREATE POLICY "Anon reads paid booking availability" ON public.bookings
  FOR SELECT TO anon
  USING (payment_status = 'paid');

-- Admin/staff (authenticated session) can read every booking.
CREATE POLICY "Staff read all bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'staff')));


-- ============================================================
-- 3. discounts
--    Not touched by the browser client (only service_role API +
--    server-side price calc). No anon access needed.
--    admin: manage;  staff: read.
-- ============================================================
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.discounts FROM anon;

CREATE POLICY "Staff view discounts" ON public.discounts
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'staff')));

CREATE POLICY "Admins manage discounts" ON public.discounts
  FOR ALL TO authenticated
  USING     (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));


-- ============================================================
-- 4. users  (roles + emails -- never expose to anon)
--    authenticated: read OWN row (needed by middleware / role checks
--                    and by the EXISTS() subqueries in every policy above).
--    admin: read + manage all rows.
--    No anon access at all.
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.users FROM anon;

CREATE POLICY "Users read own row" ON public.users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins read all users" ON public.users
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'));

CREATE POLICY "Admins manage users" ON public.users
  FOR ALL TO authenticated
  USING     (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'));


-- ============================================================
-- 5. VERIFY
-- ============================================================
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled,
       COALESCE(p.policyname, '(none)') AS policy, p.cmd AS command
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policies p ON p.schemaname = n.nspname AND p.tablename = c.relname
WHERE n.nspname = 'public' AND c.relname IN ('bookings', 'discounts', 'users')
ORDER BY c.relname, p.policyname;
