import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Produkty Diawin | SIMSAJ",
  description: "Prvé modely zdravotnej obuvi Diawin pripravované pre SIMSAJ e-shop.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id,name,slug,short_description,brand")
    .eq("status", "active")
    .order("name");

  return (
    <main className="catalog-page">
      <header className="catalog-header">
        <Link href="/" className="catalog-back">← Späť na domov</Link>
        <p className="eyebrow">PRVÝ PARTNER · DIAWIN</p>
        <h1>Zdravotná obuv Diawin</h1>
        <p>Modely a skladové varianty sme načítali priamo z partnerského XML feedu. Pred spustením predaja ešte doplníme ceny a oficiálne produktové fotografie.</p>
      </header>

      {error ? (
        <p className="catalog-message">Produkty sa momentálne nepodarilo načítať. Skúste to, prosím, neskôr.</p>
      ) : (
        <section className="product-grid" aria-label="Produkty Diawin">
          {products?.map((product, index) => (
            <article className="product-card" key={product.id}>
              <div className={`product-placeholder product-placeholder-${(index % 4) + 1}`} aria-hidden="true">
                <span>{product.name.slice(0, 1)}</span>
                <small>DIAWIN</small>
              </div>
              <div className="product-content">
                <p>{product.brand}</p>
                <h2>{product.name}</h2>
                <span className="product-state">Cena a fotografie sa pripravujú</span>
                <p className="product-description">{product.short_description}</p>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
