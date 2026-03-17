"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createOrder as createOrderRecord } from "@/services/orders";
import type { OrderCreatePayload, OrderItemCreatePayload } from "@/types/db";

export async function createOrderAction(
  payload: OrderCreatePayload,
  items: OrderItemCreatePayload[]
) {
  if (items.length === 0) {
    throw new Error("Zamówienie musi zawierać co najmniej jedną pozycję.");
  }
  const { id } = await createOrderRecord(payload, items);
  revalidatePath("/orders");
  revalidatePath("/orders/[id]", "page");
  revalidatePath("/dashboard");
  redirect(`/orders/${id}`);
}
