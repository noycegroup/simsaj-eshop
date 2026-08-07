# SVORTO B2B XML feed

## Výsledok analýzy a prvého importu

- 160 produktov a 594 veľkostných variantov.
- 881 produktových fotografií cez HTTPS.
- 1 062 parametrov v 14 skupinách.
- Unikátne `ITEM_ID` pre produkty a unikátne EAN pre všetky varianty.
- Maloobchodné aj veľkoobchodné ceny s DPH a bez DPH, sadzba DPH a skladové pásma.
- Všetky varianty boli pri prvom importe označené skladom.
- 23 produktov nemá dlhý opis; importér pri nich používa povinný krátky opis.

## Mapovanie

| SVORTO | SIMSAJ |
| --- | --- |
| `ITEM_ID` | externé ID produktu a stabilný slug |
| `NAME` | názov produktu |
| `REFERENCE` | referencia dodávateľa v súkromnej vrstve |
| `DESCRIPTION(_SHORT)` | očistený textový opis bez vloženého HTML |
| `IMAGES/IMG` | zoradené produktové fotografie |
| `FEATURES/FEATURE` | štruktúrované parametre v súkromnej vrstve |
| `EAN` | čiarový kód a základ stabilného SKU |
| `ATTRIBUTE_NAME` | veľkosť variantu |
| `BASE_PRICE_*` | zákaznícka cena variantu |
| `WHOLESALE_PRICE_*` | B2B cena iba v súkromnej vrstve |
| `ON_STOCK`, `QUANTITY_SAFE` | dostupnosť a konzervatívne minimálne množstvo |

Produkty sa mapujú do kategórií Ortopedické vložky, Rehabilitačné pomôcky a Starostlivosť o chodidlá. Veľkoobchodná cena a partnerské parametre zostávajú v schéme `private`, ktorá nie je vystavená cez verejné dátové API.

## Synchronizácia

Manuálna kontrola: `npm run feed:svorto -- --source /cesta/feed.xml`.

Automatický import používa tajomstvá `SVORTO_FEED_URL` a `SUPABASE_DATABASE_URL`. Denný plán sa aktivuje až nastavením `SVORTO_FEED_SYNC_ENABLED=true`. URL s partnerským kľúčom sa nesmie zapísať do repozitára, dokumentácie ani verejného klienta.
