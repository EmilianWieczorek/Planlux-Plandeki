"use client";

import type { LabelTemplateData } from "@/types/db";

/**
 * Production label/sticker template for orders/products.
 * Reusable; styling isolated for later replacement (e.g. exact user design).
 */
export function LabelTemplate({ data }: { data: LabelTemplateData }) {
  return (
    <div
      className="inline-block w-[80mm] border-2 border-border bg-white p-3 text-sm print:border-2 print:border-black"
      style={{ fontFamily: "system-ui, sans-serif", minHeight: "50mm" }}
    >
      <div className="border-b border-dashed pb-2 mb-2">
        <p className="text-[10px] text-muted-foreground">Zamówienie</p>
        <p className="font-bold">{data.order_number}</p>
      </div>
      <div className="border-b border-dashed pb-2 mb-2">
        <p className="text-[10px] text-muted-foreground">Klient</p>
        <p className="font-medium">{data.client_name}</p>
      </div>
      <div className="border-b border-dashed pb-2 mb-2">
        <p className="text-[10px] text-muted-foreground">Produkt / typ</p>
        <p className="font-medium">{data.product_type}</p>
      </div>
      <div className="grid grid-cols-2 gap-1 text-xs border-b border-dashed pb-2 mb-2">
        <span className="text-muted-foreground">Wymiary:</span>
        <span>{data.dimensions || "—"}</span>
        <span className="text-muted-foreground">Kolor:</span>
        <span>{data.color || "—"}</span>
        <span className="text-muted-foreground">Ilość:</span>
        <span className="font-medium">{data.quantity}</span>
      </div>
      {data.status && (
        <p className="text-xs">
          <span className="text-muted-foreground">Status: </span>
          <span className="font-medium">{data.status}</span>
        </p>
      )}
      <p className="mt-2 text-[9px] text-muted-foreground">PLANLUX PRODUKCJA PLANDEK – etykieta produkcyjna</p>
    </div>
  );
}
