import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

const CREATE_URL = "https://payments.comgate.cz/v1.0/create";
const STATUS_URL = "https://payments.comgate.cz/v1.0/status";
const VALID_STATUSES = new Set(["PENDING", "PAID", "CANCELLED", "AUTHORIZED"]);

type Address = { firstName?: string; lastName?: string; phone?: string; street?: string; city?: string; postalCode?: string; countryCode?: string };
type PaymentOrder = { id: string; order_number: string; email: string; grand_total: number; currency: string; billing_address: Json; shipping_address: Json; payment_method: string; payment_access_token_hash: string | null; comgate_trans_id: string | null };

function config() {
  const merchant = process.env.COMGATE_MERCHANT?.trim();
  const secret = process.env.COMGATE_SECRET?.trim();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (!merchant || !secret || !siteUrl) throw new Error("Comgate zatiaľ nie je nakonfigurované.");
  return { merchant, secret, siteUrl, test: process.env.COMGATE_TEST?.trim().toLowerCase() !== "false" };
}

function address(value: Json): Address {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Address : {};
}

async function post(url: string, values: Record<string, string>) {
  const response = await fetch(url, { method: "POST", headers: { Accept: "application/x-www-form-urlencoded", "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(values), cache: "no-store" });
  const data = Object.fromEntries(new URLSearchParams(await response.text()).entries());
  if (!response.ok || data.code !== "0") throw new Error(`Comgate API: ${data.message || `HTTP ${response.status}`}`);
  return data;
}

export function verifyPaymentAccessToken(token: string, expectedHash: string) {
  const actual = Buffer.from(createHash("sha256").update(token).digest("hex"), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createPaymentAccessToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: createHash("sha256").update(token).digest("hex") };
}

export async function loadPaymentOrder(orderId: string) {
  const { data, error } = await createAdminClient().from("orders").select("id,order_number,email,grand_total,currency,billing_address,shipping_address,payment_method,payment_access_token_hash,comgate_trans_id").eq("id", orderId).maybeSingle();
  if (error) throw error;
  return data as PaymentOrder | null;
}

export async function createComgatePayment(order: PaymentOrder) {
  if (order.payment_method !== "comgate") throw new Error("Objednávka nemá zvolenú platbu Comgate.");
  if (order.comgate_trans_id) throw new Error("Platba pre objednávku už existuje.");
  const settings = config();
  const billing = address(order.billing_address);
  const shipping = address(order.shipping_address);
  const result = await post(CREATE_URL, {
    merchant: settings.merchant, secret: settings.secret, test: String(settings.test), price: String(Math.round(Number(order.grand_total) * 100)), curr: order.currency || "EUR", label: `Obj. ${order.order_number}`.slice(0, 16), refId: order.order_number, method: "CARD_ALL", email: order.email, phone: billing.phone || shipping.phone || "", fullName: `${billing.firstName || ""} ${billing.lastName || ""}`.trim(), billingAddrCity: billing.city || "", billingAddrStreet: billing.street || "", billingAddrPostalCode: billing.postalCode || "", billingAddrCountry: billing.countryCode || "SK", delivery: "HOME_DELIVERY", homeDeliveryCity: shipping.city || billing.city || "", homeDeliveryStreet: shipping.street || billing.street || "", homeDeliveryPostalCode: shipping.postalCode || billing.postalCode || "", homeDeliveryCountry: shipping.countryCode || billing.countryCode || "SK", category: "PHYSICAL_GOODS_ONLY", lang: "sk", prepareOnly: "true", url_paid: `${settings.siteUrl}/platba/vysledok?status=paid&id=\${id}&refId=\${refId}`, url_cancelled: `${settings.siteUrl}/platba/vysledok?status=cancelled&id=\${id}&refId=\${refId}`, url_pending: `${settings.siteUrl}/platba/vysledok?status=pending&id=\${id}&refId=\${refId}`,
  });
  if (!result.transId || !result.redirect) throw new Error("Comgate nevrátilo identifikátor alebo adresu platby.");
  const { error } = await createAdminClient().from("orders").update({ comgate_trans_id: result.transId, comgate_redirect_url: result.redirect, payment_status: "pending", payment_status_updated_at: new Date().toISOString() }).eq("id", order.id).is("comgate_trans_id", null);
  if (error) throw error;
  return { transId: result.transId, redirect: result.redirect };
}

export async function readAndPersistComgateStatus(transId: string) {
  const settings = config();
  const status = await post(STATUS_URL, { merchant: settings.merchant, secret: settings.secret, transId });
  const { data: order, error } = await createAdminClient().from("orders").select("id,order_number,grand_total,currency,comgate_trans_id").eq("comgate_trans_id", transId).maybeSingle();
  if (error) throw error;
  if (!order) throw new Error("Transakcia nie je priradená k objednávke.");
  if (status.merchant !== settings.merchant || status.refId !== order.order_number || status.price !== String(Math.round(Number(order.grand_total) * 100)) || status.curr !== order.currency || status.transId !== transId) throw new Error("Údaje platby sa nezhodujú s objednávkou.");
  const normalized = status.status?.toUpperCase();
  if (!VALID_STATUSES.has(normalized)) throw new Error("Comgate vrátilo neznámy stav.");
  const paymentStatus = normalized === "PAID" ? "paid" : normalized === "CANCELLED" ? "cancelled" : normalized === "AUTHORIZED" ? "authorized" : "pending";
  const now = new Date().toISOString();
  const { error: updateError } = await createAdminClient().from("orders").update({ payment_status: paymentStatus, payment_paid_at: paymentStatus === "paid" ? now : null, payment_status_updated_at: now, comgate_last_status_response: status }).eq("id", order.id);
  if (updateError) throw updateError;
  return { orderNumber: order.order_number, paymentStatus };
}
