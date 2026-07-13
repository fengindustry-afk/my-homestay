-- ============================================================
-- RLS hardening for the public-facing tables flagged by the
-- Supabase security advisor:
--   rooms, room_photos, testimonials, site_settings
--
-- WHY: these tables are exposed through PostgREST (Supabase's
-- auto REST API) and reachable with the public anon key, but
-- RLS was disabled -- so anyone with that key could read/write
-- them directly, bypassing the app. Some already had policies
-- written, but they were NOT enforced because RLS was off
-- ("Policy Exists RLS Disabled").
--
-- ACCESS MODEL:
--   * service_role (our API routes via supabaseAdmin) BYPASSES
--     RLS entirely -> server routes are unaffected.
--   * The public site + the admin panel both use the browser
--     client (anon key). Logged-in admins act as an
--     `authenticated` session, so admin writes must be allowed
--     by policy, not just by service_role.
--
-- This script wipes existing policies on these 4 tables (to
-- clear any leftover permissive ones we can't see) and rebuilds
-- a clean set, then turns RLS ON.
--
-- Run it in: Supabase Dashboard -> SQL Editor.
-- Safe to re-run (idempotent).
-- ============================================================

-- ---------- 1. Drop every existing policy on the 4 tables ----------
DO $$
DECLARE
  pol   record;
  tbl   text;
  tables text[] := ARRAY['rooms', 'room_photos', 'testimonials', 'site_settings'];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    FOR pol IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = tbl
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl);
    END LOOP;
  END LOOP;
END $$;

-- ---------- 2. rooms: public read, admin write ----------
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view rooms" ON public.rooms
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage rooms" ON public.rooms
  FOR ALL
  USING     (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ---------- 3. room_photos: public read, admin write ----------
ALTER TABLE public.room_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view room photos" ON public.room_photos
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage room photos" ON public.room_photos
  FOR ALL
  USING     (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ---------- 4. testimonials: public read, admin write ----------
-- The app currently renders a hardcoded list, so this table is
-- unused today. Public read is harmless and future-proofs it.
-- If you prefer it fully locked, delete the "Public can view"
-- policy below (service_role can still manage it).
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view testimonials" ON public.testimonials
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage testimonials" ON public.testimonials
  FOR ALL
  USING     (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ---------- 5. site_settings: admin/staff read, admin write ----------
-- NOT read by the public site today (only the admin ContentPanel).
-- If you later surface these values on the public homepage, add:
--   CREATE POLICY "Public can view site settings" ON public.site_settings
--     FOR SELECT USING (true);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view site settings" ON public.site_settings
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'staff')));

CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL
  USING     (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ---------- 6. Verify ----------
SELECT c.relname                         AS table_name,
       c.relrowsecurity                  AS rls_enabled,
       COALESCE(p.policyname, '(none)')  AS policy,
       p.cmd                             AS command
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policies p
       ON p.schemaname = n.nspname AND p.tablename = c.relname
WHERE n.nspname = 'public'
  AND c.relname IN ('rooms', 'room_photos', 'testimonials', 'site_settings')
ORDER BY c.relname, p.policyname;
