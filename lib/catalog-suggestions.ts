import type { CatalogSuggestion } from "@/components/catalog-filters";
import { diawinWorkingCatalog, formatWorkingPrice } from "@/lib/diawin-working-catalog";

type SuggestionProduct = { name: string; slug: string; brand: string | null; product_variants: { price: number }[]; product_images: { storage_path: string; sort_order: number }[] };
const money = new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" });

export function catalogSuggestions(products: SuggestionProduct[]): CatalogSuggestion[] {
  return products.flatMap((product) => {
    const working = diawinWorkingCatalog[product.name];
    const firstImage = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0]?.storage_path;
    const price = working?.price ?? Math.min(...product.product_variants.map((variant) => variant.price));
    const image = working?.image ?? firstImage;
    return image && Number.isFinite(price) ? [{ name: product.name, slug: product.slug, brand: product.brand, model: working?.model ?? "SVORTO", image, price: working ? formatWorkingPrice(working) : money.format(price) }] : [];
  });
}
