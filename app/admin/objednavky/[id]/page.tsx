import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { callOrdersService } from "@/lib/server/orders-service";
import type { Json } from "@/lib/supabase/database.types";
import { updateOrderShipping, updateOrderStatus } from "./actions";

export const metadata: Metadata = { title: "Detail objednávky | SIMSAJ", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };
type Item = { id: string; product_name: string; variant_name: string | null; sku: string; quantity: number; unit_price: number; line_total: number; vat_rate: number };
type Order = { id: string; order_number: string; email: string; status: string; payment_status: string; payment_method: string; grand_total: number; subtotal: number; shipping_total: number; discount_total: number; tax_total: number; currency: string; created_at: string; placed_at: string | null; is_test: boolean; shipping_method: string; shipping_carrier: string | null; tracking_number: string | null; shipped_at: string | null; packeta_point_id: string | null; packeta_point_name: string | null; packeta_point_place: string | null; packeta_point_city: string | null; packeta_point_zip: string | null; shipping_address: Json; billing_address: Json; customer_note: string | null; order_items: Item[] };
type Audit = { id: string; action: string; actor_email: string; changes: Json; created_at: string };

const money = new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" });
const dateTime = new Intl.DateTimeFormat("sk-SK", { dateStyle: "medium", timeStyle: "short" });
const statusLabels: Record<string, string> = { pending: "Čaká na potvrdenie", confirmed: "Potvrdená", processing: "Spracováva sa", completed: "Dokončená", cancelled: "Stornovaná" };
const carrierLabels: Record<string, string> = { personal_pickup: "Osobný odber – SIMSAJ Partizánske", packeta: "Packeta", sps: "SPS", gls: "GLS", slovak_post: "Slovenská pošta" };
const nextStatuses: Record<string, { value: string; label: string; danger?: boolean }[]> = {
  pending: [{ value: "confirmed", label: "Potvrdiť objednávku" }, { value: "cancelled", label: "Stornovať", danger: true }],
  confirmed: [{ value: "processing", label: "Začať spracovanie" }, { value: "cancelled", label: "Stornovať", danger: true }],
  processing: [{ value: "completed", label: "Označiť ako dokončenú" }, { value: "cancelled", label: "Stornovať", danger: true }],
};

