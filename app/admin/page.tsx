import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { createClient } from "@/lib/supabase/server";
import { diawinWorkingCatalog, formatWorkingPrice } from "@/lib/diawin-working-catalog";

export const metadata: Metadata = { title: "Administrácia | SIMSAJ", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type AdminPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const user = await requireChatGPTUser("/admin");
  const params = await searchParams;
  const rawQuery = first(params.q);
  const query = rawQuery.trim().toLocaleLowerCase("sk");
  const supabase = await createClient();
  const { data: products, error } = await supabase.from("products")
    .select("id,name,slug,brand,status,updated_at")
    .order("updated_at", { ascending: false });

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
      <div className="admin-title"><div><p className="eyebrow">MÍĽNIK M3 · KATALÓG</p><h1>Produkty a feedy</h1><p>Kontrola produktov pripravených z partnerských XML zdrojov.</p></div><Link className="button primary" href="/produkty">Otvoriť katalóg</Link></div>
      <div className="admin-stats">
        <article><span>Produkty</span><strong>{products?.length ?? 0}</strong><small>v databáze</small></article>
        <article><span>Pracovné podklady</span><strong>{readyCount}</strong><small>s cenou a fotografiou</small></article>
        <article><span>Partneri</span><strong>2</strong><small>Diawin a SVORTO</small></article>
        <article><span>Synchronizácia</span><strong className="admin-status-ready">Pripravená</strong><small>aktivácia po dodaní URL</small></article>
      </div>
      <section className="admin-panel">
        <div className="admin-panel-heading"><div><h2>Produktový katalóg</h2><p>Vyhľadávanie podľa názvu, značky alebo modelu.</p></div><form action="/admin"><label className="sr-only" htmlFor="admin-search">Hľadať produkt</label><input id="admin-search" name="q" type="search" defaultValue={rawQuery} placeholder="Názov alebo kód modelu" /><button type="submit">Hľadať</button></form></div>
        {error ? <p className="admin-message">Produkty sa nepodarilo načítať.</p> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Produkt</th><th>Model</th><th>Stav</th><th>Cena</th><th>Aktualizované</th><th /></tr></thead><tbody>
          {visibleProducts.map((product) => { const working = diawinWorkingCatalog[product.name]; return <tr key={product.id}>
            <td><span className="admin-product">{working ? <Image src={working.image} alt="" width={52} height={52} unoptimized /> : <i />}<span><strong>{product.name}</strong><small>{product.brand}</small></span></span></td>
            <td>{working?.model ?? "—"}</td><td><span className={`admin-badge ${working ? "complete" : "incomplete"}`}>{working ? "Pracovne pripravený" : "Chýbajú podklady"}</span></td>
            <td>{working ? formatWorkingPrice(working) : "—"}</td><td>{new Intl.DateTimeFormat("sk-SK").format(new Date(product.updated_at))}</td><td><Link href={`/produkty/${product.slug}`}>Detail →</Link></td>
          </tr>; })}
        </tbody></table>{visibleProducts.length === 0 ? <p className="admin-message">Pre toto vyhľadávanie sme nenašli produkt.</p> : null}</div>}
      </section>
      <section className="admin-panel admin-feed-panel"><div><p className="eyebrow">AUTOMATIZÁCIA</p><h2>Synchronizácia partnerov</h2><p>Importy Diawin a SVORTO kontrolujú identifikátory, preskakujú nezmenené feedy a zabraňujú súbežnému spusteniu.</p></div><ol><li><span>1</span>SVORTO: 160 produktov importovaných</li><li><span>2</span>SVORTO: 594 variantov a 881 fotografií</li><li><span>3</span>Denný plán pripravený na bezpečnú aktiváciu</li></ol></section>
    </section>
  </main>;
}
