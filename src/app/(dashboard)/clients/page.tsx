import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClients } from "@/services/clients";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <AppShell title="Klienci">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Klienci</CardTitle>
          <Link
            href="/clients/new"
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Dodaj klienta
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-muted-foreground">
                  <th className="px-3 py-2 text-left">Nazwa</th>
                  <th className="px-3 py-2 text-left">NIP</th>
                  <th className="px-3 py-2 text-left">Utworzono</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-3 py-2">
                      <Link
                        href={`/clients/${client.id}`}
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        {client.name || "-"}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{client.tax_id ?? "-"}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {new Date(client.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-6 text-center text-sm text-muted-foreground"
                    >
                      Brak klientów do wyświetlenia.
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