function address(value: Json) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  await requireChatGPTUser(`/admin/objednavky/${id}`);
  let result: { order: Order; audit: Audit[] };
  try { result = await callOrdersService("GET", undefined, `?id=${encodeURIComponent(id)}`); }
  catch { notFound(); }
  const { order, audit } = result!;
  const shipping = address(order.shipping_address);
  const actions = order.is_test ? nextStatuses[order.status] ?? [] : [];

  return <main className="admin-page"><header className="admin-header"><div><Link className="admin-brand" href="/">SIMSAJ</Link><span>Detail objednávky</span></div><Link href="/admin/objednavky">← Všetky objednávky</Link></header><section className="admin-shell order-detail-shell">
    <div className="admin-title"><div><p className="eyebrow">{order.is_test ? "SKÚŠOBNÁ OBJEDNÁVKA" : "OBJEDNÁVKA"}</p><h1>{order.order_number}</h1><p>Vytvorená {dateTime.format(new Date(order.created_at))}</p></div><div className="order-state"><span>Stav</span><strong>{statusLabels[order.status] ?? order.status}</strong><small>Platba: {order.payment_status === "not_required" ? "nevyžaduje sa" : order.payment_status}</small></div></div>
    <div className="order-detail-grid"><section className="admin-panel"><div className="admin-panel-heading"><div><h2>Položky objednávky</h2><p>{order.order_items.reduce((sum, item) => sum + item.quantity, 0)} kusov</p></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Produkt</th><th>Variant</th><th>Množstvo</th><th>Cena</th><th>Spolu</th></tr></thead><tbody>{order.order_items.map((item) => <tr key={item.id}><td><strong>{item.product_name}</strong><small>{item.sku}</small></td><td>{item.variant_name ?? "—"}</td><td>{item.quantity}</td><td>{money.format(Number(item.unit_price))}</td><td><strong>{money.format(Number(item.line_total))}</strong></td></tr>)}</tbody></table></div><div className="order-totals"><span>Medzisúčet <strong>{money.format(Number(order.subtotal))}</strong></span><span>Doprava <strong>{money.format(Number(order.shipping_total))}</strong></span><span className="total">Spolu <strong>{money.format(Number(order.grand_total))}</strong></span></div></section>
      <aside className="order-detail-sidebar"><section className="admin-panel order-contact"><h2>Zákazník</h2><strong>{String(shipping.name ?? "—")}</strong><a href={`mailto:${order.email}`}>{order.email}</a><a href={`tel:${String(shipping.phone ?? "")}`}>{String(shipping.phone ?? "—")}</a><p>{String(shipping.street ?? "")}<br />{String(shipping.postal_code ?? "")} {String(shipping.city ?? "")}<br />{String(shipping.country ?? "SK")}</p></section>{order.packeta_point_id ? <section className="admin-panel order-contact"><h2>Výdajné miesto Packety</h2><strong>{order.packeta_point_name}</strong><p>{order.packeta_point_place}<br />{order.packeta_point_zip} {order.packeta_point_city}<br />ID: {order.packeta_point_id}</p></section> : null}<section className="admin-panel order-shipping"><h2>Doprava</h2><form action={updateOrderShipping}><input type="hidden" name="orderId" value={order.id} /><label>Dopravca<select name="carrier" defaultValue={order.shipping_carrier ?? order.shipping_method}><option value="personal_pickup">Osobný odber</option><option value="packeta">Packeta</option><option value="sps">SPS</option><option value="gls">GLS</option><option value="slovak_post">Slovenská pošta</option></select></label><label>Sledovacie číslo<input name="trackingNumber" defaultValue={order.tracking_number ?? ""} maxLength={100} placeholder="Pri osobnom odbere nechajte prázdne" /></label><button type="submit">Uložiť dopravu</button></form>{order.shipping_carrier ? <small>Aktuálne: {carrierLabels[order.shipping_carrier]}{order.tracking_number ? ` · ${order.tracking_number}` : ""}</small> : null}</section><section className="admin-panel order-actions"><h2>Zmena stavu</h2>{actions.length ? actions.map((action) => <form action={updateOrderStatus} key={action.value}><input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="status" value={action.value} /><button className={action.danger ? "danger" : "primary"} type="submit">{action.label}</button></form>) : <p>Pre tento stav nie sú dostupné ďalšie zmeny.</p>}<small>Zmeny sa ukladajú do auditnej histórie.</small></section></aside>
    </div>
    <section className="admin-panel order-timeline"><div className="admin-panel-heading"><div><h2>História objednávky</h2><p>Nemenná stopa administrátorských zmien.</p></div></div><ol><li><span>Objednávka vytvorená</span><small>{dateTime.format(new Date(order.created_at))}</small></li>{audit.map((entry) => { const changes = address(entry.changes); if (entry.action === "order_shipping_changed") { const carrier = address(changes.shipping_carrier as Json); const tracking = address(changes.tracking_number as Json); return <li key={entry.id}><span>Doprava: {carrierLabels[String(carrier.to)] ?? String(carrier.to)}{tracking.to ? ` · ${String(tracking.to)}` : ""}</span><small>{dateTime.format(new Date(entry.created_at))} · {entry.actor_email}</small></li>; } const status = address(changes.status as Json); return <li key={entry.id}><span>Stav zmenený: {statusLabels[String(status.from)] ?? String(status.from)} → {statusLabels[String(status.to)] ?? String(status.to)}</span><small>{dateTime.format(new Date(entry.created_at))} · {entry.actor_email}</small></li>; })}</ol></section>
  </section></main>;
}
