# Diawin XML feed

## Výsledok analýzy

- Katalógový feed: Google RSS XML, 656 položiek.
- Skladový feed: vlastné inventory XML, 656 položiek.
- Oba feedy obsahujú rovnakú množinu SKU a GTIN bez duplicít.
- 20 modelov, 656 variantov a 3 784 kusov skladovej zásoby.
- Veľkosti 36–50, šírky `1=M`, `2=W`, `3=XW`.
- Značka: Diawin.
- Produktové rady: DW Active, DW Active 2.0, DW Active Leather, DW Comfort, DW Comfort Leather a D³ Series.

## Párovanie

| Údaj | Katalógový feed | Skladový feed | Interný význam |
| --- | --- | --- | --- |
| Variant | `g:id` | `sku` | unikátne SKU partnera |
| Model | `g:item_group_id` | `modelId` | produkt s viacerými variantmi |
| Čiarový kód | `g:gtin` | `gtin` | GTIN variantu |
| Veľkosť | súhrn `g:size` | `size` | číselná veľkosť |
| Šírka | súčasť `g:size` | `width` | 1=M, 2=W, 3=XW |
| Sklad | `g:quantity` | `quantity` | počet kusov |

## Chýbajúce údaje

Feed momentálne neobsahuje predajnú ani nákupnú cenu, menu, obrázky, produktovú URL, detailný opis, materiál, farbu ani určenie pre zákaznícku skupinu. Preto:

- varianty sa ukladajú v súkromnej partnerskej vrstve,
- modely používajú jednorazovo dohľadané ilustračné fotografie a orientačné ceny,
- pri každej pracovnej cene je uložený zdroj a dátum kontroly,
- nákupné tlačidlá sa nezobrazujú,
- produkt sa nesmie stať predajným, kým nemá potvrdenú cenu a fotografiu.

Pracovné obohatenie katalógu je uložené oddelene od partnerského feedu. Opakovaný XML import preto neprepíše ilustračné fotografie ani orientačné ceny. Pred ostrým spustením sa musia nahradiť potvrdenými podkladmi od partnera.

## Opakovaný import

Importér je idempotentný: produkty páruje podľa partnera a `modelId`, varianty podľa partnera a SKU. Zmena skladu aktualizuje existujúci variant namiesto vytvorenia duplicity. Pred zápisom vždy kontroluje zhodu SKU a GTIN medzi feedmi.

Suchá kontrola bez zápisu:

```bash
npm run feed:diawin -- --catalog /cesta/01_google_feed.xml --inventory /cesta/01_inventory_feed.xml
```

Produkčný zápis vyžaduje serverovú premennú `SUPABASE_DATABASE_URL` a prepínač `--apply`. Databázové heslo sa nesmie ukladať do repozitára ani používať vo webovom klientovi.

Importér prijíma lokálne súbory aj HTTPS URL. Pre automatický režim používa serverové premenné `DIAWIN_CATALOG_FEED_URL`, `DIAWIN_INVENTORY_FEED_URL` a voliteľne `DIAWIN_FEED_AUTHORIZATION`. Identický feed podľa kontrolného súčtu preskočí a databázový zámok zabráni dvom súbežným importom. Každý spustený zápis končí stavom `succeeded` alebo `failed` v histórii importov.

Pripravený denný plán v GitHub Actions je štandardne vypnutý. Aktivuje sa až po bezpečnom pridaní uvedených hodnôt medzi GitHub Actions secrets a nastavení premennej `DIAWIN_FEED_SYNC_ENABLED=true`. Manuálne spustenie používa rovnaké bezpečnostné pravidlá.
