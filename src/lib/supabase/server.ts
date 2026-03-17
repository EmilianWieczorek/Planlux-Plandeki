import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/env";

/**
 * Server Supabase client for use in Server Components, Server Actions, and Route Handlers.
 * Cookie reads work in all contexts. Cookie writes (set/remove) are no-op'd in Server
 * Component context because Next.js 14 only allows cookie mutation in Server Actions or
 * Route Handlers. Session refresh triggered by Supabase in RSC will not persist cookies
 * for that request but will not throw; use middleware if you need to refresh and set
 * cookies on every request.
 */
export function getServerSupabaseClient(): SupabaseClient {
  const cookieStore = cookies();
  const env = getSupabaseEnv();

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Next.js 14: cookies can only be modified in a Server Action or Route Handler.
            // Ignore so Server Component rendering does not throw; session read still works.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Same as set: avoid throwing in Server Component context.
          }
        }
      }
    }
  );

  return supabase;
}

