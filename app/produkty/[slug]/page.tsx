import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductConfigurator } from "@/components/product-configurator";
import { SiteHeader } from "@/components/site-header";
import { catalogSuggestions } from "@/lib/catalog-suggestions";
import { diawinWorkingCatalog, formatWorkingPrice } from "@/lib/diawin-working-catalog";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ slug: string }> };

async function getProduct(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("id,name,slug,short_description,description,brand,product_variants(price,size,stock_quantity,is_active,sku),product_images(storage_path,sort_order)").eq("slug", slug).eq("status", "active").maybeSingle();
  return data;
}

async function getSearchSuggestions() {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("name,slug,brand,product_variants(price),product_images(storage_path,sort_order)").eq("status", "active").order("name");
  return catalogSuggestions(data ?? []);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Produkt sa nenašiel | SIMSAJ" };
  const workingProduct = diawinWorkingCatalog[product.name];
  const image = workingProduct?.image ?? [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0]?.storage_path;
  return { title: `${product.name} | SIMSAJ`, description: product.short_description ?? undefined, openGraph: image ? { images: [image] } : undefined };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const [product, suggestions] = await Promise.all([getProduct(slug), getSearchSuggestions()]);
  if (!product) notFound();
  const workingProduct = diawinWorkingCatalog[product.name];
  const activeVariants = product.product_variants.filter((variant) => variant.is_active && variant.stock_quantity > 0);
  const image = workingProduct?.image ?? [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0]?.storage_path;
  const price = workingProduct?.price ?? Math.min(...activeVariants.map((variant) => variant.price));
  const sizes = workingProduct?.sizes ?? [...new Set(activeVariants.map((variant) => variant.size).filter((value): value is string => Boolean(value)))];
  const widths = workingProduct?.widths ?? [];
  const model = workingProduct?.model ?? "SVORTO";
  if (!image || !Number.isFinite(price) || !sizes.length) notFound();

  return (<>
    <SiteHeader suggestions={suggestions} />
    <main className="detail-page">
      <div className="detail-toolbar"><Link href="/produkty">← Všetky produkty</Link></div>
      <div className="detail-grid">
        <div className="detail-image"><Image src={image} alt={`${product.name} – produktová fotografia`} fill sizes="(max-width: 800px) 100vw, 50vw" unoptimized />{workingProduct ? <span>Ilustračné foto</span> : null}</div>
        <section className="detail-copy">
          <p className="eyebrow">{product.brand} · {model}</p>
          <h1>{product.name}</h1>
          <p className="detail-price">{workingProduct ? formatWorkingPrice(workingProduct) : new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" }).format(price)} <small>{workingProduct ? "orientačná cena" : "cena s DPH"}</small></p>
          <p className="detail-lead">{product.short_description}</p>
          <div className="detail-notice"><strong>Skúšobný nákupný tok</strong><span>{workingProduct ? "Cenu a dostupnosť ešte potvrdíme s partnerom." : "Cena, veľkosti a dostupnosť boli načítané z B2B feedu SVORTO."} Objednávka zatiaľ nebude odoslaná ani zaplatená.</span></div>
          <ProductConfigurator product={{ slug: product.slug, name: product.name, model, image, price, sizes, widths }} />
          <ul className="detail-benefits"><li>Varianty a dostupnosť načítané z partnerského feedu</li><li>Cena je uvedená vrátane DPH</li><li>Pred ostrým spustením prebehne obchodná kontrola sortimentu</li></ul>
        </section>
      </div>
    </main>
  </>);
}
