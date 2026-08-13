import { createClient } from "npm:@supabase/supabase-js@2.112.2";

const expectedTokenHash = "bdb8eef24fb73e7daa665e7d3cca09c6b10bb3dd6d521bc7909aa7f522dd1515";

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

  if (request.method === "GET" && new URL(request.url).searchParams.get("id")) {
    const orderId = new URL(request.url).searchParams.get("id") ?? "";
    const [{ data: order, error }, { data: audit }] = await Promise.all([
      supabase.from("orders")
        .select("id,order_number,email,status,payment_status,payment_method,grand_total,subtotal,shipping_total,discount_total,tax_total,currency,created_at,placed_at,is_test,shipping_method,shipping_carrier,tracking_number,shipped_at,packeta_point_id,packeta_point_name,packeta_point_place,packeta_point_city,packeta_point_zip,shipping_address,billing_address,customer_note,order_items(id,product_name,variant_name,sku,quantity,unit_price,line_total,vat_rate),order_email_notifications(id,audience,recipient_email,subject,body_text,status,attempt_count,last_error,sent_at,created_at)")
        .eq("id", orderId).maybeSingle(),
      supabase.from("admin_audit_log").select("id,action,actor_email,changes,created_at").eq("entity_type", "order").eq("entity_id", orderId).order("created_at", { ascending: false }),
    ]);
    if (error) return json({ error: "Order unavailable" }, 503);
    return order ? json({ order, audit: audit ?? [] }) : json({ error: "Order not found" }, 404);
  }

  if (request.method === "GET") {
    const { data, error } = await supabase.from("orders")
      .select("id,order_number,email,status,payment_status,grand_total,created_at,is_test,shipping_address,order_items(id,product_name,variant_name,quantity,line_total)")
      .order("created_at", { ascending: false })
      .limit(100);
    return error ? json({ error: "Orders unavailable" }, 503) : json({ orders: data ?? [] });
  }

  if (request.method === "POST") {
    let body: { email?: string; billingAddress?: unknown; shippingAddress?: unknown; shippingMethod?: string; packetaPoint?: unknown; items?: unknown };
    try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
    const { data, error } = await supabase.rpc("create_test_order", {
      p_email: body.email ?? "",
      p_billing_address: body.billingAddress,
      p_shipping_address: body.shippingAddress,
      p_shipping_method: body.shippingMethod ?? "personal_pickup",
      p_packeta_point: body.packetaPoint ?? null,
      p_items: body.items,
    });
    return error ? json({ error: "Order could not be created" }, 400) : json(data, 201);
  }

  if (request.method === "PATCH") {
    let body: { operation?: string; orderId?: string; status?: string; carrier?: string; trackingNumber?: string; actorId?: string; actorEmail?: string };
    try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
    if (!body.orderId || !body.actorId || !body.actorEmail) return json({ error: "Missing fields" }, 400);
    if (body.operation === "shipping") {
      if (!body.carrier) return json({ error: "Missing fields" }, 400);
      const { data, error } = await supabase.rpc("admin_update_order_shipping", {
        p_order_id: body.orderId,
        p_shipping_carrier: body.carrier,
        p_tracking_number: body.trackingNumber ?? "",
        p_actor_id: body.actorId,
        p_actor_email: body.actorEmail,
      });
      return error ? json({ error: "Shipping update is not allowed" }, 409) : json({ ok: true, shipping: data });
    }
    if (!body.status) return json({ error: "Missing fields" }, 400);
    const { data: status, error } = await supabase.rpc("admin_update_order_status", {
      p_order_id: body.orderId,
      p_status: body.status,
      p_actor_id: body.actorId,
      p_actor_email: body.actorEmail,
    });
    return error ? json({ error: "Status transition is not allowed" }, 409) : json({ ok: true, status });
  }

  return json({ error: "Method not allowed" }, 405);
});
