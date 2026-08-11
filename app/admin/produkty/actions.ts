"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

export async function updateProduct(formData: FormData) {
  const productId = text(formData, "product_id");
  const user = await requireChatGPTUser(`/admin/produkty/${productId}`);
  const status = text(formData, "status");
  const name = text(formData, "name");

  if (!productId || !name || !["draft", "active", "archived"].includes(status)) {
    redirect(`/admin/produkty/${productId}?error=validation`);
  }

  const { data: slug, error } = await createAdminClient().rpc("admin_update_product", {
    p_product_id: productId,
    p_name: name,
    p_short_description: text(formData, "short_description"),
    p_description: text(formData, "description"),
    p_seo_title: text(formData, "seo_title"),
    p_seo_description: text(formData, "seo_description"),
    p_status: status,
    p_actor_id: user.userId,
    p_actor_email: user.email,
  });

  if (error || !slug) redirect(`/admin/produkty/${productId}?error=save`);

  revalidatePath("/admin");
  revalidatePath(`/admin/produkty/${productId}`);
  revalidatePath("/produkty");
  revalidatePath(`/produkty/${slug}`);
  redirect(`/admin/produkty/${productId}?saved=1`);
}
