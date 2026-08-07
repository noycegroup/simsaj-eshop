# Adaptácia objednávok a SuperFaktúry z Hravo s deťmi

## Zdroj

- Repozitár: `noycegroup/hravosdetmi-remake`
- Analyzovaná časť: `hravosdetmi-remake-vercel`
- Účel: znovu použiť overené návrhové vzory, nie slepo skopírovať riešenie.

## SuperFaktúra

Pôvodný modul už rieši typovaný vstup faktúry, serverovú autorizáciu, prevod ceny s DPH, vytvorenie faktúry, získanie PDF a bezpečné skrátenie chybovej odpovede. Pre SIMSAJ sa dá zachovať väčšina tejto logiky.

Pred použitím sa musia odstrániť pevne zapísané hodnoty pôvodného e-shopu, najmä názov modulu, `sequence_id` a `logo_id`. Konfigurácia SIMSAJ bude uložená iba na serveri. API kľúč ani token faktúry sa nikdy nesmú dostať do klienta alebo verejného API.

Synchronizácia bude nad objednávkou evidovať minimálne:

- externé ID a číslo faktúry,
- stav `pending`, `synced` alebo `failed`,
- bezpečnú chybovú správu,
- čas posledného pokusu a počet pokusov,
- idempotentný identifikátor odvodený z objednávky.

## Administrácia objednávok

Z pôvodného projektu sa adaptuje zoznam, vyhľadávanie, detail, zmena stavu a zákaznícke notifikácie. SIMSAJ už má pripravené tabuľky `orders` a `order_items`, ich názvy polí sa však líšia. Adaptér preto musí mapovať najmä:

| Hravo s deťmi | SIMSAJ |
| --- | --- |
| samostatné polia mena a adresy | `billing_address` a `shipping_address` ako JSON |
| `total` | `grand_total` |
| `shipping_price` | `shipping_total` |
| `name` položky | `product_name` |
| voliteľné produktové údaje | uložený snapshot SKU, názvu variantu, ceny a DPH |

Administrácia bude chránená cez Supabase Auth a rolu administrátora. Citlivé operácie budú zapisovať auditnú udalosť. Trvalé mazanie objednávok sa nepreberie; nahradí ho archivácia a riadené storno.

## Poradie implementácie

1. Administrátorské prihlásenie, roly a ochrana `/admin` a `/api/admin`.
2. Doplnenie fakturačných a auditných polí do databázy.
3. Read-only zoznam a detail objednávok.
4. Bezpečné zmeny stavov a auditná stopa.
5. Adaptovaný klient SuperFaktúry a testovací režim.
6. Opakovanie chýb, idempotencia a zobrazenie faktúry v detaile.
7. Transakčné e-maily a koncové testy.
