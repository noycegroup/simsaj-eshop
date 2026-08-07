import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { diawinWorkingCatalog, formatWorkingPrice } from "@/lib/diawin-working-catalog";
import { CartLink } from "@/components/cart-link";
import { CatalogFilters } from "@/components/catalog-filters";

export const metadata: Metadata = {
  title: "Produkty Diawin a SVORTO | SIMSAJ",
  description: "Zdravotná obuv Diawin, ortopedické vložky a pomôcky SVORTO v katalógu SIMSAJ.",
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
    .select("id,name,slug,short_description,brand,product_variants(price,size,stock_quantity,is_active,sku),product_images(storage_path,sort_order)")
    .eq("status", "active")
    .order("name");

  const filteredProducts = (products ?? [])
    .filter((product) => {
      const workingProduct = diawinWorkingCatalog[product.name];
      const model = workingProduct?.model ?? (product.brand === "SVORTO" ? "SVORTO" : "");
      const sizes = workingProduct?.sizes ?? product.product_variants.filter((variant) => variant.is_active).map((variant) => variant.size ?? "");
      const searchable = `${product.name} ${product.brand ?? ""} ${product.short_description ?? ""} ${model}`.toLocaleLowerCase("sk");
      return (!query || searchable.includes(query))
        && (!series || (series === "SVORTO" ? product.brand === "SVORTO" : workingProduct?.model.startsWith(series)))
        && (!size || sizes.includes(size))
        && (!width || workingProduct?.widths.some((item) => item.code === width));
    })
    .sort((a, b) => {
      const first = diawinWorkingCatalog[a.name];
      const second = diawinWorkingCatalog[b.name];
      const firstPrice = first?.price ?? Math.min(...a.product_variants.map((variant) => variant.price));
      const secondPrice = second?.price ?? Math.min(...b.product_variants.map((variant) => variant.price));
      if (sort === "price-asc") return firstPrice - secondPrice;
      if (sort === "price-desc") return secondPrice - firstPrice;
      return a.name.localeCompare(b.name, "sk");
    });

  const activeFilters = Boolean(query || series || size || width || sort !== "name");
  const suggestions = (products ?? []).flatMap((product) => {
    const workingProduct = diawinWorkingCatalog[product.name];
    const firstImage = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0]?.storage_path;
    const firstPrice = workingProduct?.price ?? Math.min(...product.product_variants.map((variant) => variant.price));
    const image = workingProduct?.image ?? firstImage;
    return image && Number.isFinite(firstPrice) ? [{ name: product.name, slug: product.slug, brand: product.brand, model: workingProduct?.model ?? "SVORTO", image, price: workingProduct ? formatWorkingPrice(workingProduct) : new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" }).format(firstPrice) }] : [];
  });

  return (
    <main className="catalog-page">
      <header className="catalog-header">
        <div className="catalog-toolbar"><Link href="/" className="catalog-back">← Späť na domov</Link><CartLink /></div>
        <p className="eyebrow">PARTNERI · DIAWIN · SVORTO</p>
        <h1>Produkty pre zdravé chodidlá</h1>
        <p>Obuv, ortopedické vložky a pomôcky načítavame priamo z partnerských XML feedov. Produkty SVORTO obsahujú dodané ceny a fotografie; pri Diawin zostávajú pracovné podklady orientačné.</p>
        <div className="catalog-notice" role="note">
          <strong>Pracovný katalóg</strong>
          <span>Nákup zatiaľ nie je aktívny · podklady pred spustením obchodne skontrolujeme</span>
        </div>
      </header>

      {error ? (
        <p className="catalog-message">Produkty sa momentálne nepodarilo načítať. Skúste to, prosím, neskôr.</p>
      ) : (
        <>
          <CatalogFilters suggestions={suggestions} initialQuery={firstValue(params.q)} initialSeries={series} initialSize={size} initialWidth={width} initialSort={sort} />
          <div className="catalog-results" aria-live="polite">
            <strong>{filteredProducts.length} {filteredProducts.length === 1 ? "produkt" : filteredProducts.length > 1 && filteredProducts.length < 5 ? "produkty" : "produktov"}</strong>
            {activeFilters ? <Link href="/produkty">Zrušiť všetky filtre</Link> : null}
          </div>
          {filteredProducts.length === 0 ? <div className="catalog-empty"><h2>Nenašli sme zodpovedajúci produkt</h2><p>Skúste upraviť vyhľadávanie alebo odstrániť niektorý filter.</p><Link href="/produkty">Zobraziť celý katalóg</Link></div> : null}
        <section className="product-grid" aria-label="Produkty Diawin a SVORTO">
          {filteredProducts.map((product) => {
            const workingProduct = diawinWorkingCatalog[product.name];
            const firstImage = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0]?.storage_path;
            const image = workingProduct?.image ?? firstImage;
            const price = workingProduct?.price ?? Math.min(...product.product_variants.map((variant) => variant.price));
            const model = workingProduct?.model ?? "SVORTO";
            return (
              <article className="product-card" key={product.id}>
                {image ? (
                  <Link className="product-image" href={`/produkty/${product.slug}`}>
                    <Image src={image} alt={`${product.name} – produktová fotografia`} fill sizes="(max-width: 700px) 50vw, (max-width: 980px) 33vw, 25vw" unoptimized />
                    {workingProduct ? <span>Ilustračné foto</span> : null}
                  </Link>
                ) : null}
                <div className="product-content">
                  <p>{product.brand} · {model}</p>
                  <h2><Link href={`/produkty/${product.slug}`}>{product.name}</Link></h2>
                  {Number.isFinite(price) ? (
                    <div className="product-price-row">
                      <strong>{workingProduct ? formatWorkingPrice(workingProduct) : new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" }).format(price)}</strong>
                      <span>{workingProduct ? "Orientačná cena" : "Cena s DPH"}</span>
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
