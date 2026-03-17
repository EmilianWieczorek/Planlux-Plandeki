import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClients } from "@/services/clients";
import { OrderForm } from "./order-form";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const clients = await getClients();

  return (
    <AppShell title="Nowe zamówienie">
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>Dodaj zamówienie</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderForm clients={clients} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
