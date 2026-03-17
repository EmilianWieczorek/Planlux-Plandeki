"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { createClientAction } from "@/app/actions/clients";

const clientSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  client_type: z.enum(["company", "individual"]).optional(),
  tax_id: z.string().optional(),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Nieprawidłowy e-mail").optional().or(z.literal("")),
  street: z.string().optional(),
  postal_code: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional()
});

type ClientFormValues = z.infer<typeof clientSchema>;

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
const labelClass = "text-sm font-medium";

function mapCreateClientErrorToPl(e: unknown): string {
  const anyErr = e as any;
  const code: string | undefined = anyErr?.code;
  const message: string | undefined =
    typeof anyErr?.message === "string" ? anyErr.message : undefined;

  // Prefer code, but fall back to message heuristics (Server Actions sometimes lose structured fields).
  if (code === "42501" || (message && message.includes("row-level security policy"))) {
    return "Brak uprawnień do zapisu danych adresowych klienta.";
  }
  if (code === "23502" || (message && message.includes("violates not-null constraint"))) {
    return "Brakuje wymaganego pola w bazie danych klienta.";
  }
  if (code === "PGRST204" || (message && message.includes("PGRST204"))) {
    return "Aplikacja próbuje zapisać dane do niezgodnej struktury bazy.";
  }

  // Fallback: avoid showing raw error objects/payloads to the user.
  return "Nie udało się zapisać klienta. Spróbuj ponownie.";
}

export function ClientForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      client_type: "company",
      country: "Polska"
    }
  });

  async function onSubmit(values: ClientFormValues) {
    try {
      await createClientAction(
        {
          name: values.name,
          tax_id: values.tax_id || null,
          client_type: values.client_type ?? null,
          contact_person: values.contact_person || null,
          phone: values.phone || null,
          email: values.email || null,
          notes: values.notes || null
        },
        {
          type: "main",
          street: values.street || null,
          city: values.city || null,
          postal_code: values.postal_code || null,
          country: values.country || null
        }
      );
    } catch (e) {
      setError("root", {
        message: mapCreateClientErrorToPl(e)
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground">Dane podstawowe</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className={labelClass}>Typ klienta</label>
            <select className={inputClass} {...register("client_type")}>
              <option value="company">Firma</option>
              <option value="individual">Osoba prywatna</option>
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className={labelClass}>
              Nazwa klienta / nazwa firmy <span className="text-red-500">*</span>
            </label>
            <input className={inputClass} {...register("name")} placeholder="Nazwa" />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className={labelClass}>NIP</label>
            <input className={inputClass} {...register("tax_id")} placeholder="NIP" />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Osoba kontaktowa</label>
            <input className={inputClass} {...register("contact_person")} placeholder="Imię i nazwisko" />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Telefon</label>
            <input className={inputClass} {...register("phone")} type="tel" placeholder="+48 ..." />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>E-mail</label>
            <input className={inputClass} {...register("email")} type="email" placeholder="email@example.com" />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground">Adres</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label className={labelClass}>Ulica i numer</label>
            <input className={inputClass} {...register("street")} placeholder="Ulica, nr domu" />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Kod pocztowy</label>
            <input className={inputClass} {...register("postal_code")} placeholder="00-000" />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Miasto</label>
            <input className={inputClass} {...register("city")} placeholder="Miasto" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className={labelClass}>Kraj</label>
            <input className={inputClass} {...register("country")} placeholder="Polska" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground">Uwagi</h4>
        <div className="space-y-2">
          <label className={labelClass}>Uwagi</label>
          <textarea
            className={inputClass + " min-h-[80px]"}
            {...register("notes")}
            placeholder="Dodatkowe informacje"
          />
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
          {isSubmitting ? "Zapisywanie..." : "Zapisz klienta"}
        </button>
        <Link
          href="/clients"
          className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted"
        >
          Anuluj
        </Link>
      </div>
    </form>
  );
}
