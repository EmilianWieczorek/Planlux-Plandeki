import { getServerSupabaseClient } from "@/lib/supabase/server";
import type {
  Client,
  ClientAddress,
  ClientCreatePayload,
  ClientAddressCreatePayload
} from "@/types/db";

/** Map raw client row to Client; DB may use company_name, client_name, or name. */
function mapClientRow(row: Record<string, unknown>): Client {
  const name =
    (row.company_name as string) ||
    (row.client_name as string) ||
    (row.name as string) ||
    "";
  return {
    id: row.id as string,
    name,
    tax_id: (row.tax_id as string) ?? null,
    created_at: (row.created_at as string) ?? "",
    client_type: (row.client_type as string) ?? null,
    contact_person: (row.contact_person as string) ?? null,
    phone: (row.phone as string) ?? null,
    email: (row.email as string) ?? null,
    notes: (row.notes as string) ?? null
  };
}

export async function getClients(): Promise<Client[]> {
  const supabase = getServerSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getClients error", error);
    throw error;
  }

  return ((data ?? []) as Record<string, unknown>[]).map(mapClientRow);
}

export async function getClientById(
  id: string
): Promise<{ client: Client; addresses: ClientAddress[] }> {
  const supabase = getServerSupabaseClient();

  const [{ data: client, error: clientError }, { data: addresses, error: addressesError }] =
    await Promise.all([
      supabase.from("clients").select("*").eq("id", id).single(),
      supabase.from("client_addresses").select("*").eq("client_id", id)
    ]);

  if (clientError) throw clientError;
  if (addressesError) throw addressesError;
  if (!client) throw new Error("Client not found");

  return {
    client: mapClientRow(client as Record<string, unknown>),
    addresses: (addresses ?? []) as ClientAddress[]
  };
}

/** Name column in DB (use "client_name" if PGRST204 for company_name). Minimal insert until schema is extended. */
const CLIENTS_NAME_COLUMN = "company_name";
const DEFAULT_CLIENT_TYPE = "company" as const;

/** Insert client and optional main address. Only safe columns are written; extra form fields are UI-only for now. */
export async function createClient(
  payload: ClientCreatePayload,
  mainAddress?: ClientAddressCreatePayload | null
): Promise<{ id: string }> {
  const supabase = getServerSupabaseClient();

  // Keep this payload strictly aligned with confirmed schema.
  const row: Record<string, unknown> = {
    [CLIENTS_NAME_COLUMN]: payload.name,
    type: payload.client_type ?? DEFAULT_CLIENT_TYPE
  };

  const { data, error } = await supabase.from("clients").insert(row).select("id").single();
  if (error) {
    console.error("createClient error", {
      code: (error as any).code,
      message: (error as any).message,
      details: (error as any).details,
      hint: (error as any).hint,
      insert_payload: row
    });
    throw error;
  }
  const clientId = data?.id as string;
  if (clientId && mainAddress && (mainAddress.street || mainAddress.city || mainAddress.postal_code || mainAddress.country)) {
    const addressRow = {
      client_id: clientId,
      type: mainAddress.type ?? "main",
      street: mainAddress.street ?? null,
      city: mainAddress.city ?? null,
      postal_code: mainAddress.postal_code ?? null,
      country: mainAddress.country ?? null
    };
    const { error: addressError } = await supabase.from("client_addresses").insert(addressRow);
    if (addressError) {
      console.error("createClient address insert error", {
        code: (addressError as any).code,
        message: (addressError as any).message,
        details: (addressError as any).details,
        hint: (addressError as any).hint,
        insert_payload: addressRow
      });

      // Best-effort compensating delete to reduce partial-write risk.
      // This is not atomic; if DELETE is blocked by RLS/grants, we log and still throw the address error.
      try {
        const { error: deleteError } = await supabase
          .from("clients")
          .delete()
          .eq("id", clientId);
        if (deleteError) {
          console.error("createClient compensating delete failed", {
            code: (deleteError as any).code,
            message: (deleteError as any).message,
            details: (deleteError as any).details,
            hint: (deleteError as any).hint,
            client_id: clientId
          });
        } else {
          console.log("createClient compensating delete succeeded", clientId);
        }
      } catch (e: any) {
        console.error("createClient compensating delete threw", {
          message: e?.message ?? String(e),
          client_id: clientId
        });
      }

      throw addressError;
    }
  }
  return { id: clientId };
}

