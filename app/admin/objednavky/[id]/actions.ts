"use server";

import { revalidatePath } from "next/cache";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { callOrdersService } from "@/lib/server/orders-service";

const allowedStatuses = new Set(["confirmed", "processing", "completed", "cancelled"]);

export async function updateOrderStatus(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(orderId) || !allowedStatuses.has(status)) throw new Error("Neplatná zmena stavu.");
  const user = await requireChatGPTUser(`/admin/objednavky/${orderId}`);
  await callOrdersService("PATCH", { orderId, status, actorId: user.userId, actorEmail: user.email });
  revalidatePath("/admin/objednavky");
  revalidatePath(`/admin/objednavky/${orderId}`);
}
