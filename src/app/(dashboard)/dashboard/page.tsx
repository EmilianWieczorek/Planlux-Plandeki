import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/env";

async function getDashboardStats() {
  const supabase = getServerSupabaseClient();

  const [{ count: ordersCount }, { count: tasksCount }, { count: labelsCount }, { count: warehouseDocsCount }] =
    await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("production_tasks").select("id", { count: "exact", head: true }),
      supabase.from("production_labels").select("id", { count: "exact", head: true }),
      supabase.from("warehouse_documents").select("id", { count: "exact", head: true })
    ]);

  return {
    ordersCount: ordersCount ?? 0,
    tasksCount: tasksCount ?? 0,
    labelsCount: labelsCount ?? 0,
    warehouseDocsCount: warehouseDocsCount ?? 0
  };
}

async function getPreviewData() {
  const supabase = getServerSupabaseClient();

  const [{ data: orders }, { data: queue }, { data: labels }] = await Promise.all([
    supabase
      .from("v_orders_list")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("v_production_queue")
      .select("*")
      .limit(8),
    supabase
      .from("v_labels_to_print")
      .select("*")
      .order("order_number", { ascending: true })
      .limit(10)
  ]);

  return {
    orders: orders ?? [],
    queue: queue ?? [],
    labels: labels ?? []
  };
}

export default async function DashboardPage() {
  let envError: Error | null = null;
  let stats = {
    ordersCount: 0,
    tasksCount: 0,
    labelsCount: 0,
    warehouseDocsCount: 0
  };
  let previews = {
    orders: [] as any[],
    queue: [] as any[],
    labels: [] as any[]
  };

  try {
    // This will throw a friendly error if Supabase env is invalid.
    getSupabaseEnv();

    [stats, previews] = await Promise.all([
      getDashboardStats(),
      getPreviewData()
    ]);
  } catch (error: any) {
    envError = error instanceof Error ? error : new Error("Supabase configuration error.");
  }

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        {envError && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">
                Supabase configuration required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm text-red-800">
                Aplikacja nie może połączyć się z bazą Supabase z powodu brakującej lub
                niepoprawnej konfiguracji środowiska.
              </p>
              <pre className="mb-3 whitespace-pre-wrap rounded-md border border-red-200 bg-white px-3 py-2 text-[11px] text-red-800">
                {envError.message}
              </pre>
              <p className="text-xs text-red-900">
                Upewnij się, że plik <code>.env.local</code> istnieje w katalogu
                głównym projektu i zawiera poprawne wartości:
                <br />
                <code className="block">
                  NEXT_PUBLIC_SUPABASE_URL=...
                </code>
                <code className="block">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
                </code>
              </p>
            </CardContent>
          </Card>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Zamówienia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{stats.ordersCount}</p>
              <p className="text-xs text-muted-foreground">
                Łączna liczba zleceń produkcyjnych
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Zadania produkcyjne</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{stats.tasksCount}</p>
              <p className="text-xs text-muted-foreground">
                Zadania produkcyjne w systemie
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Etykiety do wydruku</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{stats.labelsCount}</p>
              <p className="text-xs text-muted-foreground">
                Etykiety produkcyjne do wydruku
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Dokumenty magazynowe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{stats.warehouseDocsCount}</p>
              <p className="text-xs text-muted-foreground">
                Dokumenty WZ w systemie
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Ostatnie zamówienia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {previews.orders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div>
                      <div className="font-medium">{order.order_number}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.client_name}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {order.status}
                    </div>
                  </div>
                ))}
                {previews.orders.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Brak zleceń do wyświetlenia.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Kolejka produkcyjna</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {previews.queue.map((task: any, index: number) => (
                  <div
                    key={task.id ?? `queue-${index}`}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div>
                      <div className="font-medium">
                        {task.order_number ?? "-"} – {task.task_type ?? "-"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Status: {task.status ?? "-"}
                      </div>
                    </div>
                  </div>
                ))}
                {previews.queue.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Brak zadań w kolejce produkcyjnej.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Etykiety oczekujące na wydruk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {previews.labels.map((label: any) => (
                  <div
                    key={label.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div>
                      <div className="font-medium">
                        {label.order_number} – {label.label_number}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Status: {label.status}
                      </div>
                    </div>
                  </div>
                ))}
                {previews.labels.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Brak etykiet oczekujących na wydruk.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

