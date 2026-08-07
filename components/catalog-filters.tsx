"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type CatalogSuggestion = {
  name: string;
  slug: string;
  brand: string | null;
  model: string;
  image: string;
  price: string;
};

type CatalogFiltersProps = {
  suggestions: CatalogSuggestion[];
  initialQuery: string;
  initialSeries: string;
  initialSize: string;
  initialWidth: string;
  initialSort: string;
};

export function CatalogFilters({ suggestions, initialQuery, initialSeries, initialSize, initialWidth, initialSort }: CatalogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("sk");
    if (normalized.length < 2) return [];
    return suggestions.filter((item) => `${item.name} ${item.brand ?? ""} ${item.model}`.toLocaleLowerCase("sk").includes(normalized)).slice(0, 6);
  }, [query, suggestions]);

  useEffect(() => {
    function close(event: PointerEvent) {
      if (!formRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", close);
    window.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", escape);
    };
  }, []);

  function applyFilter(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && !(name === "sort" && value === "name")) params.set(name, value);
    else params.delete(name);
    router.replace(params.size ? `/produkty?${params}` : "/produkty", { scroll: false });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOpen(false);
    applyFilter("q", query.trim());
  }

  const allResultsHref = (() => {
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) params.set("q", query.trim()); else params.delete("q");
    return params.size ? `/produkty?${params}` : "/produkty";
  })();

  return <form ref={formRef} className="catalog-filters" action="/produkty" method="get" onSubmit={submitSearch}>
    <label className="catalog-search">Hľadať produkt
      <span className="catalog-search-control">
        <input name="q" type="search" role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls="catalog-search-suggestions" value={query} onChange={(event) => { setQuery(event.target.value); setOpen(event.target.value.trim().length >= 2); }} onFocus={() => setOpen(query.trim().length >= 2)} placeholder="Názov alebo kód modelu" autoComplete="off" />
        {open ? <span id="catalog-search-suggestions" className="catalog-suggestions" role="listbox" aria-label="Nájdené produkty">
          {matches.length ? <>
            {matches.map((item) => <Link role="option" className="catalog-suggestion" href={`/produkty/${item.slug}`} key={item.slug} onClick={() => setOpen(false)}>
              <Image src={item.image} alt="" width={58} height={58} unoptimized />
              <span><strong>{item.name}</strong><small>{item.brand} · {item.model}</small></span>
              <b>{item.price}</b>
            </Link>)}
            <Link className="catalog-all-results" href={allResultsHref} onClick={() => setOpen(false)}>Zobraziť nájdené produkty <span aria-hidden="true">→</span></Link>
          </> : <span className="catalog-suggestions-empty">Nenašli sme zodpovedajúci produkt.</span>}
        </span> : null}
      </span>
    </label>
    <label>Značka / modelová rada
      <select name="series" defaultValue={initialSeries} onChange={(event) => applyFilter("series", event.target.value)}>
        <option value="">Všetky produkty</option><option value="SVORTO">SVORTO</option><option value="AF">Diawin AF</option><option value="AM">Diawin AM</option><option value="FF">Diawin FF</option><option value="FM">Diawin FM</option><option value="TF">Diawin TF</option><option value="TM">Diawin TM</option>
      </select>
    </label>
    <label>Veľkosť
      <select name="size" defaultValue={initialSize} onChange={(event) => applyFilter("size", event.target.value)}>
        <option value="">Všetky veľkosti</option>{Array.from({ length: 15 }, (_, index) => String(index + 36)).map((item) => <option value={item} key={item}>{item}</option>)}
      </select>
    </label>
    <label>Šírka
      <select name="width" defaultValue={initialWidth} onChange={(event) => applyFilter("width", event.target.value)}>
        <option value="">Všetky šírky</option><option value="1">M – stredná</option><option value="2">W – široká</option><option value="3">XW – extra široká</option>
      </select>
    </label>
    <label>Radenie
      <select name="sort" defaultValue={initialSort} onChange={(event) => applyFilter("sort", event.target.value)}>
        <option value="name">Podľa názvu</option><option value="price-asc">Cena od najnižšej</option><option value="price-desc">Cena od najvyššej</option>
      </select>
    </label>
    <button type="submit">Zobraziť výsledky</button>
  </form>;
}
