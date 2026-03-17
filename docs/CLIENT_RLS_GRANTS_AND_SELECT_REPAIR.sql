-- =============================================================================
-- PLANLUX PRODUKCJA PLANDEK — RLS SELECT + grants repair (42501 with valid auth)
-- Session is authenticated; insert still fails. Add SELECT policy and ensure grants.
-- Run in Supabase Dashboard → SQL Editor. Do NOT disable RLS. Do NOT allow anon.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 4. INSPECT CURRENT GRANTS ON BOTH TABLES (run first to see current state)
-- -----------------------------------------------------------------------------
SELECT
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('clients', 'client_addresses')
ORDER BY table_name, grantee, privilege_type;


-- -----------------------------------------------------------------------------
-- 1. CREATE SELECT POLICY FOR AUTHENTICATED ON public.clients
-- -----------------------------------------------------------------------------
-- Required so that .insert(...).select("id").single() can return the new row.

CREATE POLICY "Allow authenticated select on clients"
ON public.clients
FOR SELECT
TO authenticated
USING (true);


-- -----------------------------------------------------------------------------
-- 2. GRANT SELECT, INSERT ON public.clients TO authenticated
-- -----------------------------------------------------------------------------
GRANT SELECT, INSERT ON public.clients TO authenticated;


-- -----------------------------------------------------------------------------
-- 3. GRANT SELECT, INSERT ON public.client_addresses TO authenticated
-- -----------------------------------------------------------------------------
GRANT SELECT, INSERT ON public.client_addresses TO authenticated;


-- -----------------------------------------------------------------------------
-- If client_addresses has RLS enabled, ensure policies exist:
-- -----------------------------------------------------------------------------
-- List policies (optional check):
-- SELECT tablename, policyname, cmd, roles FROM pg_policies WHERE tablename = 'client_addresses';

-- If no INSERT policy on client_addresses, add:
-- CREATE POLICY "Allow authenticated insert on client_addresses"
-- ON public.client_addresses FOR INSERT TO authenticated WITH CHECK (true);

-- If no SELECT policy on client_addresses, add:
-- CREATE POLICY "Allow authenticated select on client_addresses"
-- ON public.client_addresses FOR SELECT TO authenticated USING (true);
