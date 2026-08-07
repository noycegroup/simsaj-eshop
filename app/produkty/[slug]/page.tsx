import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CartLink } from "@/components/cart-link";
import { ProductConfigurator } from "@/components/product-configurator";
import { diawinWorkingCatalog, formatWorkingPrice } from "@/lib/diawin-working-catalog";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ slug: string }> };

async function getProduct(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("id,name,slug,short_description,description,brand").eq("slug", slug).eq("status", "active").maybeSingle();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Produkt sa nenašiel | SIMSAJ" };
  const workingProduct = diawinWorkingCatalog[product.name];
  return { title: `${product.name} | SIMSAJ`, description: product.short_description ?? undefined, openGraph: workingProduct ? { images: [workingProduct.image] } : undefined };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const workingProduct = diawinWorkingCatalog[product.name];
  if (!workingProduct) notFound();

  return (
    <main className="detail-page">
      <div className="detail-toolbar"><Link href="/produkty">← Všetky produkty</Link><CartLink /></div>
      <div className="detail-grid">
        <div className="detail-image"><Image src={workingProduct.image} alt={`${product.name} – ilustračná fotografia obuvi Diawin`} fill sizes="(max-width: 800px) 100vw, 50vw" unoptimized /><span>Ilustračné foto</span></div>
        <section className="detail-copy">
          <p className="eyebrow">DIAWIN · {workingProduct.model}</p>
          <h1>{product.name}</h1>
          <p className="detail-price">{formatWorkingPrice(workingProduct)} <small>orientačná cena</small></p>
          <p className="detail-lead">{product.short_description}</p>
          <div className="detail-notice"><strong>Skúšobný nákupný tok</strong><span>Cenu a dostupnosť ešte potvrdíme s partnerom. Objednávka nebude odoslaná ani zaplatená.</span></div>
          <ProductConfigurator product={{ slug: product.slug, name: product.name, model: workingProduct.model, image: workingProduct.image, price: workingProduct.price, sizes: workingProduct.sizes, widths: workingProduct.widths }} />
          <ul className="detail-benefits"><li>Tri šírky pre lepšie prispôsobenie chodidlu</li><li>Priestor pre individuálnu ortopedickú vložku</li><li>Skladové varianty načítané z partnerského feedu</li></ul>
        </section>
      </div>
    </main>
  );
}
