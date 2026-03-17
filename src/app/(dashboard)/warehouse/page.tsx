import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWarehouseDocuments } from "@/services/warehouse";

export const dynamic = "force-dynamic";

export default async function WarehousePage() {
  const documents = await getWarehouseDocuments();

  return (
    <AppShell title="Dokumenty magazynowe">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Dokumenty magazynowe (WZ)</CardTitle>
          <Link
            href="/warehouse/wz-preview"
            className="text-sm font-medium text-primary hover:underline"
          >
            Podgląd szablonu WZ
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-muted-foreground">
                  <th className="px-3 py-2 text-left">Numer</th>
                  <th className="px-3 py-2 text-left">Typ</th>
                  <th className="px-3 py-2 text-left">Klient</th>
                  <th className="px-3 py-2 text-left">Data wystawienia</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-3 py-2">
                      <Link
                        href={`/warehouse/${doc.id}`}
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        {doc.document_number}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {doc.document_type}
                    </td>
                    <td className="px-3 py-2">{doc.client_name ?? "-"}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {new Date(doc.issue_date).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {documents.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-center text-sm text-muted-foreground"
                    >
                      Brak dokumentów magazynowych do wyświetlenia.
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

