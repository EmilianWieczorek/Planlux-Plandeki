-- =============================================================================
-- PLANLUX PRODUKCJA PLANDEK — FINAL RLS repair for public.client_addresses
-- Goal:
--   - authenticated can INSERT and SELECT public.client_addresses
--   - keep RLS enabled (do NOT disable)
--   - do NOT allow anon writes
--
-- Run in Supabase Dashboard → SQL Editor.
-- =============================================================================

-- ######################################
-- 1) BEFORE STATE INSPECTION
-- ######################################

-- Columns + NOT NULL + defaults
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'client_addresses'
ORDER BY ordinal_position;

-- NOT NULL columns (quick view)
SELECT
  column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'client_addresses'
  AND is_nullable = 'NO'
ORDER BY column_name;

-- Foreign keys (especially client_id → clients.id)
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name  AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'client_addresses'
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.constraint_name, kcu.ordinal_position;

-- RLS enabled / forced?
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname = 'client_addresses';

-- All policies on client_addresses (full detail)
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual::text       AS using_expression,
  with_check::text AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'client_addresses'
ORDER BY policyname;

-- All grants on client_addresses
SELECT
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'client_addresses'
ORDER BY grantee, privilege_type;

-- Explicit: does authenticated have INSERT and SELECT?
SELECT
  bool_or(privilege_type = 'INSERT') AS authenticated_has_insert,
  bool_or(privilege_type = 'SELECT') AS authenticated_has_select
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'client_addresses'
  AND grantee = 'authenticated';

-- CHECK constraints on client_addresses (including constraints that may restrict type values)
SELECT
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND rel.relname = 'client_addresses'
  AND con.contype = 'c'
ORDER BY con.conname;


-- ######################################
-- 2) REPAIR (minimal working state)
-- ######################################

-- Drop only the known target policies we manage (safe + explicit).
DROP POLICY IF EXISTS "Allow authenticated insert on client_addresses" ON public.client_addresses;
DROP POLICY IF EXISTS "Allow authenticated select on client_addresses" ON public.client_addresses;

-- Keep RLS enabled (do NOT disable).
ALTER TABLE public.client_addresses ENABLE ROW LEVEL SECURITY;

-- Grants for authenticated
GRANT SELECT, INSERT ON public.client_addresses TO authenticated;

-- Exactly one INSERT policy for authenticated
CREATE POLICY "Allow authenticated insert on client_addresses"
ON public.client_addresses
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Exactly one SELECT policy for authenticated
CREATE POLICY "Allow authenticated select on client_addresses"
ON public.client_addresses
FOR SELECT
TO authenticated
USING (true);


-- ######################################
-- 3) AFTER STATE INSPECTION
-- ######################################

-- RLS enabled / forced?
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname = 'client_addresses';

-- Policies should include exactly the two policies above (plus any others you intentionally keep).
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual::text       AS using_expression,
  with_check::text AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'client_addresses'
ORDER BY policyname;

-- Grants should show authenticated has SELECT and INSERT.
SELECT
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'client_addresses'
ORDER BY grantee, privilege_type;

SELECT
  bool_or(privilege_type = 'INSERT') AS authenticated_has_insert,
  bool_or(privilege_type = 'SELECT') AS authenticated_has_select
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'client_addresses'
  AND grantee = 'authenticated';

