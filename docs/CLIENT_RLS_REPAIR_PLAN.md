# Client RLS repair plan

**Project:** PLANLUX PRODUKCJA PLANDEK  
**Goal:** Safe INSERT policy for `clients`; no RLS disabled; no anon insert.

---

## 1. EXACT SQL TO CHECK RLS STATUS

```sql
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname = 'clients';
```

---

## 2. EXACT SQL TO LIST CURRENT POLICIES

```sql
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
  AND tablename = 'clients'
ORDER BY policyname;
```

---

## 3. EXACT SQL TO CREATE THE SAFE INSERT POLICY

```sql
CREATE POLICY "Allow authenticated insert on clients"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (true);
```

---

## 4. EXACT SQL TO DROP/REPLACE A BAD INSERT POLICY IF NEEDED

Replace `"YourExistingPolicyName"` with the actual policy name from step 2 (e.g. if you have an INSERT policy that allows anon or has a failing condition).

```sql
DROP POLICY IF EXISTS "YourExistingPolicyName" ON public.clients;
```

Then run the `CREATE POLICY` from section 3.

---

## 5. SHORT EXPLANATION OF WHY THIS POLICY IS SAFE

- **RLS stays on** — we only add a policy; we do not disable RLS.
- **Only `authenticated`** — `TO authenticated` means only requests that carry a valid Supabase JWT with role `authenticated` (i.e. logged-in users) can insert. Anonymous requests (anon key, no session) do **not** have this role and cannot insert.
- **Least privilege** — the policy applies only to **INSERT**; it does not grant SELECT/UPDATE/DELETE. Other policies (if any) continue to control those operations.
- **WITH CHECK (true)** — we do not restrict which rows can be inserted beyond “must be authenticated”. If you later add a `created_by` column, you can tighten to e.g. `WITH CHECK (auth.uid() = created_by)`.
- **No anon, no service role** — anon inserts remain blocked; we are not using the service role in this flow.

---

## 6. OPTIONAL TEMP DEBUG SNIPPET TO VERIFY AUTH SESSION IN SERVER ACTION

Add **temporarily** at the very start of `createClient()` in `src/services/clients/index.ts` (right after `const supabase = getServerSupabaseClient();`) to confirm the insert runs with a session:

```ts
// TEMP DEBUG: remove after verifying session
const { data: sessionData } = await supabase.auth.getSession();
const user = sessionData.session?.user;
console.log("[createClient] auth:", user ? { id: user.id, role: user.role } : "no session");
```

Or in the Server Action `src/app/actions/clients.ts` before calling `createClientRecord`:

```ts
// TEMP DEBUG: remove after verifying session
const supabase = (await import("@/lib/supabase/server")).getServerSupabaseClient();
const { data } = await supabase.auth.getSession();
console.log("[createClientAction] session:", data.session ? "present" : "missing", data.session?.user?.id ?? "-");
```

If logs show "no session" / "missing", the 42501 may be due to session not reaching the server (cookies / Electron). If "present" and you still get 42501, the problem is the policy (missing or wrong condition).

**Remove the snippet after verification.**

---

## 7. MANUAL TEST CHECKLIST

1. **Login** — Open the app, sign in with a valid user (e.g. `/login`).
2. **Open** `/clients/new`.
3. **Save client** — Fill at least "Nazwa", submit the form.
4. **Verify no 42501** — No error "new row violates row-level security policy"; success redirect or success state.
5. **Verify new record exists** — In Supabase Table Editor for `clients`, or on `/clients` list and `/clients/[id]` detail, confirm the new client row is present.

---

*SQL file: `docs/CLIENT_RLS_POLICY_REPAIR.sql`*
