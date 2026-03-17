import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LabelTemplate } from "@/components/templates/label-template";
import { getOrderById } from "@/services/orders";
import { getClientById } from "@/services/clients";

interface OrderDetailPageProps {
  params: { id: string };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { order, items, statusHistory, attachments } = await getOrderById(params.id);
  let clientName = "—";
  try {
    const { client } = await getClientById(order.client_id);
    clientName = client.name || "—";
  } catch {
    // client may be missing
  }
  const firstItem = items[0];
  const dimensions =
    firstItem && [firstItem.width, firstItem.height, firstItem.length].some(Boolean)
      ? [firstItem.width, firstItem.height, firstItem.length].filter(Boolean).join(" × ") + " mm"
      : "—";
  const labelData = {
    order_number: order.order_number ?? order.id,
    client_name: clientName,
    product_type: firstItem?.description ?? "—",
    dimensions,
    color: firstItem?.color ?? "—",
    quantity: firstItem?.quantity ?? 0,
    status: order.status ?? null
  };

  return (
    <AppShell title={`Zamówienie • ${order.order_number ?? order.id}`}>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Nagłówek zamówienia</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm md:grid-cols-2">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Numer zamówienia</div>
                <div className="font-medium">
                  {order.order_number ?? order.id}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Status</div>
                <div>
                  <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Utworzono</div>
                <div className="font-medium">
                  {order.created_at
                    ? new Date(order.created_at).toLocaleString()
                    : "-"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Planowany termin realizacji</div>
                <div className="font-medium">
                  {order.due_date
                    ? new Date(order.due_date).toLocaleDateString()
                    : "-"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Klient</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID klienta</span>
                <span className="font-medium">{order.client_id}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Integracja z modułem klienta może rozszerzyć dane klienta na
                podstawie `client_id`.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Pozycje zamówienia</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Brak pozycji dla tego zlecenia.
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

          <Card>
            <CardHeader>
              <CardTitle>Historia statusów</CardTitle>
            </CardHeader>
            <CardContent>
              {statusHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Brak historii statusów.
                </p>
              ) : (
                <div className="space-y-2 text-sm">
                  {statusHistory.map((row: any) => (
                    <div
                      key={row.id}
                      className="rounded-md border px-3 py-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{row.status}</span>
                        <span className="text-muted-foreground">
                          {row.changed_at
                            ? new Date(row.changed_at).toLocaleString()
                            : "-"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Podgląd etykiety produkcyjnej</CardTitle>
          </CardHeader>
          <CardContent>
            <LabelTemplate data={labelData} />
            <p className="mt-2 text-xs text-muted-foreground">
              Szablon etykiety do wydruku – przygotowany pod integrację z drukarką.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Załączniki</CardTitle>
          </CardHeader>
          <CardContent>
            {attachments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Brak załączników do tego zlecenia.
              </p>
            ) : (
              <div className="space-y-2 text-sm">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div>
                      <div className="font-medium">{attachment.file_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {attachment.file_type ?? "-"}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(attachment.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

