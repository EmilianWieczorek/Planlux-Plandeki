import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/env";

let browserClient: SupabaseClient | null = null;
let browserClientError: Error | null = null;

export function getBrowserSupabaseClient(): SupabaseClient {
  if (browserClient) return browserClient;
  if (browserClientError) throw browserClientError;

  try {
    const env = getSupabaseEnv();

    browserClient = createBrowserClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookieOptions: {
          // handled by Supabase internally in the browser
        }
      }
    );

    return browserClient;
  } catch (error: any) {
    console.error("[Supabase] Browser client initialization failed", error);
    browserClientError =
      error instanceof Error
        ? error
        : new Error("Supabase browser client failed to initialize.");
    throw browserClientError;
  }
}

