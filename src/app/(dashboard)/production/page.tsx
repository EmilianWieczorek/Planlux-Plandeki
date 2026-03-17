import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProductionQueue } from "@/services/production";

export const dynamic = "force-dynamic";

export default async function ProductionPage() {
  const tasks = await getProductionQueue();

  return (
    <AppShell title="Kolejka produkcyjna">
      <Card>
        <CardHeader>
          <CardTitle>Kolejka produkcyjna</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-muted-foreground">
                  <th className="px-3 py-2 text-left">Zamówienie</th>
                  <th className="px-3 py-2 text-left">Zadanie</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Planowany start</th>
                  <th className="px-3 py-2 text-left">Planowany koniec</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-3 py-2">{task.order_number ?? "-"}</td>
                    <td className="px-3 py-2">{task.task_type ?? "-"}</td>
                    <td className="px-3 py-2 text-xs">
                      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
                        {task.status ?? "-"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {task.planned_start
                        ? new Date(task.planned_start).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {task.planned_end
                        ? new Date(task.planned_end).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
                {tasks.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-center text-sm text-muted-foreground"
                    >
                      Brak zadań w kolejce produkcyjnej.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}

