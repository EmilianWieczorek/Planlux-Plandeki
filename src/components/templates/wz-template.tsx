"use client";

import type { WzTemplateData } from "@/types/db";

/**
 * Printable WZ (Wydanie Zewnętrzne) document template.
 * Structure prepared for later PDF/print; styling can be replaced without changing props.
 */
export function WzTemplate({ data }: { data: WzTemplateData }) {
  return (
    <div
      className="w-full max-w-[210mm] border border-border bg-white p-6 text-sm print:border-0 print:shadow-none"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <header className="mb-6 border-b pb-4">
        <h1 className="text-lg font-bold">Dokument WZ – Wydanie zewnętrzne</h1>
        <p className="mt-1 text-muted-foreground">Numer dokumentu: {data.document_number}</p>
        <p className="text-muted-foreground">Data wystawienia: {data.issue_date}</p>
      </header>

      <section className="mb-6">
        <h2 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Odbiorca</h2>
        <p className="font-medium">{data.client_name}</p>
        <p className="whitespace-pre-wrap text-muted-foreground">{data.address}</p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Pozycje</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <th className="p-2">Lp.</th>
              <th className="p-2">Nazwa / opis</th>
              <th className="p-2 text-right">Ilość</th>
              <th className="p-2 text-right">Jedn.</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i} className="border-b">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{item.name}</td>
                <td className="p-2 text-right">{item.quantity}</td>
                <td className="p-2 text-right">{item.unit ?? "szt."}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {data.notes && (
        <section className="mt-4">
          <h2 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Uwagi</h2>
          <p className="whitespace-pre-wrap text-muted-foreground">{data.notes}</p>
        </section>
      )}

      <footer className="mt-8 border-t pt-4 text-xs text-muted-foreground">
        Dokument wygenerowany z systemu PLANLUX PRODUKCJA PLANDEK. Szablon WZ – do stylizacji.
      </footer>
    </div>
  );
}
