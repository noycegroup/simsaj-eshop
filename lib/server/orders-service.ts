function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Chýba serverová premenná prostredia ${name}.`);
  return value;
}

export async function callOrdersService<T>(method: "GET" | "POST", body?: unknown): Promise<T> {
  const supabaseUrl = required("NEXT_PUBLIC_SUPABASE_URL");
  const token = required("SIMSAJ_INTERNAL_ORDERS_TOKEN");
  const response = await fetch(`${supabaseUrl}/functions/v1/simsaj-orders`, {
    method,
    headers: { authorization: `Bearer ${token}`, ...(body === undefined ? {} : { "content-type": "application/json" }) },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const result = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(result.error ?? "Služba objednávok nie je dostupná.");
  return result;
}
