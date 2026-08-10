"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";

const money = new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" });

export default function CartPage() {
  const { items, total, changeQuantity, removeItem } = useCart();
  return (<>
    <SiteHeader suggestions={[]} />
    <main className="flow-page">
      <div className="flow-toolbar"><Link href="/produkty">← Pokračovať v nákupe</Link><span>Skúšobný košík</span></div>
      <h1>Váš košík</h1>
      <p className="flow-intro">Košík slúži na overenie nákupného toku. Zatiaľ nevytvára záväznú objednávku.</p>
      {items.length === 0 ? <div className="empty-cart"><h2>Košík je prázdny</h2><Link className="button primary" href="/produkty">Vybrať produkty</Link></div> : (
        <div className="cart-layout"><section className="cart-list">{items.map((item) => <article className="cart-item" key={item.key}><div className="cart-thumb"><Image src={item.image} alt={item.name} fill sizes="120px" unoptimized /></div><div className="cart-item-info"><p>{item.model}</p><h2>{item.name}</h2><span>Veľkosť {item.size}{item.width ? ` · šírka ${item.width}` : ""}</span></div><label>Množstvo<input aria-label={`Množstvo ${item.name}`} min="1" max="9" type="number" value={item.quantity} onChange={(event) => changeQuantity(item.key, Number(event.target.value))} /></label><div className="cart-item-actions"><strong>{money.format(item.price * item.quantity)}</strong><button className="cart-remove-button" type="button" aria-label={`Odstrániť ${item.name} z košíka`} onClick={() => removeItem(item.key)}><b aria-hidden="true">×</b> Odstrániť</button></div></article>)}</section><aside className="cart-summary"><h2>Sumár</h2><div><span>Medzisúčet</span><strong>{money.format(total)}</strong></div><div><span>Doprava</span><span>Bude doplnená</span></div><div className="cart-total"><span>Spolu</span><strong>{money.format(total)}</strong></div><p>Objednávka je zatiaľ skúšobná.</p><Link className="button primary" href="/pokladna">Pokračovať do pokladne</Link></aside></div>
      )}
    </main>
  </>);
}
