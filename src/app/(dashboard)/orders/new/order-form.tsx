"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { createOrderAction } from "@/app/actions/orders";
import type { Client } from "@/types/db";

const orderSchema = z.object({
  client_id: z.string().min(1, "Wybierz klienta"),
  order_date: z.string().min(1, "Data zamówienia jest wymagana"),
  due_date: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  description: z.string().min(1, "Opis pozycji jest wymagany"),
  quantity: z.coerce.number().min(0.001, "Ilość musi być większa od zera"),
  product_type: z.string().optional(),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  length: z.coerce.number().optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  notes_tech: z.string().optional()
});

type OrderFormValues = z.infer<typeof orderSchema>;

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
const labelClass = "text-sm font-medium";

export function OrderForm({ clients }: { clients: Client[] }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      order_date: new Date().toISOString().slice(0, 10),
      status: "new"
    }
  });

  async function onSubmit(values: OrderFormValues) {
    try {
      await createOrderAction(
        {
          client_id: values.client_id,
          order_date: values.order_date,
          due_date: values.due_date || null,
          status: values.status ?? "new",
          notes: values.notes || null
        },
        [
          {
            description: values.description,
            quantity: values.quantity,
            product_type: values.product_type || null,
            width: values.width ?? null,
            height: values.height ?? null,
            length: values.length ?? null,
            color: values.color || null,
            material: values.material || null,
            notes_tech: values.notes_tech || null
          }
        ]
      );
    } catch (e) {
      setError("root", {
        message: e instanceof Error ? e.message : "Nie udało się zapisać zamówienia."
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground">Nagłówek zamówienia</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label className={labelClass}>
              Klient <span className="text-red-500">*</span>
            </label>
            <select className={inputClass} {...register("client_id")}>
              <option value="">— Wybierz klienta —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || "-"}
                </option>
              ))}
            </select>
            {errors.client_id && (
              <p className="text-xs text-red-600">{errors.client_id.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Data zamówienia</label>
            <input className={inputClass} type="date" {...register("order_date")} />
            {errors.order_date && (
              <p className="text-xs text-red-600">{errors.order_date.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Termin realizacji</label>
            <input className={inputClass} type="date" {...register("due_date")} />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Status</label>
            <select className={inputClass} {...register("status")}>
              <option value="new">Nowe</option>
              <option value="confirmed">Potwierdzone</option>
              <option value="in_progress">W realizacji</option>
              <option value="completed">Zrealizowane</option>
              <option value="cancelled">Anulowane</option>
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className={labelClass}>Uwagi handlowe / produkcyjne</label>
            <textarea
              className={inputClass + " min-h-[60px]"}
              {...register("notes")}
              placeholder="Uwagi do zamówienia"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground">Pozycja zamówienia (produkt)</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label className={labelClass}>
              Opis / typ plandeki <span className="text-red-500">*</span>
            </label>
            <input
              className={inputClass}
              {...register("description")}
              placeholder="np. Plandeka standard, typ A"
            />
            {errors.description && (
              <p className="text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Typ produktu</label>
            <input className={inputClass} {...register("product_type")} placeholder="np. plandeka" />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>
              Ilość <span className="text-red-500">*</span>
            </label>
            <input
              className={inputClass}
              type="number"
              step="1"
              min="1"
              {...register("quantity")}
            />
            {errors.quantity && (
              <p className="text-xs text-red-600">{errors.quantity.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Szerokość (mm)</label>
            <input className={inputClass} type="number" step="1" {...register("width")} />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Wysokość (mm)</label>
            <input className={inputClass} type="number" step="1" {...register("height")} />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Długość (mm)</label>
            <input className={inputClass} type="number" step="1" {...register("length")} />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Kolor</label>
            <input className={inputClass} {...register("color")} placeholder="np. niebieski" />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Materiał</label>
            <input className={inputClass} {...register("material")} placeholder="np. PVC" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className={labelClass}>Uwagi technologiczne / dodatki</label>
            <textarea
              className={inputClass + " min-h-[60px]"}
              {...register("notes_tech")}
              placeholder="Dodatkowe wymagania"
            />
          </div>
        </div>
      </section>

      {errors.root && (
        <p className="text-sm text-red-600" role="alert">
          {errors.root.message}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-60"
        >
          {isSubmitting ? "Zapisywanie..." : "Zapisz zamówienie"}
        </button>
        <Link
          href="/orders"
          className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted"
        >
          Anuluj
        </Link>
      </div>
    </form>
  );
}
