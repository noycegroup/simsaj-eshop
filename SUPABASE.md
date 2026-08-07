# Supabase základ projektu SIMSAJ

## Projekt

- Názov: `simsaj-eshop`
- Región: `eu-central-1` (Frankfurt)
- Project ref: `jjmkvbuxivlatnspdqam`
- API URL: `https://jjmkvbuxivlatnspdqam.supabase.co`
- Databáza: PostgreSQL 17

Do repozitára sa nesmú ukladať tajné ani `service_role` kľúče. Webový klient používa iba moderný publishable key cez premennú `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Vytvorené tabuľky

- `categories`
- `products`
- `product_categories`
- `product_variants`
- `product_images`
- `customer_profiles`
- `customer_addresses`
- `orders`
- `order_items`
- `appointments`

Partnerské feedy používajú súkromnú schému `private` s tabuľkami `suppliers`, `supplier_feeds`, `feed_imports`, `supplier_products` a `supplier_variants`. Táto vrstva nie je dostupná cez verejné dátové API.

## Prístupový model

- Verejnosť môže čítať iba aktívne kategórie, publikované produkty, ich aktívne varianty a obrázky.
- Prihlásený zákazník môže čítať a meniť iba vlastný profil a adresy.
- Prihlásený zákazník môže čítať iba vlastné objednávky a položky objednávok.
- Prihlásený zákazník môže vytvoriť vlastnú rezerváciu so súhlasom so spracovaním údajov a zrušiť iba rezerváciu v stave `requested`.
- Vytváranie objednávok a administratívne operácie zatiaľ nie sú dostupné z verejného klienta; budú sa vykonávať výlučne cez dôveryhodnú serverovú vrstvu.
- RLS je zapnuté na všetkých tabuľkách v schéme `public`.

## Overenie

- Bezpečnostný poradca Supabase: bez nálezov po vytvorení schémy.
- Doplnené indexy pre všetky cudzie kľúče označené výkonnostným poradcom.
- Upozornenia na nepoužité indexy sú pri prázdnej novej databáze očakávané.

## Ďalší krok

Získať od partnera Diawin ceny a fotografie, doplniť ich mapovanie a až potom aktivovať nákup variantov.
