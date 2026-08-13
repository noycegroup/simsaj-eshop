import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { getSupabaseEnvironment } from "./env";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  const { url, publishableKey } = getSupabaseEnvironment();
  browserClient ??= createBrowserClient<Database>(url, publishableKey);
  return browserClient;
}
