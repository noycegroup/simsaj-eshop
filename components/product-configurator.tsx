"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";

type Props = {
  product: { slug: string; name: string; model: string; image: string; price: number; sizes: string[]; widths: { code: string; label: string }[] };
};

export function ProductConfigurator({ product }: Props) {
  const { addItem } = useCart();
  const [size, setSize] = useState(product.sizes[0]);
  const [width, setWidth] = useState(product.widths[0].code);
  const [added, setAdded] = useState(false);

  function addToCart() {
    addItem({ slug: product.slug, name: product.name, model: product.model, image: product.image, price: product.price, size, width });
    setAdded(true);
  }

  return (
    <div className="product-configurator">
      <fieldset><legend>Vyberte veľkosť</legend><div className="choice-grid">{product.sizes.map((value) => <button className={size === value ? "selected" : ""} type="button" onClick={() => setSize(value)} key={value}>{value}</button>)}</div></fieldset>
      <fieldset><legend>Vyberte šírku</legend><div className="width-grid">{product.widths.map((value) => <button className={width === value.code ? "selected" : ""} type="button" onClick={() => setWidth(value.code)} key={value.code}>{value.label}</button>)}</div></fieldset>
      <button className="button primary add-cart-button" type="button" onClick={addToCart}>Pridať do skúšobného košíka</button>
      {added ? <p className="added-message" role="status">Produkt bol pridaný. <Link href="/kosik">Prejsť do košíka →</Link></p> : null}
    </div>
  );
}
