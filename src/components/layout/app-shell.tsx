"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { AppHeader } from "./app-header";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

interface AppShellProps {
  children: ReactNode;
  title?: string;
}

export function AppShell({ children, title }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"admin" | "manager" | "foreman" | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const supabase = getBrowserSupabaseClient();

        const { data } = await supabase.auth.getSession();
        const session = data.session;

        if (!session) {
          if (pathname !== "/login") {
            router.replace("/login");
          }
          if (!cancelled) {
            setLoading(false);
          }
          return;
        }

        if (!cancelled) {
          // Fetch role from user_roles / roles if needed later.
          // For now, treat everyone as manager for UI.
          setRole("manager");
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          const err =
            e instanceof Error
              ? e
              : new Error("Supabase configuration error in client shell.");
          console.error("[AppShell] Failed to initialize Supabase session", err);
          setError(err);
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Loading application...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center px-4">
        <div className="max-w-lg rounded-lg border border-red-200 bg-red-50 p-5 shadow-sm">
          <h1 className="mb-2 text-base font-semibold text-red-800">
            Supabase configuration required
          </h1>
          <p className="mb-2 text-sm text-red-800">
            Aplikacja kliencka nie mogła zainicjalizować połączenia z Supabase.
            Najprawdopodobniej brakuje konfiguracji środowiska.
          </p>
          <pre className="mb-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-md border border-red-200 bg-white px-3 py-2 text-[11px] text-red-800">
            {error.message}
          </pre>
          <p className="text-xs text-red-900">
            Upewnij się, że w katalogu projektu istnieje plik{" "}
            <code>.env.local</code> z wartościami:
          </p>
          <code className="mt-1 block text-xs text-red-900">
            NEXT_PUBLIC_SUPABASE_URL=...
          </code>
          <code className="block text-xs text-red-900">
            NEXT_PUBLIC_SUPABASE_ANON_KEY=...
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader title={title} />
        <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

