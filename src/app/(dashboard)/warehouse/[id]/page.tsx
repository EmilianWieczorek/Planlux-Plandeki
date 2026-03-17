import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWarehouseDocumentById } from "@/services/warehouse";

interface WarehouseDetailPageProps {
  params: { id: string };
}

export default async function WarehouseDetailPage({
  params
}: WarehouseDetailPageProps) {
  const { header, items } = await getWarehouseDocumentById(params.id);

  return (
    <AppShell title={`Dokument magazynowy • ${header.document_number ?? header.id}`}>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Nagłówek dokumentu</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-3">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Numer</div>
              <div className="font-medium">
                {header.document_number ?? header.id}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Typ</div>
              <div className="font-medium">{header.document_type}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Data wystawienia</div>
              <div className="font-medium">
                {header.issue_date
                  ? new Date(header.issue_date).toLocaleDateString()
                  : "-"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pozycje</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Brak pozycji w tym dokumencie.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs uppercase text-muted-foreground">
                        <th className="px-3 py-2 text-left">Pozycja</th>
                        <th className="px-3 py-2 text-left">Opis</th>
                        <th className="px-3 py-2 text-left">Ilość</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: any) => (
                      <tr
                        key={item.id}
                        className="border-b last:border-0 hover:bg-muted/50"
                      >
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {item.id}
                        </td>
                        <td className="px-3 py-2">
                          {item.description ?? "-"}
                        </td>
                        <td className="px-3 py-2">
                          {item.quantity ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

