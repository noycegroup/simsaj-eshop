import type { Metadata } from "next";
import Link from "next/link";
import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Objednávky | SIMSAJ administrácia", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" });
const dateTime = new Intl.DateTimeFormat("sk-SK", { dateStyle: "short", timeStyle: "short" });

export default async function AdminOrdersPage() {
  const user = await requireChatGPTUser("/admin/objednavky");
  const admin = createAdminClient();
  const { data: orders, error } = await admin.from("orders")
    .select("id,order_number,email,status,payment_status,grand_total,created_at,is_test,shipping_address,order_items(id,product_name,variant_name,quantity,line_total)")
    .order("created_at", { ascending: false })
    .limit(100);

  return <main className="admin-page">
    <header className="admin-header">
      <div><Link className="admin-brand" href="/">SIMSAJ</Link><span>Administrácia objednávok</span></div>
      <div className="admin-user"><span>{user.displayName}</span><a href={chatGPTSignOutPath("/")}>Odhlásiť</a></div>
    </header>
    <section className="admin-shell">
      <div className="admin-title"><div><p className="eyebrow">MÍĽNIK M4 · OBJEDNÁVKY</p><h1>Objednávky</h1><p>Bezpečný prehľad skúšobných objednávok bez spustenia platby a fakturácie.</p></div><Link className="button secondary" href="/admin">Produkty a feedy</Link></div>
      <section className="admin-panel">
        <div className="admin-panel-heading"><div><h2>Posledné objednávky</h2><p>Skúšobné záznamy sú viditeľne oddelené od budúcich ostrých objednávok.</p></div><span className="admin-history-count">Najviac 100 záznamov</span></div>
        {error ? <p className="admin-message">Objednávky sa nepodarilo načítať.</p> : orders?.length ? <div className="admin-table-wrap"><table className="admin-table admin-orders-table"><thead><tr><th>Objednávka</th><th>Zákazník</th><th>Položky</th><th>Stav</th><th>Spolu</th><th>Vytvorená</th></tr></thead><tbody>{orders.map((order) => {
          const address = order.shipping_address && typeof order.shipping_address === "object" && !Array.isArray(order.shipping_address) ? order.shipping_address as Record<string, unknown> : {};
          return <tr key={order.id}><td><strong>{order.order_number}</strong><small>{order.is_test ? "Skúšobná" : "Ostrá"}</small></td><td><strong>{String(address.name ?? "—")}</strong><small>{order.email}</small></td><td><strong>{order.order_items.reduce((sum, item) => sum + item.quantity, 0)} ks</strong><small>{order.order_items.map((item) => item.product_name).join(", ")}</small></td><td><span className={`admin-badge ${order.is_test ? "test" : "complete"}`}>{order.is_test ? "Bez platby" : order.status}</span></td><td><strong>{money.format(Number(order.grand_total))}</strong></td><td>{dateTime.format(new Date(order.created_at))}</td></tr>;
        })}</tbody></table></div> : <p className="admin-message">Zatiaľ nebola uložená žiadna objednávka. Skúšobnú vytvoríte cez košík a pokladňu.</p>}
      </section>
    </section>
  </main>;
}
