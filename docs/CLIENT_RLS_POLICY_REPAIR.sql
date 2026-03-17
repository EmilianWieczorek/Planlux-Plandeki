-- =============================================================================
-- PLANLUX PRODUKCJA PLANDEK — RLS repair for table "clients"
-- Run in Supabase Dashboard → SQL Editor (or psql).
-- Do NOT disable RLS. Do NOT allow anon inserts.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. CHECK WHETHER RLS IS ENABLED ON public.clients
-- -----------------------------------------------------------------------------
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname = 'clients';

-- Expected: rls_enabled = true. If false, RLS is off (we do NOT turn it off).


-- -----------------------------------------------------------------------------
-- 2. LIST ALL EXISTING POLICIES ON public.clients
-- -----------------------------------------------------------------------------
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual::text    AS using_expression,
  with_check::text AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'clients'
ORDER BY policyname;

-- Look for any policy with cmd = 'INSERT' or cmd = '*'. If none, add the one below.
-- If one exists but is wrong (e.g. allows anon or wrong condition), drop it then create the safe one.


-- -----------------------------------------------------------------------------
-- 3. CREATE SAFE INSERT POLICY (only authenticated users)
-- -----------------------------------------------------------------------------
-- Run this if there is no INSERT policy, or after dropping a bad one.

CREATE POLICY "Allow authenticated insert on clients"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Meaning:
--   FOR INSERT  → applies only to INSERT.
--   TO authenticated → only Supabase role 'authenticated' (logged-in users).
--   WITH CHECK (true) → no extra row-level condition; any new row is allowed for that role.
-- Anon and service_role are not granted INSERT by this policy.


-- -----------------------------------------------------------------------------
-- 4. DROP AN EXISTING BAD INSERT POLICY (only if you have one to replace)
-- -----------------------------------------------------------------------------
-- Use only if step 2 showed an INSERT policy that is wrong (e.g. wrong role or condition).
-- Replace "YourExistingPolicyName" with the actual policyname from step 2.

-- DROP POLICY IF EXISTS "YourExistingPolicyName" ON public.clients;

-- Example if the policy were named "Enable insert for anon" (we do NOT want anon):
-- DROP POLICY IF EXISTS "Enable insert for anon" ON public.clients;

-- After dropping, run the CREATE POLICY from section 3.


-- -----------------------------------------------------------------------------
-- 5. (OPTIONAL) ENABLE RLS IF IT WAS OFF
-- -----------------------------------------------------------------------------
-- Only if step 1 showed rls_enabled = false and you want RLS on. Do not run if RLS is already on.

-- ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Then create the INSERT policy from section 3.
