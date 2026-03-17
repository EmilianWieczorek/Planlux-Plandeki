import { LogOut } from "lucide-react";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AppHeaderProps {
  title?: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();

    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  const handleLogout = async () => {
    const supabase = getBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {title ?? "Planlux Produkcja Plandek"}
        </h1>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {userEmail && <span>{userEmail}</span>}
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-medium hover:bg-muted"
        >
          <LogOut className="h-3 w-3" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

