import type { Metadata } from "next";
import Link from "next/link";
import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { callOrdersService } from "@/lib/server/orders-service";
import type { Json } from "@/lib/supabase/database.types";
import { SiteHeader } from "@/components/site-header";
import { AdminToolbar } from "@/components/admin-toolbar";

export const metadata: Metadata = { title: "Objednávky | SIMSAJ administrácia", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" });
const dateTime = new Intl.DateTimeFormat("sk-SK", { dateStyle: "short", timeStyle: "short" });

export default async function AdminOrdersPage() {
  const user = await requireChatGPTUser("/admin/objednavky");
  type Order = { id: string; order_number: string; email: string; status: string; payment_status: string; grand_total: number; created_at: string; is_test: boolean; shipping_address: Json; order_items: { id: string; product_name: string; variant_name: string | null; quantity: number; line_total: number }[] };
  let orders: Order[] = [];
  let loadFailed = false;
  try {
    const result = await callOrdersService<{ orders: Order[] }>("GET");
    orders = result.orders ?? [];
  } catch (error) {
    loadFailed = true;
    console.error("[admin/orders] loading failed", error instanceof Error ? error.message : String(error));
  }

  return <><SiteHeader suggestions={[]} /><main className="admin-page">
    <AdminToolbar label="Administrácia objednávok" userName={user.displayName} signOutHref={chatGPTSignOutPath("/")} />
    <section className="admin-shell">
      <div className="admin-title"><div><p className="eyebrow">MÍĽNIK M4 · OBJEDNÁVKY</p><h1>Objednávky</h1><p>Bezpečný prehľad skúšobných objednávok bez spustenia platby a fakturácie.</p></div><Link className="button secondary" href="/admin">Produkty a feedy</Link></div>
      <section className="admin-panel">
        <div className="admin-panel-heading"><div><h2>Posledné objednávky</h2><p>Skúšobné záznamy sú viditeľne oddelené od budúcich ostrých objednávok.</p></div><span className="admin-history-count">Najviac 100 záznamov</span></div>
        {loadFailed ? <p className="admin-message">Objednávky sa momentálne nepodarilo načítať. Skúste stránku obnoviť.</p> : orders.length ? <div className="admin-table-wrap"><table className="admin-table admin-orders-table"><thead><tr><th>Objednávka</th><th>Zákazník</th><th>Položky</th><th>Stav</th><th>Spolu</th><th>Vytvorená</th></tr></thead><tbody>{orders.map((order) => {
          const address = order.shipping_address && typeof order.shipping_address === "object" && !Array.isArray(order.shipping_address) ? order.shipping_address as Record<string, unknown> : {};
          return <tr key={order.id}><td><Link href={`/admin/objednavky/${order.id}`}><strong>{order.order_number}</strong></Link><small>{order.is_test ? "Skúšobná" : "Ostrá"}</small></td><td><strong>{String(address.name ?? "—")}</strong><small>{order.email}</small></td><td><strong>{order.order_items.reduce((sum, item) => sum + item.quantity, 0)} ks</strong><small>{order.order_items.map((item) => item.product_name).join(", ")}</small></td><td><span className={`admin-badge ${order.is_test ? "test" : "complete"}`}>{order.is_test ? "Bez platby" : order.status}</span></td><td><strong>{money.format(Number(order.grand_total))}</strong></td><td>{dateTime.format(new Date(order.created_at))}</td></tr>;
        })}</tbody></table></div> : <p className="admin-message">Zatiaľ nebola uložená žiadna objednávka. Skúšobnú vytvoríte cez košík a pokladňu.</p>}
      </section>
    </section>
  </main></>;
}
