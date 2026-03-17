-- =============================================================================
-- PLANLUX PRODUKCJA PLANDEK — RLS/grants repair for public.client_addresses
-- Goal:
--   - authenticated users can INSERT and SELECT client addresses
--   - anonymous users cannot INSERT/SELECT (unless you already allow it elsewhere)
--   - RLS remains enabled
--
-- Run in Supabase Dashboard → SQL Editor.
-- This script is structured to be safe to run multiple times:
--   - GRANT statements are idempotent
--   - Policies are created only if missing (via DO blocks)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- INSPECT: columns + NOT NULL + defaults for client_addresses
-- -----------------------------------------------------------------------------
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'client_addresses'
ORDER BY ordinal_position;

-- -----------------------------------------------------------------------------
-- INSPECT: NOT NULL columns (quick view)
-- -----------------------------------------------------------------------------
SELECT
  column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'client_addresses'
  AND is_nullable = 'NO'
ORDER BY column_name;

-- -----------------------------------------------------------------------------
-- INSPECT: foreign keys on client_addresses (especially client_id → clients.id)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- INSPECT: RLS enabled status for client_addresses
-- -----------------------------------------------------------------------------
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname = 'client_addresses';

-- -----------------------------------------------------------------------------
-- INSPECT: current policies on client_addresses
-- -----------------------------------------------------------------------------
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual::text AS using_expression,
  with_check::text AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'client_addresses'
ORDER BY policyname;

-- -----------------------------------------------------------------------------
-- INSPECT: current grants on client_addresses
-- -----------------------------------------------------------------------------
SELECT
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'client_addresses'
ORDER BY grantee, privilege_type;

-- -----------------------------------------------------------------------------
-- GRANTS: ensure authenticated can SELECT/INSERT (table privileges)
-- -----------------------------------------------------------------------------
GRANT SELECT, INSERT ON public.client_addresses TO authenticated;

-- -----------------------------------------------------------------------------
-- POLICIES: ensure authenticated can INSERT and SELECT under RLS
-- Notes:
--   - CREATE POLICY has no IF NOT EXISTS, so we guard with DO blocks.
--   - USING applies to SELECT; WITH CHECK applies to INSERT.
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'client_addresses'
      AND policyname = 'Allow authenticated insert on client_addresses'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow authenticated insert on client_addresses"
             ON public.client_addresses
             FOR INSERT
             TO authenticated
             WITH CHECK (true)';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'client_addresses'
      AND policyname = 'Allow authenticated select on client_addresses'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow authenticated select on client_addresses"
             ON public.client_addresses
             FOR SELECT
             TO authenticated
             USING (true)';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- OPTIONAL: if RLS is unexpectedly disabled and you want it enabled, uncomment:
-- -----------------------------------------------------------------------------
-- ALTER TABLE public.client_addresses ENABLE ROW LEVEL SECURITY;

