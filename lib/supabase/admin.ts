import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Chýba serverová premenná prostredia ${name}.`);
  return value;
}

export function createAdminClient() {
  return createClient<Database>(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SECRET_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}
