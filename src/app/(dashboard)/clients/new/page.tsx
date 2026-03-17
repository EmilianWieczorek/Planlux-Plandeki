import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientForm } from "./client-form";

export default function NewClientPage() {
  return (
    <AppShell title="Nowy klient">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Dodaj klienta</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientForm />
        </CardContent>
      </Card>
    </AppShell>
  );
}
