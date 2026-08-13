import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { diawinWorkingCatalog } from "@/lib/diawin-working-catalog";
import type { Database } from "@/lib/supabase/database.types";

export const metadata: Metadata = { title: "Administrácia | SIMSAJ", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type AdminPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };
type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  status: string;
  updated_at: string;
  model: string | null;
  image_url: string | null;
  customer_price: number | null;
  purchase_price: number | null;
};
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const user = await requireChatGPTUser("/admin");
  const params = await searchParams;
  const rawQuery = first(params.q);
  const query = rawQuery.trim().toLocaleLowerCase("sk");
  const supabase = await createClient();
  const publicResult = await supabase.from("products")
    .select("id,name,slug,brand,status,updated_at,product_images(storage_path,sort_order),product_variants(price)")
    .order("updated_at", { ascending: false });
  let products: AdminProduct[] = (publicResult.data ?? []).map((product) => ({
    id: product.id, name: product.name, slug: product.slug, brand: product.brand, status: product.status, updated_at: product.updated_at,
    model: null as string | null,
    image_url: [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0]?.storage_path ?? null,
    customer_price: Math.min(...product.product_variants.map((variant) => variant.price)),
    purchase_price: null as number | null,
  }));
  let error = publicResult.error;
  let importHistory: Database["public"]["Views"]["admin_feed_import_history"]["Row"][] = [];
  if (process.env.SUPABASE_SECRET_KEY) {
    const adminClient = createAdminClient();
    const [privateResult, historyResult] = await Promise.all([
      adminClient.from("admin_product_feed_catalog").select("*").order("updated_at", { ascending: false }),
      adminClient.from("admin_feed_import_history").select("*").order("started_at", { ascending: false }).limit(10),
    ]);
    if (!privateResult.error && privateResult.data) products = privateResult.data;
    else error = privateResult.error;
    if (!historyResult.error && historyResult.data) importHistory = historyResult.data;
  }

  const visibleProducts = (products ?? []).filter((product) => {
    const working = diawinWorkingCatalog[product.name];
    return !query || `${product.name} ${product.brand ?? ""} ${working?.model ?? ""}`.toLocaleLowerCase("sk").includes(query);
  });
  const readyCount = products?.length ?? 0;

  return <main className="admin-page">
    <header className="admin-header">
      <div><Link className="admin-brand" href="/">SIMSAJ</Link><span>Administrácia katalógu</span></div>
      <div className="admin-user"><span>{user.displayName}</span><a href={chatGPTSignOutPath("/")}>Odhlásiť</a></div>
    </header>
    <section className="admin-shell">
      <div className="admin-title"><div><p className="eyebrow">MÍĽNIK M3 · KATALÓG</p><h1>Produkty a feedy</h1><p>Kontrola produktov pripravených z partnerských XML zdrojov.</p></div><div className="admin-title-actions"><Link className="button secondary" href="/admin/objednavky">Objednávky</Link><Link className="button primary" href="/produkty">Otvoriť katalóg</Link></div></div>
      <div className="admin-stats">
        <article><span>Produkty</span><strong>{products?.length ?? 0}</strong><small>v databáze</small></article>
        <article><span>Pracovné podklady</span><strong>{readyCount}</strong><small>s cenou a fotografiou</small></article>
        <article><span>Partneri</span><strong>2</strong><small>Diawin a SVORTO</small></article>
        <article><span>Synchronizácia</span><strong className="admin-status-ready">Manuálna</strong><small>pravidelný plán je vypnutý</small></article>
      </div>
      <section className="admin-panel">
        <div className="admin-panel-heading"><div><h2>Produktový katalóg</h2><p>Vyhľadávanie podľa názvu, značky alebo modelu.</p></div><form action="/admin"><label className="sr-only" htmlFor="admin-search">Hľadať produkt</label><input id="admin-search" name="q" type="search" defaultValue={rawQuery} placeholder="Názov alebo kód modelu" /><button type="submit">Hľadať</button></form></div>
        {error ? <p className="admin-message">Produkty sa nepodarilo načítať.</p> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Produkt</th><th>Model</th><th>Stav</th><th>Konečná cena</th><th>Nákupná cena</th><th>Aktualizované</th><th /></tr></thead><tbody>
          {visibleProducts.map((product) => { const working = diawinWorkingCatalog[product.name]; const image = working?.image ?? product.image_url; const customerPrice = working?.price ?? Number(product.customer_price); const complete = Boolean(image && Number.isFinite(customerPrice)); return <tr key={product.id}>
            <td><span className="admin-product">{image ? <Image src={image} alt="" width={52} height={52} unoptimized /> : <i />}<span><strong>{product.name}</strong><small>{product.brand}</small></span></span></td>
            <td>{working?.model ?? product.model ?? "—"}</td><td><span className={`admin-badge ${complete ? "complete" : "incomplete"}`}>{complete ? "Pripravený" : "Chýbajú podklady"}</span></td>
            <td>{Number.isFinite(customerPrice) ? new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" }).format(customerPrice) : "—"}</td><td>{product.purchase_price != null ? new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" }).format(Number(product.purchase_price)) : "Chránená"}</td><td>{new Intl.DateTimeFormat("sk-SK").format(new Date(product.updated_at))}</td><td><Link href={`/admin/produkty/${product.id}`}>Upraviť →</Link></td>
          </tr>; })}
        </tbody></table>{visibleProducts.length === 0 ? <p className="admin-message">Pre toto vyhľadávanie sme nenašli produkt.</p> : null}</div>}
      </section>
      <section className="admin-panel admin-feed-history">
        <div className="admin-panel-heading"><div><p className="eyebrow">AUTOMATIZÁCIA</p><h2>História importov partnerov</h2><p>Skutočné výsledky posledných behov XML synchronizácie.</p></div><span className="admin-history-count">Posledných {importHistory.length} behov</span></div>
        {importHistory.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Partner</th><th>Stav</th><th>Produkty</th><th>Varianty</th><th>Chyby</th><th>Trvanie</th><th>Spustené</th><th>Poznámka</th></tr></thead><tbody>{importHistory.map((run) => <tr key={run.id}>
          <td><strong>{run.supplier_name}</strong></td><td><span className={`admin-badge ${run.status === "succeeded" ? "complete" : "incomplete"}`}>{run.status === "succeeded" ? "Úspešný" : run.status === "running" ? "Prebieha" : "Chyba"}</span></td><td>{run.product_count}</td><td>{run.variant_count}</td><td>{run.error_count}</td><td>{run.duration_seconds == null ? "—" : `${run.duration_seconds} s`}</td><td>{new Intl.DateTimeFormat("sk-SK", { dateStyle: "short", timeStyle: "short" }).format(new Date(run.started_at))}</td><td className="admin-run-note">{run.notes ?? "—"}</td>
        </tr>)}</tbody></table></div> : <p className="admin-message">História importov bude dostupná po pripojení serverového prístupu k databáze.</p>}
      </section>
    </section>
  </main>;
}
