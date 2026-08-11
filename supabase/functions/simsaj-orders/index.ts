import { createClient } from "npm:@supabase/supabase-js@2.112.2";

const expectedTokenHash = "dde91bf07269fe25b3a117928e69992207178ad09eca91d8a2078720b513eecd";

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

Deno.serve(async (request) => {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!token || !constantTimeEqual(await sha256(token), expectedTokenHash)) return json({ error: "Unauthorized" }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  const serviceKey = secretKeys ? JSON.parse(secretKeys).default : Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return json({ error: "Server configuration missing" }, 500);
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  if (request.method === "GET") {
    const { data, error } = await supabase.from("orders")
      .select("id,order_number,email,status,payment_status,grand_total,created_at,is_test,shipping_address,order_items(id,product_name,variant_name,quantity,line_total)")
      .order("created_at", { ascending: false })
      .limit(100);
    return error ? json({ error: "Orders unavailable" }, 503) : json({ orders: data ?? [] });
  }

  if (request.method === "POST") {
    let body: { email?: string; billingAddress?: unknown; shippingAddress?: unknown; items?: unknown };
    try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
    const { data, error } = await supabase.rpc("create_test_order", {
      p_email: body.email ?? "",
      p_billing_address: body.billingAddress,
      p_shipping_address: body.shippingAddress,
      p_items: body.items,
    });
    return error ? json({ error: "Order could not be created" }, 400) : json(data, 201);
  }

  return json({ error: "Method not allowed" }, 405);
});
