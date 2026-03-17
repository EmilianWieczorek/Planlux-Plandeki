import { getServerSupabaseClient } from "@/lib/supabase/server";
import type { LabelToPrint } from "@/types/db";

export async function getLabelsToPrint(): Promise<LabelToPrint[]> {
  const supabase = getServerSupabaseClient();
  const { data, error } = await supabase
    .from("v_labels_to_print")
    .select("*")
    .order("order_number", { ascending: true });

  if (error) {
    console.error("getLabelsToPrint error", error);
    throw error;
  }

  return (data ?? []) as LabelToPrint[];
}

