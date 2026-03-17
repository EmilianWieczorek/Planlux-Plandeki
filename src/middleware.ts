import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/env";

/**
 * Supabase SSR session bridge for Next.js App Router.
 *
 * Ensures auth cookies are refreshed consistently so server-side reads/writes
 * (Server Components, Server Actions, Route Handlers) run with the expected
 * authenticated session when the user is logged in.
 */
export async function middleware(request: NextRequest) {
  const env = getSupabaseEnv();
  const response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        response.cookies.set({ name, value: "", ...options });
      }
    }
  });

  // Trigger session refresh if needed. Do not log or throw here.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

