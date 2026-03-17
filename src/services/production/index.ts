import { getServerSupabaseClient } from "@/lib/supabase/server";
import type { ProductionQueueItem } from "@/types/db";

/** Map raw view row to ProductionQueueItem. v_production_queue may not expose id; use index for key when absent. */
function mapProductionQueueRow(row: Record<string, unknown>, index: number): ProductionQueueItem {
  const plannedStart =
    (row.planned_start as string) ??
    (row.planned_start_date as string) ??
    (row.scheduled_start as string) ??
    (row.start_date as string) ??
    null;
  const plannedEnd =
    (row.planned_end as string) ??
    (row.planned_end_date as string) ??
    (row.scheduled_end as string) ??
    (row.end_date as string) ??
    null;
  const orderId = (row.order_id as string) ?? "";
  const orderNumber = (row.order_number as string) ?? "";
  const taskType = (row.task_type as string) ?? "";
  return {
    id: (row.id as string) ?? `task-${index}`,
    order_id: orderId,
    order_number: orderNumber,
    task_type: taskType,
    status: (row.status as string) ?? "",
    planned_start: plannedStart,
    planned_end: plannedEnd
  };
}

export async function getProductionQueue(): Promise<ProductionQueueItem[]> {
  const supabase = getServerSupabaseClient();
  const { data, error } = await supabase
    .from("v_production_queue")
    .select("*");

  if (error) {
    console.error("getProductionQueue error", error);
    throw error;
  }

  return ((data ?? []) as Record<string, unknown>[]).map((row, i) =>
    mapProductionQueueRow(row, i)
  );
}

