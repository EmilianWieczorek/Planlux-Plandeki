# Client insert RLS 42501 – diagnostic report

**Project:** PLANLUX PRODUKCJA PLANDEK  
**Error:** `code: 42501`, `new row violates row-level security policy for table "clients"`  
**Scope:** Why the insert is rejected; safest fix; no blind security changes.

---

## 1. ROOT CAUSE HYPOTHESES (ranked)

1. **RLS is enabled on `clients`, but there is no INSERT policy**  
   With RLS on and no policy permitting INSERT, every insert is rejected with 42501. The app assumes authenticated users can create clients; the DB has not been given that rule.

2. **RLS is enabled, an INSERT policy exists, but its condition is not satisfied**  
   Policy might require e.g. `auth.role() = 'authenticated'` (and session is missing on the server), or `auth.uid() = some_column` when `clients` has no such column, or a role/claim the JWT doesn’t have.

3. **Session is not available in the Server Action context**  
   Request to the Server Action might not include Supabase auth cookies (e.g. Electron, cookie scope, or no middleware refresh), so the server Supabase client runs as **anon**. Any policy that allows only `authenticated` would then block the insert.

4. **INSERT policy exists but targets a different role or check**  
   e.g. only `service_role` or a custom claim; anon key + user JWT never passes.

---

## 2. MOST LIKELY ROOT CAUSE

**RLS is enabled on `clients` and there is no INSERT policy (or no policy that allows the current context to insert).**

- Schema/column issues were already fixed; the insert reaches the table and then fails with 42501, so the failure is authorization, not structure.
- The app uses the **anon key** and relies on **session in cookies** for identity. If the project was set up with RLS “on” by default or for safety, it’s common to have SELECT policies and forget an explicit INSERT policy for `clients`.
- Result: RLS blocks the insert because no policy grants INSERT in the context (authenticated or anon) that the request uses.

---

## 3. WHICH SUPABASE CLIENT / AUTH CONTEXT IS USED FOR INSERT

