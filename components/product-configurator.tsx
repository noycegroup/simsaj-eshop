"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";

type Props = {
  product: {
    slug: string;
    name: string;
    model: string;
    image: string;
    price: number;
    sizes: string[];
    widths: { code: string; label: string }[];
    variants: { size: string; width: string; quantity: number; available: boolean }[];
  };
};

export function ProductConfigurator({ product }: Props) {
  const { addItem } = useCart();
  const firstAvailable = product.variants.find((variant) => variant.available);
  const [size, setSize] = useState(firstAvailable?.size ?? product.sizes[0]);
  const [width, setWidth] = useState(firstAvailable?.width ?? product.widths[0]?.code ?? "");
  const [added, setAdded] = useState(false);
  const selectedVariant = product.variants.find((variant) => variant.size === size && variant.width === width);
  const canAdd = Boolean(selectedVariant?.available && selectedVariant.quantity > 0);

  function selectSize(nextSize: string) {
    const currentWidthAvailable = product.variants.some((variant) => variant.size === nextSize && variant.width === width && variant.available);
    const nextAvailable = product.variants.find((variant) => variant.size === nextSize && variant.available);
    setSize(nextSize);
    if (!currentWidthAvailable) setWidth(nextAvailable?.width ?? "");
    setAdded(false);
  }

  function addToCart() {
    if (!canAdd) return;
    addItem({ slug: product.slug, name: product.name, model: product.model, image: product.image, price: product.price, size, width });
    setAdded(true);
  }

  return (
    <div className="product-configurator">
      <fieldset><legend>Vyberte veľkosť</legend><div className="choice-grid">{product.sizes.map((value) => { const available = product.variants.some((variant) => variant.size === value && variant.available); return <button className={`${size === value ? "selected " : ""}${available ? "" : "unavailable"}`.trim()} type="button" onClick={() => selectSize(value)} disabled={!available} aria-label={`${value}${available ? "" : " – nedostupné"}`} title={available ? undefined : "Táto veľkosť nie je dostupná"} key={value}>{value}</button>; })}</div></fieldset>
      {product.widths.length ? <fieldset><legend>Vyberte šírku</legend><div className="width-grid">{product.widths.map((value) => { const available = product.variants.some((variant) => variant.size === size && variant.width === value.code && variant.available); return <button className={`${width === value.code ? "selected " : ""}${available ? "" : "unavailable"}`.trim()} type="button" onClick={() => { setWidth(value.code); setAdded(false); }} disabled={!available} aria-label={`${value.label}${available ? "" : " – nedostupné pre veľkosť " + size}`} key={value.code}><span>{value.label}</span>{available ? null : <small>Nedostupné</small>}</button>; })}</div></fieldset> : null}
      {!canAdd ? <p className="variant-unavailable" role="status">Vybraná kombinácia veľkosti a šírky nie je momentálne dostupná a nie je možné ju pridať do košíka.</p> : <p className="variant-available" role="status">Variant je skladom.</p>}
      <button className="button primary add-cart-button" type="button" onClick={addToCart} disabled={!canAdd}>{canAdd ? "Pridať do skúšobného košíka" : "Variant nie je dostupný"}</button>
      {added ? <p className="added-message" role="status">Produkt bol pridaný. <Link href="/kosik">Prejsť do košíka →</Link></p> : null}
    </div>
  );
}
