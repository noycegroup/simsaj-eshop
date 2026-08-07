"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";

const money = new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" });

export default function CheckoutPage() {
  const { items, total } = useCart();
  const [confirmed, setConfirmed] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setConfirmed(true); }
  if (!items.length) return <main className="flow-page"><Link href="/produkty">← Späť na produkty</Link><div className="empty-cart"><h1>Najprv vložte produkt do košíka</h1><Link className="button primary" href="/produkty">Vybrať produkty</Link></div></main>;
  if (confirmed) return <main className="flow-page"><div className="checkout-success"><span>✓</span><h1>Skúšobný tok je dokončený</h1><p>Žiadna objednávka nebola odoslaná a platba neprebehla. Formulár nám potvrdil, že prechod od produktu po pokladňu funguje.</p><Link className="button primary" href="/produkty">Späť na produkty</Link></div></main>;
  return <main className="flow-page"><div className="flow-toolbar"><Link href="/kosik">← Späť do košíka</Link><span>Skúšobná pokladňa</span></div><h1>Kontaktné a doručovacie údaje</h1><div className="checkout-layout"><form className="checkout-form" onSubmit={submit}><div className="form-grid"><label>Meno a priezvisko<input name="name" autoComplete="name" required /></label><label>E-mail<input name="email" type="email" autoComplete="email" required /></label><label>Telefón<input name="phone" type="tel" autoComplete="tel" required /></label><label>Ulica a číslo<input name="street" autoComplete="street-address" required /></label><label>PSČ<input name="postal" inputMode="numeric" autoComplete="postal-code" required /></label><label>Mesto<input name="city" autoComplete="address-level2" required /></label></div><fieldset><legend>Doprava</legend><label className="radio-row"><input type="radio" name="shipping" defaultChecked /> Osobný odber – SIMSAJ Partizánske</label><label className="radio-row"><input type="radio" name="shipping" /> Kuriér – pripravujeme</label></fieldset><fieldset><legend>Platba</legend><label className="radio-row"><input type="radio" name="payment" defaultChecked /> Testovací režim – bez platby</label></fieldset><label className="consent"><input type="checkbox" required /> Rozumiem, že ide o nezáväznú skúšku pokladne.</label><button className="button primary" type="submit">Dokončiť skúšobný tok</button></form><aside className="checkout-summary"><h2>Objednávka</h2>{items.map((item) => <div key={item.key}><span>{item.quantity}× {item.name}<small>{item.size} / {item.width}</small></span><strong>{money.format(item.price * item.quantity)}</strong></div>)}<div className="cart-total"><span>Spolu</span><strong>{money.format(total)}</strong></div><p>Orientačné ceny, bez záväznej objednávky.</p></aside></div></main>;
}
