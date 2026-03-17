import { getServerSupabaseClient } from "@/lib/supabase/server";
import type { WarehouseDocumentListItem } from "@/types/db";

export async function getWarehouseDocuments(): Promise<WarehouseDocumentListItem[]> {
  const supabase = getServerSupabaseClient();
  const { data, error } = await supabase
    .from("v_warehouse_documents_list")
    .select("*")
    .order("issue_date", { ascending: false });

  if (error) {
    console.error("getWarehouseDocuments error", error);
    throw error;
  }

  return (data ?? []) as WarehouseDocumentListItem[];
}

export async function getWarehouseDocumentById(id: string) {
  const supabase = getServerSupabaseClient();

  const [{ data: header, error: headerError }, { data: items, error: itemsError }] =
    await Promise.all([
      supabase.from("warehouse_documents").select("*").eq("id", id).single(),
      supabase.from("warehouse_document_items").select("*").eq("document_id", id)
    ]);

  if (headerError) throw headerError;
  if (itemsError) throw itemsError;

  return {
    header,
    items: items ?? []
  };
}

