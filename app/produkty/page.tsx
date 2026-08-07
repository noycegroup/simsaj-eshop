import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { diawinWorkingCatalog, formatWorkingPrice } from "@/lib/diawin-working-catalog";
import { CartLink } from "@/components/cart-link";

export const metadata: Metadata = {
  title: "Produkty Diawin | SIMSAJ",
  description: "Prvé modely zdravotnej obuvi Diawin pripravované pre SIMSAJ e-shop.",
};

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const firstValue = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = firstValue(params.q).trim().toLocaleLowerCase("sk");
  const series = firstValue(params.series);
  const size = firstValue(params.size);
  const width = firstValue(params.width);
  const sort = firstValue(params.sort) || "name";
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id,name,slug,short_description,brand")
    .eq("status", "active")
    .order("name");

  const filteredProducts = (products ?? [])
    .filter((product) => {
      const workingProduct = diawinWorkingCatalog[product.name];
      if (!workingProduct) return false;
      const searchable = `${product.name} ${product.brand ?? ""} ${product.short_description ?? ""} ${workingProduct.model}`.toLocaleLowerCase("sk");
      return (!query || searchable.includes(query))
        && (!series || workingProduct.model.startsWith(series))
        && (!size || workingProduct.sizes.includes(size))
        && (!width || workingProduct.widths.some((item) => item.code === width));
    })
    .sort((a, b) => {
      const first = diawinWorkingCatalog[a.name];
      const second = diawinWorkingCatalog[b.name];
      if (sort === "price-asc") return first.price - second.price;
      if (sort === "price-desc") return second.price - first.price;
      return a.name.localeCompare(b.name, "sk");
    });

  const activeFilters = Boolean(query || series || size || width || sort !== "name");

  return (
    <main className="catalog-page">
      <header className="catalog-header">
        <div className="catalog-toolbar"><Link href="/" className="catalog-back">← Späť na domov</Link><CartLink /></div>
        <p className="eyebrow">PRVÝ PARTNER · DIAWIN</p>
        <h1>Zdravotná obuv Diawin</h1>
        <p>Modely a skladové varianty sme načítali priamo z partnerského XML feedu. Uvedené ceny a fotografie sú zatiaľ orientačné a pred spustením predaja ich potvrdíme s partnerom.</p>
        <div className="catalog-notice" role="note">
          <strong>Pracovný katalóg</strong>
          <span>Ilustračné fotografie · orientačné ceny · nákup zatiaľ nie je aktívny</span>
        </div>
      </header>

      {error ? (
        <p className="catalog-message">Produkty sa momentálne nepodarilo načítať. Skúste to, prosím, neskôr.</p>
      ) : (
        <>
          <form className="catalog-filters" action="/produkty" method="get">
            <label className="catalog-search">Hľadať produkt
              <input name="q" type="search" defaultValue={firstValue(params.q)} placeholder="Názov alebo kód modelu" />
            </label>
            <label>Modelová rada
              <select name="series" defaultValue={series}>
                <option value="">Všetky rady</option><option value="AF">AF</option><option value="AM">AM</option><option value="FF">FF</option><option value="FM">FM</option><option value="TF">TF</option><option value="TM">TM</option>
              </select>
            </label>
            <label>Veľkosť
              <select name="size" defaultValue={size}>
                <option value="">Všetky veľkosti</option>{Array.from({ length: 15 }, (_, index) => String(index + 36)).map((item) => <option value={item} key={item}>{item}</option>)}
              </select>
            </label>
            <label>Šírka
              <select name="width" defaultValue={width}>
                <option value="">Všetky šírky</option><option value="1">M – stredná</option><option value="2">W – široká</option><option value="3">XW – extra široká</option>
              </select>
            </label>
            <label>Radenie
              <select name="sort" defaultValue={sort}>
                <option value="name">Podľa názvu</option><option value="price-asc">Cena od najnižšej</option><option value="price-desc">Cena od najvyššej</option>
              </select>
            </label>
            <button type="submit">Použiť filtre</button>
          </form>
          <div className="catalog-results" aria-live="polite">
            <strong>{filteredProducts.length} {filteredProducts.length === 1 ? "produkt" : filteredProducts.length > 1 && filteredProducts.length < 5 ? "produkty" : "produktov"}</strong>
            {activeFilters ? <Link href="/produkty">Zrušiť všetky filtre</Link> : null}
          </div>
          {filteredProducts.length === 0 ? <div className="catalog-empty"><h2>Nenašli sme zodpovedajúci produkt</h2><p>Skúste upraviť vyhľadávanie alebo odstrániť niektorý filter.</p><Link href="/produkty">Zobraziť celý katalóg</Link></div> : null}
        <section className="product-grid" aria-label="Produkty Diawin">
          {filteredProducts.map((product) => {
            const workingProduct = diawinWorkingCatalog[product.name];
            return (
              <article className="product-card" key={product.id}>
                {workingProduct ? (
                  <Link className="product-image" href={`/produkty/${product.slug}`}>
                    <Image src={workingProduct.image} alt={`${product.name} – ilustračná fotografia obuvi Diawin`} fill sizes="(max-width: 700px) 50vw, (max-width: 980px) 33vw, 25vw" unoptimized />
                    <span>Ilustračné foto</span>
                  </Link>
                ) : null}
                <div className="product-content">
                  <p>{product.brand} {workingProduct ? `· ${workingProduct.model}` : ""}</p>
                  <h2><Link href={`/produkty/${product.slug}`}>{product.name}</Link></h2>
                  {workingProduct ? (
                    <div className="product-price-row">
                      <strong>{formatWorkingPrice(workingProduct)}</strong>
                      <span>Orientačná cena</span>
                    </div>
                  ) : (
                    <span className="product-state">Cena sa pripravuje</span>
                  )}
                  <p className="product-description">{product.short_description}</p>
                  <Link className="product-detail-link" href={`/produkty/${product.slug}`}>Zobraziť detail →</Link>
                </div>
              </article>
            );
          })}
        </section>
        </>
      )}
    </main>
  );
}
