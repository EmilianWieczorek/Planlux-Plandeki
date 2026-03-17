import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientById } from "@/services/clients";

interface ClientDetailPageProps {
  params: { id: string };
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { client, addresses } = await getClientById(params.id);

  return (
    <AppShell title={`Klient • ${client.name || "-"}`}>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Klient</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nazwa</span>
              <span className="font-medium">{client.name || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">NIP</span>
              <span className="font-medium">{client.tax_id ?? "-"}</span>
            </div>
            {client.contact_person && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Osoba kontaktowa</span>
                <span className="font-medium">{client.contact_person}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Telefon</span>
                <span className="font-medium">{client.phone}</span>
              </div>
            )}
            {client.email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">E-mail</span>
                <span className="font-medium">{client.email}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Utworzono</span>
              <span className="font-medium">
                {new Date(client.created_at).toLocaleDateString()}
              </span>
            </div>
            {client.notes && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uwagi</span>
                <span className="font-medium">{client.notes}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Adresy</CardTitle>
          </CardHeader>
          <CardContent>
            {addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Brak adresów przypisanych do klienta.
              </p>
            ) : (
              <div className="space-y-3 text-sm">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="rounded-md border p-3"
                  >
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>{address.type ?? "Adres"}</span>
                    </div>
                    <div className="font-medium">
                      {address.street ?? "-"}
                    </div>
                    <div>
                      {address.postal_code ?? ""} {address.city ?? ""}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {address.country}
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

