import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { diawinWorkingCatalog, formatWorkingPrice } from "@/lib/diawin-working-catalog";

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
        <p>Modely a skladové varianty sme načítali priamo z partnerského XML feedu. Uvedené ceny a fotografie sú zatiaľ orientačné a pred spustením predaja ich potvrdíme s partnerom.</p>
        <div className="catalog-notice" role="note">
          <strong>Pracovný katalóg</strong>
          <span>Ilustračné fotografie · orientačné ceny · nákup zatiaľ nie je aktívny</span>
        </div>
      </header>

      {error ? (
        <p className="catalog-message">Produkty sa momentálne nepodarilo načítať. Skúste to, prosím, neskôr.</p>
      ) : (
        <section className="product-grid" aria-label="Produkty Diawin">
          {products?.map((product) => {
            const workingProduct = diawinWorkingCatalog[product.name];
            return (
              <article className="product-card" key={product.id}>
                {workingProduct ? (
                  <div className="product-image">
                    <Image src={workingProduct.image} alt={`${product.name} – ilustračná fotografia obuvi Diawin`} fill sizes="(max-width: 700px) 50vw, (max-width: 980px) 33vw, 25vw" />
                    <span>Ilustračné foto</span>
                  </div>
                ) : null}
                <div className="product-content">
                  <p>{product.brand} {workingProduct ? `· ${workingProduct.model}` : ""}</p>
                  <h2>{product.name}</h2>
                  {workingProduct ? (
                    <div className="product-price-row">
                      <strong>{formatWorkingPrice(workingProduct)}</strong>
                      <span>Orientačná cena</span>
                    </div>
                  ) : (
                    <span className="product-state">Cena sa pripravuje</span>
                  )}
                  <p className="product-description">{product.short_description}</p>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
