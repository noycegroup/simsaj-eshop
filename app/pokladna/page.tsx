"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";

const money = new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" });

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/objednavky/skusobna", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customer: { name: form.get("name"), email: form.get("email"), phone: form.get("phone"), street: form.get("street"), postal: form.get("postal"), city: form.get("city") },
          items: items.map(({ slug, size, width, quantity }) => ({ slug, size, width, quantity })),
        }),
      });
      const result = await response.json() as { orderNumber?: string; error?: string };
      if (!response.ok || !result.orderNumber) throw new Error(result.error ?? "Objednávku sa nepodarilo uložiť.");
      setOrderNumber(result.orderNumber);
      clear();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Objednávku sa nepodarilo uložiť.");
    } finally {
      setSubmitting(false);
    }
  }
  let content: React.ReactNode;
  if (!items.length) content = <main className="flow-page"><Link href="/produkty">← Späť na produkty</Link><div className="empty-cart"><h1>Najprv vložte produkt do košíka</h1><Link className="button primary" href="/produkty">Vybrať produkty</Link></div></main>;
  else if (orderNumber) content = <main className="flow-page"><div className="checkout-success"><span>✓</span><p className="eyebrow">SKÚŠOBNÁ OBJEDNÁVKA {orderNumber}</p><h1>Objednávka bola bezpečne uložená</h1><p>Ide o nezáväzný test. Platba, fakturácia ani expedícia neboli spustené.</p><Link className="button primary" href="/produkty">Späť na produkty</Link></div></main>;
  else content = <main className="flow-page"><div className="flow-toolbar"><Link href="/kosik">← Späť do košíka</Link><span>Skúšobná pokladňa</span></div><h1>Kontaktné a doručovacie údaje</h1><div className="checkout-layout"><form className="checkout-form" onSubmit={submit}><div className="form-grid"><label>Meno a priezvisko<input name="name" autoComplete="name" required /></label><label>E-mail<input name="email" type="email" autoComplete="email" required /></label><label>Telefón<input name="phone" type="tel" autoComplete="tel" required /></label><label>Ulica a číslo<input name="street" autoComplete="street-address" required /></label><label>PSČ<input name="postal" inputMode="numeric" autoComplete="postal-code" required /></label><label>Mesto<input name="city" autoComplete="address-level2" required /></label></div><fieldset><legend>Doprava</legend><label className="radio-row"><input type="radio" name="shipping" defaultChecked /> Osobný odber – SIMSAJ Partizánske</label><label className="radio-row"><input type="radio" name="shipping" disabled /> Kuriér – pripravujeme</label></fieldset><fieldset><legend>Platba</legend><label className="radio-row"><input type="radio" name="payment" defaultChecked /> Testovací režim – bez platby</label></fieldset><label className="consent"><input type="checkbox" required /> Rozumiem, že ide o nezáväznú skúšobnú objednávku.</label>{error ? <p className="checkout-error" role="alert">{error}</p> : null}<button className="button primary" type="submit" disabled={submitting}>{submitting ? "Ukladám objednávku…" : "Uložiť skúšobnú objednávku"}</button></form><aside className="checkout-summary"><h2>Objednávka</h2>{items.map((item) => <div key={item.key}><span>{item.quantity}× {item.name}<small>{item.size} / {item.width}</small></span><strong>{money.format(item.price * item.quantity)}</strong></div>)}<div className="cart-total"><span>Spolu</span><strong>{money.format(total)}</strong></div><p>Orientačné ceny, bez záväznej objednávky.</p></aside></div></main>;
  return <><SiteHeader suggestions={[]} />{content}</>;
}
