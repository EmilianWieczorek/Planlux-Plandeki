# Client RLS grants + SELECT policy repair plan

**Context:** Auth/session is valid (getSession/getUser present, role = authenticated). Insert still fails with 42501. Repair is database-side: SELECT policy and table grants.

---

## 1. SQL to create SELECT policy for authenticated on public.clients

```sql
CREATE POLICY "Allow authenticated select on clients"
ON public.clients
FOR SELECT
TO authenticated
USING (true);
```

---

## 2. SQL to grant SELECT, INSERT on public.clients to authenticated

```sql
GRANT SELECT, INSERT ON public.clients TO authenticated;
```

---

## 3. SQL to grant SELECT, INSERT on public.client_addresses to authenticated

```sql
GRANT SELECT, INSERT ON public.client_addresses TO authenticated;
```

---

## 4. SQL to inspect current grants on both tables

```sql
SELECT
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('clients', 'client_addresses')
ORDER BY table_name, grantee, privilege_type;
```

Run this first to see what’s already granted; then run 1–3 (and 5 below if needed).

---

## 5. If RLS is enabled on client_addresses — policies for authenticated

If the grant in (3) still doesn’t fix address insert, add RLS policies (run only if `client_addresses` has RLS enabled):

```sql
-- INSERT (if missing)
CREATE POLICY "Allow authenticated insert on client_addresses"
ON public.client_addresses FOR INSERT TO authenticated WITH CHECK (true);

-- SELECT (if missing)
CREATE POLICY "Allow authenticated select on client_addresses"
ON public.client_addresses FOR SELECT TO authenticated USING (true);
```

---

## 6. Short explanation why `.insert(...).select("id").single()` may require SELECT visibility

PostgREST executes `insert(...).select("id").single()` as:

1. **INSERT** the row (RLS: INSERT policy WITH CHECK must pass).
2. **SELECT** the inserted row to return it (RLS: SELECT policy USING must pass).

If there is **no SELECT policy** for `authenticated` on `clients`, step 2 fails: the role is not allowed to read the new row. Supabase can report that as an RLS violation (42501). So even when the INSERT policy allows the write, the combined mutation can fail until the role can also SELECT that row. Adding a SELECT policy for `authenticated` (and ensuring `GRANT SELECT`) fixes the return step.

Table-level **GRANT** is also required: RLS only applies after the role has been granted the operation on the table. If `authenticated` has no `SELECT` or `INSERT` on `public.clients`, the operation is denied before RLS is evaluated. So both grants and SELECT policy are needed.

---

## 7. Manual retest checklist

1. **Run the SQL** in Supabase (SQL Editor): (4) inspect grants, then (1), (2), (3). If you use addresses and RLS is on `client_addresses`, run (5) as needed.
2. **Login** in the app with a valid user.
3. **Open** `/clients/new`, fill at least "Nazwa", submit.
4. **Confirm** no 42501; success redirect to `/clients/[id]`.
5. **Confirm** the new client appears in the list and on the detail page; if you filled address, it appears under Adresy.

---

*SQL file: `docs/CLIENT_RLS_GRANTS_AND_SELECT_REPAIR.sql`*
