import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WzTemplate } from "@/components/templates/wz-template";

/** Sample data for WZ template preview. Replace with real document data when generating from warehouse document. */
const sampleWzData = {
  document_number: "WZ/2025/0001",
  client_name: "Przykładowa Firma Sp. z o.o.",
  address: "ul. Przemysłowa 1\n00-001 Warszawa\nPolska",
  issue_date: new Date().toISOString().slice(0, 10),
  items: [
    { name: "Plandeka standard – typ A", quantity: 10, unit: "szt." },
    { name: "Plandeka wzmocniona – typ B", quantity: 5, unit: "szt." }
  ],
  notes: "Dostawa na adres magazynowy. Uwagi: ostrożnie z ładunkiem."
};

export default function WzPreviewPage() {
  return (
    <AppShell title="Podgląd szablonu WZ">
      <Card>
        <CardHeader>
          <CardTitle>Szablon dokumentu WZ (Wydanie zewnętrzne)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Podgląd z przykładowymi danymi. W produkcji dane będą pobierane z dokumentu magazynowego.
          </p>
        </CardHeader>
        <CardContent>
          <WzTemplate data={sampleWzData} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
