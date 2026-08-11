import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callOrdersService } from "@/lib/server/orders-service";
import { diawinWorkingCatalog } from "@/lib/diawin-working-catalog";

export const runtime = "nodejs";

type SubmittedItem = {
  slug?: unknown;
  size?: unknown;
  width?: unknown;
  quantity?: unknown;
};

type SubmittedCustomer = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  street?: unknown;
  postal?: unknown;
  city?: unknown;
};

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: NextRequest) {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return NextResponse.json({ error: "Očakávali sme údaje objednávky." }, { status: 415 });
  }

  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.nextUrl.host) {
    return NextResponse.json({ error: "Požiadavka nepochádza z tejto stránky." }, { status: 403 });
  }

  let body: { customer?: SubmittedCustomer; items?: SubmittedItem[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Údaje objednávky nie sú platné." }, { status: 400 });
  }

  const customer = {
    name: clean(body.customer?.name, 160),
    email: clean(body.customer?.email, 254).toLowerCase(),
    phone: clean(body.customer?.phone, 40),
    street: clean(body.customer?.street, 180),
    postal: clean(body.customer?.postal, 20),
    city: clean(body.customer?.city, 100),
  };
  if (!customer.name || !customer.email.includes("@") || !customer.phone || !customer.street || !customer.postal || !customer.city) {
    return NextResponse.json({ error: "Doplňte všetky kontaktné a doručovacie údaje." }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 50) {
    return NextResponse.json({ error: "Košík je prázdny alebo obsahuje priveľa položiek." }, { status: 400 });
  }

  const requested = body.items.map((item) => ({
    slug: clean(item.slug, 180),
    size: clean(item.size, 40),
    width: clean(item.width, 40),
    quantity: Number(item.quantity),
  }));
  if (requested.some((item) => !item.slug || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99)) {
    return NextResponse.json({ error: "Niektorá položka košíka nie je platná." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: products, error: productsError } = await supabase.from("products")
    .select("id,name,slug,status,product_variants(id,name,size,sku,price,vat_rate,is_active)")
    .in("slug", [...new Set(requested.map((item) => item.slug))]);
  if (productsError) return NextResponse.json({ error: "Produkty sa nepodarilo overiť." }, { status: 503 });

  try {
    const normalizedItems = requested.map((item) => {
      const product = products?.find((candidate) => candidate.slug === item.slug && candidate.status === "active");
      if (!product) throw new Error("Produkt už nie je dostupný.");
      const variants = product.product_variants.filter((variant) => variant.is_active);
      const variant = variants.find((candidate) => candidate.size === item.size) ?? variants[0];
      if (!variant) throw new Error("Variant produktu už nie je dostupný.");
      const working = diawinWorkingCatalog[product.name];
      const unitPrice = working?.price ?? Number(variant.price);
      if (!Number.isFinite(unitPrice) || unitPrice < 0) throw new Error("Cena produktu nie je platná.");
      return {
        product_id: product.id,
        variant_id: variant.id,
        product_name: product.name,
        variant_name: [item.size && `Veľkosť ${item.size}`, item.width && `šírka ${item.width}`].filter(Boolean).join(" · ") || variant.name,
        sku: variant.sku,
        quantity: item.quantity,
        unit_price: unitPrice,
        vat_rate: Number(variant.vat_rate),
      };
    });
    const address = { name: customer.name, phone: customer.phone, street: customer.street, postal_code: customer.postal, city: customer.city, country: "SK" };
    const data = await callOrdersService<{ orderNumber: string; orderId: string; grandTotal: number }>("POST", {
      email: customer.email,
      billingAddress: address,
      shippingAddress: address,
      items: normalizedItems,
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message = error instanceof Error && error.message.length < 180 ? error.message : "Objednávku sa nepodarilo uložiť.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
