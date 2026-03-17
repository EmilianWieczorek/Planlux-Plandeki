import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLabelsToPrint } from "@/services/labels";

export const dynamic = "force-dynamic";

export default async function LabelsPage() {
  const labels = await getLabelsToPrint();

  return (
    <AppShell title="Etykiety do wydruku">
      <Card>
        <CardHeader>
          <CardTitle>Etykiety do wydruku</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-muted-foreground">
                  <th className="px-3 py-2 text-left">Zamówienie</th>
                  <th className="px-3 py-2 text-left">Etykieta</th>
                  <th className="px-3 py-2 text-left">Zadanie</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {labels.map((label) => (
                  <tr
                    key={label.id}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-3 py-2">{label.order_number}</td>
                    <td className="px-3 py-2">{label.label_number}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {label.production_task_id}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
                        {label.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {labels.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-6 text-center text-sm text-muted-foreground"
                    >
                      Brak etykiet oczekujących na wydruk.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Struktura przygotowana pod przyszłą integrację z generowaniem PDF /
            wydrukiem etykiet.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}

