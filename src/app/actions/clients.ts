"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient as createClientRecord } from "@/services/clients";
import type { ClientCreatePayload, ClientAddressCreatePayload } from "@/types/db";

export async function createClientAction(
  payload: ClientCreatePayload,
  mainAddress?: ClientAddressCreatePayload | null
) {
  const { id } = await createClientRecord(payload, mainAddress);
  revalidatePath("/clients");
  revalidatePath("/clients/[id]", "page");
  redirect(`/clients/${id}`);
}
