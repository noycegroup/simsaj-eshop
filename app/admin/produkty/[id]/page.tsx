import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateProduct } from "../actions";

export const metadata: Metadata = { title: "Úprava produktu | SIMSAJ", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function AdminProductPage({ params, searchParams }: Props) {
  const { id } = await params;
  await requireChatGPTUser(`/admin/produkty/${id}`);
  const query = await searchParams;
  const admin = createAdminClient();
  const [{ data: product }, { data: override }] = await Promise.all([
    admin.from("products").select("id,name,slug,brand,status,short_description,description,seo_title,seo_description,updated_at,product_images(storage_path,sort_order),product_variants(sku,size,price,stock_quantity,is_active)").eq("id", id).maybeSingle(),
    admin.from("product_manual_overrides").select("locked_fields,updated_at").eq("product_id", id).maybeSingle(),
  ]);

  if (!product) notFound();
  const image = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0]?.storage_path;
  const activeVariants = product.product_variants.filter((variant) => variant.is_active);
  const price = Math.min(...activeVariants.map((variant) => variant.price));

  return <main className="admin-page">
    <header className="admin-header"><div><Link className="admin-brand" href="/">SIMSAJ</Link><span>Úprava produktu</span></div><Link href="/admin">← Späť na produkty</Link></header>
    <section className="admin-shell admin-edit-shell">
      <div className="admin-edit-heading"><div><p className="eyebrow">{product.brand} · REDAKCIA</p><h1>{product.name}</h1><p>Ručne uložené texty a stav zostanú chránené pred prepísaním XML feedom.</p></div><Link href={`/produkty/${product.slug}`}>Zobraziť v katalógu →</Link></div>
      {first(query.saved) === "1" ? <p className="admin-alert success" role="status">Produkt bol uložený a auditná stopa zaznamenaná.</p> : null}
      {first(query.error) ? <p className="admin-alert error" role="alert">Produkt sa nepodarilo uložiť. Skontrolujte vyplnené údaje.</p> : null}
      <div className="admin-edit-layout">
        <aside className="admin-product-preview">{image ? <div><Image src={image} alt={product.name} fill sizes="300px" unoptimized /></div> : <div className="admin-preview-placeholder">Bez fotografie</div>}<dl><div><dt>Varianty</dt><dd>{product.product_variants.length}</dd></div><div><dt>Skladom</dt><dd>{activeVariants.reduce((sum, variant) => sum + variant.stock_quantity, 0)} ks</dd></div><div><dt>Cena od</dt><dd>{Number.isFinite(price) ? new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" }).format(price) : "—"}</dd></div></dl>{override ? <p className="admin-lock-note">Ručná ochrana je aktívna od {new Intl.DateTimeFormat("sk-SK").format(new Date(override.updated_at))}.</p> : null}</aside>
        <form className="admin-edit-form" action={updateProduct}>
          <input type="hidden" name="product_id" value={product.id} />
          <div className="admin-form-grid"><label>Názov produktu<input name="name" defaultValue={product.name} maxLength={180} required /></label><label>Publikačný stav<select name="status" defaultValue={product.status}><option value="draft">Koncept – skrytý</option><option value="active">Aktívny – zverejnený</option><option value="archived">Archivovaný – skrytý</option></select></label></div>
          <label>Krátky popis<textarea name="short_description" rows={3} defaultValue={product.short_description ?? ""} /></label>
          <label>Úplný popis<textarea name="description" rows={8} defaultValue={product.description ?? ""} /></label>
          <fieldset><legend>SEO údaje</legend><label>SEO titulok<input name="seo_title" defaultValue={product.seo_title ?? ""} maxLength={180} /></label><label>SEO popis<textarea name="seo_description" rows={3} defaultValue={product.seo_description ?? ""} maxLength={320} /></label></fieldset>
          <div className="admin-form-actions"><Link href="/admin">Zrušiť</Link><button className="button primary" type="submit">Uložiť produkt</button></div>
        </form>
      </div>
    </section>
  </main>;
}
