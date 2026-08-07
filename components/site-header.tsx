"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import type { CatalogSuggestion } from "@/components/catalog-filters";

export function SiteHeader({ suggestions }: { suggestions: CatalogSuggestion[] }) {
  const router = useRouter();
  const { count } = useCart();
  const formRef = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const matches = useMemo(() => {
    const value = query.trim().toLocaleLowerCase("sk");
    if (value.length < 2) return [];
    return suggestions.filter((item) => `${item.name} ${item.brand ?? ""} ${item.model}`.toLocaleLowerCase("sk").includes(value)).slice(0, 6);
  }, [query, suggestions]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    setOpen(false);
    router.push(value ? `/produkty?q=${encodeURIComponent(value)}` : "/produkty");
  }

  return <>
    <div className="topbar">
      <span>▱ Doprava zdarma pri nákupe nad 70 €</span>
      <span>♧ Odborné poradenstvo a diagnostika</span>
      <span>◇ Overené značky a kvalita</span>
    </div>
    <header className="site-header">
      <Link href="/" className="brand" aria-label="SIMSAJ – domov"><Image src="/brand/logo-simsaj-sk.jpeg" alt="SIMSAJ – pre vaše nohy" width={230} height={106} priority unoptimized /></Link>
      <form ref={formRef} className="search header-search" role="search" onSubmit={submit}>
        <label className="sr-only" htmlFor="site-search">Hľadať produkty</label>
        <input id="site-search" type="search" placeholder="Hľadať produkty..." value={query} autoComplete="off" role="combobox" aria-expanded={open} aria-controls="header-search-suggestions" onChange={(event) => { setQuery(event.target.value); setOpen(suggestions.length > 0 && event.target.value.trim().length >= 2); }} onFocus={() => setOpen(suggestions.length > 0 && query.trim().length >= 2)} onBlur={() => window.setTimeout(() => setOpen(false), 150)} />
        <button type="submit" aria-label="Vyhľadať">⌕</button>
        {open ? <div id="header-search-suggestions" className="catalog-suggestions header-search-suggestions" role="listbox" aria-label="Nájdené produkty">
          {matches.length ? <>{matches.map((item) => <Link role="option" className="catalog-suggestion" href={`/produkty/${item.slug}`} key={item.slug} onMouseDown={(event) => event.preventDefault()} onClick={() => setOpen(false)}><Image src={item.image} alt="" width={58} height={58} unoptimized /><span><strong>{item.name}</strong><small>{item.brand} · {item.model}</small></span><b>{item.price}</b></Link>)}<Link className="catalog-all-results" href={`/produkty?q=${encodeURIComponent(query.trim())}`} onMouseDown={(event) => event.preventDefault()}>Zobraziť nájdené produkty <span aria-hidden="true">→</span></Link></> : <span className="catalog-suggestions-empty">Nenašli sme zodpovedajúci produkt.</span>}
        </div> : null}
      </form>
      <nav className="quick-actions" aria-label="Používateľské možnosti">
        <Link href="/admin"><b>♙</b><span>Prihlásenie</span></Link>
        <Link href="/produkty"><b>♡</b><span>Obľúbené</span></Link>
        <Link href="/kosik" className="cart"><b>▱</b><span>Košík</span><em>{count}</em></Link>
      </nav>
    </header>
    <nav className="category-nav" aria-label="Hlavná navigácia">
      <Link href="/produkty?brand=DIAWIN">Ortopedická obuv</Link><Link href="/produkty">Detská obuv</Link><Link href="/produkty">Barefoot</Link><Link href="/produkty">Zdravotné ponožky</Link><Link href="/produkty?brand=SVORTO">Ortopedické vložky</Link><Link href="/#diagnostika">Meranie a diagnostika</Link><Link href="/#health">SIMSAJ Health</Link><Link href="/#onas">O nás</Link><Link href="/#blog">Blog</Link><Link href="/#kontakt">Kontakt</Link>
    </nav>
  </>;
}
