# Vizuálny základ SIMSAJ e-shopu

Tento dokument zachytáva pracovné dizajnové rozhodnutia podľa dodaného loga a schváleného návrhu domovskej stránky. Návrh domovskej stránky sa považuje za záväznú referenciu pre štruktúru; texty, ceny, kontaktné údaje, osoby, značky a produktové fotografie v ňom sú zatiaľ ilustračné a pred publikovaním sa musia potvrdiť.

## Značka

- Primárne logo: `public/brand/logo-simsaj-sk.jpeg`
- Slovný znak: **simsaj**
- Claim: **…pre vaše nohy**
- Charakter značky: odborný, dôveryhodný, zdravotne orientovaný, čistý a moderný.
- Logo sa nemá deformovať, prefarbovať ani umiestňovať na rušivé pozadie.
- Okolo loga treba zachovať dostatočný voľný priestor; pre web sa neskôr pripraví transparentný SVG alebo PNG variant.

## Pracovná farebná paleta

Farby vychádzajú z vizuálneho odhadu dodaného loga a návrhu. Pred produkčným nasadením sa majú potvrdiť z pôvodných grafických podkladov značky.

| Token | Farba | Použitie |
| --- | --- | --- |
| `brand-700` | `#006B50` | primárne tlačidlá, horný informačný pás, aktívne prvky |
| `brand-800` | `#005640` | hover a výrazné tmavozelené plochy |
| `brand-100` | `#E7F2EE` | jemné zelené pozadia a zvýraznenia |
| `ink-950` | `#171717` | navigácia, pätička, hlavné nadpisy |
| `ink-800` | `#292929` | text loga a bežný tmavý text |
| `ink-600` | `#666666` | sekundárny text |
| `surface` | `#FFFFFF` | hlavné pozadie |
| `surface-muted` | `#F6F7F6` | karty a oddelené sekcie |
| `border` | `#D9DDDB` | deliace čiary a okraje formulárov |

Základ má byť prevažne biely a čierny. Zelená slúži ako rozpoznateľný akcent a farba konverzných prvkov. Zlaté a hnedé tóny z produktových vizuálov sa nepovažujú za základnú farbu rozhrania; môžu sa použiť v samostatnej prémiovej kampani alebo kolekcii.

## Typografia a rozhranie

- Použiť čisté bezpätkové písmo s veľmi dobrou čitateľnosťou a slovenskou diakritikou.
- Nadpisy majú byť výrazné, krátke a s vysokým kontrastom.
- Texty a ovládacie prvky nesmú byť menšie, než je pohodlné na mobilnom zariadení.
- Primárne tlačidlo je plné zelené; sekundárne je biele s tmavým okrajom.
- Karty majú jemné sivé pozadie, malé zaoblenie a minimálny tieň.
- Ikony majú byť jednoduché líniové, vizuálne jednotné a doplnené textovým významom.
- Návrh musí spĺňať minimálne WCAG 2.2 AA vrátane kontrastu, viditeľného fokusu a ovládania klávesnicou.

## Záväzná štruktúra domovskej stránky

Poradie sekcií vychádza z `public/reference/navrh-buduceho-eshopu.png`:

1. Informačný pás: doprava zdarma, odborné poradenstvo a diagnostika, overené značky a kvalita.
2. Hlavná hlavička: logo, vyhľadávanie, prihlásenie, obľúbené položky a košík.
3. Kategóriová navigácia: ortopedická obuv, detská obuv, barefoot, zdravotné ponožky, ortopedické vložky, meranie a diagnostika, SIMSAJ Health, o nás, blog a kontakt.
4. Hero sekcia s hlavným posolstvom **Zdravie začína od nôh**, CTA na nákup a CTA na meranie a diagnostiku.
5. Pás benefitov: doprava zdarma, vrátenie tovaru, rýchle doručenie a bezpečný nákup.
6. Kategóriové karty: ortopedická obuv, detská obuv, barefoot obuv, zdravotné ponožky, ortopedické vložky, meranie a diagnostika, rehabilitačné a ortopedické pomôcky.
7. Odborný garant, služby pre zdravie a výrazná rezervácia diagnostiky.
8. Overené značky a výrobcovia.
9. Prevádzkové a obchodné výhody: doprava, kamenná predajňa, kvalita a vernostný program.
10. Zákaznícke recenzie.
11. Pätička: značka, kontakt, otváracie hodiny, užitočné odkazy, mapa predajne a platobné možnosti.

## Responzívne správanie

- Na mobile sa informačný pás zjednoduší a hlavná navigácia sa zbalí do menu.
- Vyhľadávanie musí zostať ľahko dostupné a košík stále viditeľný.
- Hero obsah sa zoradí tak, aby bol nad prehybom nadpis, hlavné CTA a zrozumiteľný vizuál.
- Kategórie sa zobrazia v horizontálnom posuvnom rade alebo v dvojstĺpcovej mriežke.
- Rozsiahle pásy sa rozložia do kariet bez zmeny významu alebo poradia obsahu.
- Rezervácia diagnostiky musí zostať výrazným konverzným prvkom na každej veľkosti obrazovky.

## Dodané obrazové podklady

- `public/reference/navrh-buduceho-eshopu.png` – štruktúra a vizuál domovskej stránky.
- `public/reference/simsaj-04.jpeg` – prémiový kolekčný vizuál s príbehom značky.
- `public/reference/simsaj-02.jpeg` – horizontálny prémiový vizuál produktovej kolekcie.

Oba kolekčné vizuály obsahujú text priamo v obraze. Na responzívnom webe sa preto nemajú automaticky používať ako jediný nositeľ dôležitého textu; významný obsah sa musí uviesť aj ako prístupný HTML text.

## Otvorené podklady pred produkciou

- originálne vektorové logo alebo transparentné logo vo vysokej kvalite,
- presné brand farby a prípadný grafický manuál,
- licenčné a publikačné práva ku všetkým fotografiám, značkám a podobizniam,
- potvrdené kontaktné údaje, adresa, otváracie hodiny a hranica dopravy zdarma,
- potvrdený odborný garant a súhlas s uvedením mena, fotografie a titulov,
- zoznam skutočných výrobcov, platobných metód a zákazníckych recenzií.
