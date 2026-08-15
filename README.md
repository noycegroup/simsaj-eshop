# SIMSAJ e-shop

Pripravovaný e-shop pre **SIMSAJ** so zameraním na ortopedickú, barefoot a zdravotnú obuv, zdravotnícke ponožky, ortopedické vložky, rehabilitačné pomôcky a odborné služby pre zdravie chodidiel.

## Stav projektu

Projekt je v prípravnej fáze. Rozsah, odporúčaná architektúra a konkrétne míľniky sú uvedené v súbore [ROADMAP.md](ROADMAP.md).

Vizuálny smer, pracovná farebná paleta, štruktúra domovskej stránky a evidencia dodaných podkladov sú zdokumentované v súbore [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md).

Databázový projekt, prístupový model a pravidlá bezpečného prepojenia sú zdokumentované v súbore [SUPABASE.md](SUPABASE.md).

## Plánovaný technologický základ

- Next.js 16 a TypeScript
- Supabase (databáza, autentifikácia a úložisko)
- Vercel (nasadenie a prevádzka)
- Responzívne administračné rozhranie
- Technické SEO a meranie návštevnosti

## Najbližší krok

Založiť a prepojiť projekty vo Verceli a Supabase, inicializovať aplikáciu v Next.js 16 a pripraviť vývojové prostredie podľa prvého míľnika roadmapy.

## Prostredia a vetvy

| Prostredie | Git vetva | Adresa | Nasadenie |
| --- | --- | --- | --- |
| Vývoj (DEV) | `dev` | `https://dev.simsaj.sk` | automaticky po pushi do `dev` |
| Akceptácia (ACC) | `acc` | `https://acc.simsaj.sk` | manuálne po otestovaní DEV |

Každý push do vetvy `dev` automaticky nasadí novú verziu iba na vývojové prostredie. Po úspešnom otestovaní sa vytvorí pull request z vetvy `dev` do vetvy `acc`. Až jeho vedomé schválenie a zlúčenie aktualizuje `acc`; Vercel následne automaticky nasadí schválenú verziu na akceptačné prostredie.
