"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/app/chatgpt-auth";

function safeReturnPath(value: FormDataEntryValue | null) {
  const path = typeof value === "string" ? value : "/admin";
  return path.startsWith("/") && !path.startsWith("//") ? path : "/admin";
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const returnTo = safeReturnPath(formData.get("return_to"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) redirect(`/prihlasenie?chyba=prihlasenie&return_to=${encodeURIComponent(returnTo)}`);
  if (!isAdminUser(email, data.user.app_metadata)) {
    await supabase.auth.signOut();
    redirect(`/prihlasenie?chyba=opravnenie&return_to=${encodeURIComponent(returnTo)}`);
  }
  redirect(returnTo);
}
