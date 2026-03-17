import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrdersList } from "@/services/orders";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await getOrdersList();

  return (
    <AppShell title="Zamówienia">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Zamówienia</CardTitle>
          <Link
            href="/orders/new"
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Dodaj zamówienie
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-muted-foreground">
                  <th className="px-3 py-2 text-left">Zamówienie</th>
                  <th className="px-3 py-2 text-left">Klient</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Utworzono</th>
                  <th className="px-3 py-2 text-left">Termin realizacji</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-3 py-2">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{order.client_name}</td>
                    <td className="px-3 py-2 text-xs">
                      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {order.due_date
                        ? new Date(order.due_date).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-center text-sm text-muted-foreground"
                    >
                      Brak zleceń do wyświetlenia.
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

