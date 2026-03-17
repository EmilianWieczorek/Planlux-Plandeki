import { getServerSupabaseClient } from "@/lib/supabase/server";
import type {
  OrderListItem,
  OrderAttachment,
  OrderCreatePayload,
  OrderItemCreatePayload
} from "@/types/db";

export async function getOrdersList(): Promise<OrderListItem[]> {
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from("v_orders_list")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getOrdersList error", error);
    throw error;
  }

  return (data ?? []) as OrderListItem[];
}

export async function getOrderById(id: string) {
  const supabase = getServerSupabaseClient();

  const [{ data: order, error: orderError }, { data: items, error: itemsError }, { data: statusHistory, error: statusError }, { data: attachments, error: attachmentsError }] =
    await Promise.all([
      supabase.from("orders").select("*").eq("id", id).single(),
      supabase.from("order_items").select("*").eq("order_id", id),
      supabase
        .from("order_status_history")
        .select("*")
        .eq("order_id", id)
        .order("changed_at", { ascending: true }),
      supabase
        .from("v_order_attachments")
        .select("*")
        .eq("order_id", id)
        .order("created_at", { ascending: true })
    ]);

  if (orderError) throw orderError;
  if (itemsError) throw itemsError;
  if (statusError) throw statusError;
  if (attachmentsError) throw attachmentsError;

  return {
    order,
    items: items ?? [],
    statusHistory: statusHistory ?? [],
    attachments: (attachments ?? []) as OrderAttachment[]
  };
}

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ZL-${y}${m}${d}-${r}`;
}

/** Create order and order items. */
export async function createOrder(
  payload: OrderCreatePayload,
  items: OrderItemCreatePayload[]
): Promise<{ id: string }> {
  const supabase = getServerSupabaseClient();
  const orderNumber = payload.order_number ?? generateOrderNumber();
  const orderRow: Record<string, unknown> = {
    client_id: payload.client_id,
    order_number: orderNumber,
    due_date: payload.due_date ?? null,
    status: payload.status ?? "new"
  };
  if (payload.order_date) orderRow.order_date = payload.order_date;
  if (payload.notes != null) orderRow.notes = payload.notes;
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert(orderRow)
    .select("id")
    .single();
  if (orderError) {
    console.error("createOrder error", orderError);
    throw orderError;
  }
  const orderId = orderData?.id as string;
  if (items.length > 0) {
    const rows = items.map((item) => {
      const row: Record<string, unknown> = {
        order_id: orderId,
        description: item.description,
        quantity: item.quantity
      };
      if (item.product_type != null) row.product_type = item.product_type;
      if (item.width != null) row.width = item.width;
      if (item.height != null) row.height = item.height;
      if (item.length != null) row.length = item.length;
      if (item.color != null) row.color = item.color;
      if (item.material != null) row.material = item.material;
      if (item.notes_tech != null) row.notes_tech = item.notes_tech;
      return row;
    });
    const { error: itemsError } = await supabase.from("order_items").insert(rows);
    if (itemsError) {
      console.error("createOrder items error", itemsError);
      throw itemsError;
    }
  }
  return { id: orderId };
}

