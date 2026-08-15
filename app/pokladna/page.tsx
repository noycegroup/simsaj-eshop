"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useCart } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";

const money = new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" });
type Shipping = "personal_pickup" | "packeta" | "gls";
type PacketaPoint = { id: number; name: string; place: string; city: string; zip: string; country: string };

declare global {
  interface Window {
    Packeta?: { Widget: { pick: (apiKey: string, callback: (point: PacketaPoint | null) => void, options?: Record<string, unknown>) => void } };
  }
}

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shipping, setShipping] = useState<Shipping>("personal_pickup");
  const [packetaPoint, setPacketaPoint] = useState<PacketaPoint | null>(null);
  const [packetaReady, setPacketaReady] = useState(false);
  const [packetaError, setPacketaError] = useState("");

  function openPacketa() {
    const apiKey = process.env.NEXT_PUBLIC_PACKETA_API_KEY?.trim();
    if (!apiKey) { setPacketaError("Výber výdajného miesta čaká na aktiváciu SIMSAJ Packeta kľúča."); return; }
    if (!window.Packeta?.Widget) { setPacketaError("Mapa Packety sa ešte načítava. Skúste to o chvíľu."); return; }
    setPacketaError("");
    window.Packeta.Widget.pick(apiKey, (point) => { if (point) { setPacketaPoint(point); setPacketaError(""); } }, { country: "sk", language: "sk", vendors: [{ country: "sk", group: "packeta" }] });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (shipping === "packeta" && !packetaPoint) { setPacketaError("Pred pokračovaním vyberte výdajné miesto alebo Z-BOX."); return; }
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/objednavky/skusobna", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customer: { name: form.get("name"), email: form.get("email"), phone: form.get("phone"), street: form.get("street"), postal: form.get("postal"), city: form.get("city") },
          shipping,
          packetaPoint: shipping === "packeta" ? packetaPoint : null,
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
  if (orderNumber) content = <main className="flow-page"><div className="checkout-success"><span>✓</span><p className="eyebrow">SKÚŠOBNÁ OBJEDNÁVKA {orderNumber}</p><h1>Objednávka bola bezpečne uložená</h1><p>Ide o nezáväzný test. Platba, fakturácia ani expedícia neboli spustené.</p><Link className="button primary" href="/produkty">Späť na produkty</Link></div></main>;
  else if (!items.length) content = <main className="flow-page"><Link href="/produkty">← Späť na produkty</Link><div className="empty-cart"><h1>Najprv vložte produkt do košíka</h1><Link className="button primary" href="/produkty">Vybrať produkty</Link></div></main>;
  else content = <main className="flow-page"><div className="flow-toolbar"><Link href="/kosik">← Späť do košíka</Link><span>Skúšobná pokladňa</span></div><h1>Kontaktné a doručovacie údaje</h1><div className="checkout-layout"><form className="checkout-form" onSubmit={submit}><div className="form-grid"><label>Meno a priezvisko<input name="name" autoComplete="name" required /></label><label>E-mail<input name="email" type="email" autoComplete="email" required /></label><label>Telefón<input name="phone" type="tel" autoComplete="tel" required /></label><label>Ulica a číslo<input name="street" autoComplete="street-address" required /></label><label>PSČ<input name="postal" inputMode="numeric" autoComplete="postal-code" required /></label><label>Mesto<input name="city" autoComplete="address-level2" required /></label></div><fieldset><legend>Doprava</legend><div className="checkout-shipping-options"><label className={shipping === "personal_pickup" ? "selected" : ""}><input type="radio" name="shipping" value="personal_pickup" checked={shipping === "personal_pickup"} onChange={() => setShipping("personal_pickup")} /><span><strong>Osobný odber v kamennej predajni</strong><small>SIMSAJ, 17. novembra 1300, Partizánske</small></span><em>Zdarma</em></label><label className={shipping === "packeta" ? "selected" : ""}><input type="radio" name="shipping" value="packeta" checked={shipping === "packeta"} onChange={() => setShipping("packeta")} /><span><strong>Packeta – výdajné miesto alebo Z-BOX</strong><small>Výber dostupného miesta na mape Packety</small></span><em>Test</em></label><label className={shipping === "gls" ? "selected" : ""}><input type="radio" name="shipping" value="gls" checked={shipping === "gls"} onChange={() => setShipping("gls")} /><span><strong>Kuriér GLS na adresu</strong><small>Doručenie na uvedenú adresu zákazníka</small></span><em>Test</em></label></div>{shipping === "packeta" ? <div className={`packeta-selector${packetaError ? " has-error" : ""}`}><div>{packetaPoint ? <><strong>{packetaPoint.name}</strong><small>{packetaPoint.place}, {packetaPoint.zip} {packetaPoint.city}</small></> : <><strong>Výdajné miesto nie je vybrané</strong><small>Vyberte pobočku alebo Z-BOX.</small></>}</div><button type="button" onClick={openPacketa}>{packetaPoint ? "Zmeniť miesto" : packetaReady ? "Vybrať miesto" : "Otvoriť mapu Packety"}</button>{packetaError ? <p role="alert">{packetaError}</p> : null}</div> : null}</fieldset><fieldset><legend>Platba</legend><label className="radio-row"><input type="radio" name="payment" defaultChecked /> Testovací režim – bez platby</label></fieldset><label className="consent"><input type="checkbox" required /> Rozumiem, že ide o nezáväznú skúšobnú objednávku.</label>{error ? <p className="checkout-error" role="alert">{error}</p> : null}<button className="button primary" type="submit" disabled={submitting}>{submitting ? "Ukladám objednávku…" : "Uložiť skúšobnú objednávku"}</button></form><aside className="checkout-summary"><h2>Objednávka</h2>{items.map((item) => <div key={item.key}><span>{item.quantity}× {item.name}<small>{item.size} / {item.width}</small></span><strong>{money.format(item.price * item.quantity)}</strong></div>)}<div className="cart-total"><span>Spolu</span><strong>{money.format(total)}</strong></div><p>Orientačné ceny, bez záväznej objednávky.</p></aside></div></main>;
  return <><Script src="https://widget.packeta.com/v6/www/js/library.js" strategy="afterInteractive" onLoad={() => setPacketaReady(true)} onError={() => setPacketaError("Mapu Packety sa nepodarilo načítať.")} /><SiteHeader suggestions={[]} />{content}</>;
}