| Aspect | Detail |
|--------|--------|
| **Client** | **Server Supabase client** from `getServerSupabaseClient()` in `src/lib/supabase/server.ts`. |
| **Creation** | `createServerClient()` from `@supabase/ssr` with `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon key). |
| **Context** | Used inside a **Next.js Server Action** (`createClientAction` → `createClient()`). |
| **Session** | Client is built with a cookie adapter (`cookies()` from `next/headers`). It **reads** auth session from the request cookies; it does **not** use the service role key. |
| **Effective role** | If cookies contain a valid Supabase session → **authenticated** (JWT with `role: authenticated`). If cookies are missing or session invalid/expired → **anon**. |

So the insert runs as **either authenticated or anon**, depending on whether the Server Action request carries a valid Supabase session in cookies. It never runs as `service_role`.

---

## 4. WHETHER THE USER SESSION IS LIKELY PRESENT OR NOT

**Likely present, but not guaranteed.**

- The user can only reach `/clients/new` after the **client-side** `AppShell` has seen a session (`getSession()` in `app-shell.tsx`) and did not redirect to `/login`. So the **browser** had a session when the page was shown.
- When the form is submitted, the **same-origin** Server Action request should include cookies by default in Next.js, so the server **can** receive the same Supabase auth cookies.
- **Caveats:** In Electron, cookie handling or origin can differ; session could expire between page load and submit; or cookie path/domain might not be sent with the action request. So “likely present” is the best we can say without logging `getSession()` in the Server Action.

**Conclusion:** Plausible that the insert runs as **authenticated**. If it still fails with 42501, the most likely DB-side cause is missing or restrictive INSERT policy, not necessarily missing session.

---

## 5. WHETHER THIS IS MAINLY:

| Option | Assessment |
|--------|------------|
| **Missing INSERT policy** | **Most likely.** RLS on, no policy that allows INSERT for the role used (usually `authenticated`) → 42501. |
| **Bad auth context** | **Possible.** If session is not sent or is anon, a policy that allows only `authenticated` would block. Fix would be to ensure session is available (cookies + optional middleware refresh). |
| **Wrong server helper/client** | **Unlikely.** The code correctly uses the server helper that reads cookies; no service role or browser client is used for the insert. |
| **Policy condition mismatch** | **Possible.** INSERT policy might exist but use a condition that never holds (e.g. `user_id = auth.uid()` on a table without `user_id`, or wrong role). |

**Summary:** Primarily **missing or non-matching INSERT policy**; secondarily **auth context** (session not reaching the server).

---

## 6. WHAT MUST BE VERIFIED IN SUPABASE

Do the following in the **Supabase Dashboard** (SQL Editor or Table Editor) or via SQL:

1. **RLS status on `clients`**
   - Run:  
     `SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'clients';`  
   - Or: Table → **clients** → check “RLS enabled”.  
   - Confirm whether RLS is **ON**.

2. **Policies on `clients`**
   - Run:  
     `SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'clients';`  
   - Or: Table **clients** → “Policies” tab.  
   - List all policies; note which ones apply to **INSERT** (e.g. `cmd = 'INSERT'` or “ALL”).

3. **Existence of an INSERT policy**
   - If there is **no** policy with operation INSERT (or ALL), that explains 42501.  
   - If there **is** an INSERT policy, inspect its **WITH CHECK** (and **USING** if any) expression.

4. **Policy condition**
   - If the policy uses `auth.role() = 'authenticated'`, then the request must be authenticated.  
   - If it uses `auth.uid() = user_id` (or similar), then `clients` must have that column and the insert must set it (or the policy must be adjusted).  
   - Note the exact expression to see why the current insert might not pass.

5. **Optional: confirm auth at insert time**
   - In the app, temporarily in `createClient()` (or in the Server Action), call `const { data } = await supabase.auth.getSession();` and log `data.session?.user?.id` and `data.session?.user?.role`.  
   - This confirms whether the server sees an authenticated user when the insert runs.

---

## 7. SAFEST REPAIR STRATEGY

**Preferred approach: keep RLS on and add a minimal, explicit INSERT policy for authenticated users.**

1. **Do not** disable RLS on `clients`.  
2. **Do not** allow anon inserts (no “allow all” or anon-only policy).  
3. **Add** an INSERT policy on `clients` that:
   - Applies to **INSERT** only (or to the operations you intend).
   - Allows inserts only when the role is **authenticated** (e.g. `auth.role() = 'authenticated'`), so only logged-in users of your app can create clients.  
4. **Optional but recommended:** Ensure the Server Action runs with a valid session (cookies sent; optionally add Next.js middleware to refresh Supabase session so it doesn’t expire mid-flow).  
5. **If** the table later gets a `created_by` or `user_id` column, tighten the policy (e.g. allow INSERT only when `auth.uid() = user_id` or when a backend sets it), instead of opening the table to anon.

**Why this is best for an internal desktop business app:**  
- Keeps RLS and keeps the principle of least privilege.  
- No service role in the browser or in the generic server client; no bypassing RLS.  
- Only authenticated users (who passed your login) can insert; anon cannot.  
- You can later narrow the policy (e.g. by role or `user_id`) without a big redesign.

**Alternative if session truly never reaches the server:**  
- First try to fix session (cookies, middleware, Electron request handling).  
- Only if that’s impossible and the app is strictly internal/trusted, consider a **backend-only** path that uses the **service role** for this one operation (e.g. dedicated API route or Server Action that uses a server-only service role client). That would bypass RLS for that call; use only if you accept that trade-off and keep the endpoint protected by your own checks.

---

## 8. FILES INSPECTED

| File | Role |
|------|------|
| `src/app/actions/clients.ts` | Server Action; calls `createClient()`; no Supabase call here. |
| `src/services/clients/index.ts` | `createClient()` uses `getServerSupabaseClient()` for insert into `clients` and `client_addresses`. |
| `src/lib/supabase/server.ts` | Defines `getServerSupabaseClient()`: `createServerClient` with anon key + cookie get/set/remove. |
| `src/lib/supabase/client.ts` | Browser client (anon key); not used for the insert. |
| `src/lib/env.ts` | Only anon key and URL; no service role. |
| `src/app/(auth)/login/page.tsx` | `signInWithPassword` via browser client; establishes session. |
| `src/components/layout/app-shell.tsx` | Client-side `getSession()`; redirects to login if no session. |
| No `middleware.ts` | No centralized cookie refresh or auth middleware. |

---

## 9. RECOMMENDED NEXT STEP FOR A REPAIR PROMPT

Use a prompt along these lines:

1. **In Supabase (SQL or Dashboard):**  
   - Confirm RLS is enabled on `clients`.  
   - List all policies on `clients`.  
   - If there is no INSERT policy: add one that allows INSERT for `auth.role() = 'authenticated'` (name e.g. `Allow authenticated insert on clients`), with a WITH CHECK of `true` (or a stricter check if the table has a `user_id`/`created_by` column you want to enforce).  
   - If an INSERT policy already exists: adjust its WITH CHECK (and USING if relevant) so that authenticated users inserting the current row shape (e.g. only `company_name`) pass the check; or document why the condition fails and change it accordingly.

2. **Optional in code:**  
   - In the Server Action or in `createClient()`, temporarily log `(await getServerSupabaseClient().auth.getSession()).data.session` to confirm the session is present when creating a client. Remove or guard the log after verification.

3. **Retest:**  
   - Log in, open `/clients/new`, submit the form.  
   - If 42501 persists, re-check the exact policy expression and that the request is authenticated (session log above).

4. **Do not:**  
   - Disable RLS, add an anon-only or “allow all” policy, or use the service role key in the client or in the generic server Supabase helper used by this flow.

---

*End of diagnostic. No code or schema changes applied; no security weakened.*
