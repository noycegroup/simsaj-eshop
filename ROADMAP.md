# Roadmapa projektu SIMSAJ e-shop

## Vízia

Vybudovať dôveryhodný, rýchly a jednoducho spravovateľný e-shop pre SIMSAJ, ktorý spojí predaj zdravotne orientovaného sortimentu s odborným poradenstvom, diagnostikou chodidiel a rezerváciami služieb.

## Fáza 1 – Technický základ

- Inicializovať aplikáciu v Next.js 16 s TypeScriptom a responzívnym rozhraním.
- Založiť prostredia pre vývoj, testovanie a produkciu.
- Prepojiť Supabase pre databázu, autentifikáciu, úložisko médií a riadenie prístupov.
- Prepojiť Vercel, nastaviť automatické náhľady zmien a produkčné nasadenie.
- Navrhnúť dátový model produktov, variantov, kategórií, skladov, objednávok, zákazníkov a rezervácií.
- Vytvoriť zabezpečené administračné rozhranie s rolami a auditovateľnými zmenami.
- Zaviesť technické SEO: metadáta, kanonické URL, Open Graph, XML sitemapu, `robots.txt` a štruktúrované dáta Schema.org.
- Nastaviť základné kontroly kvality, formátovanie, testovanie a bezpečnú správu premenných prostredia.

**Výstup:** nasaditeľný základ aplikácie, databáza, prihlásenie administrátora a pripravené SEO minimum.

## Fáza 2 – Dizajn a hlavné stránky

- Definovať vizuálny štýl, typografiu, farby, komponenty a pravidlá prístupnosti.
- Navrhnúť responzívnu hlavičku, navigáciu, vyhľadávanie, pätičku a systém oznamov.
- Vytvoriť domovskú stránku, výpis kategórie a detail produktu.
- Vytvoriť košík, pokladňu, potvrdenie objednávky a zákaznícky účet.
- Pripraviť stránky služieb, diagnostiky chodidiel, blogu, o nás a kontaktu.
- Overiť použiteľnosť na mobile, tablete a počítači vrátane klávesnicovej navigácie.

**Výstup:** schválený dizajnový systém a kompletný nákupný tok pripravený na napojenie reálnych dát.

## Fáza 3 – XML feedy a produktový katalóg

- Zmapovať dodávateľov, formáty XML feedov, licencie k obsahu a frekvenciu aktualizácií.
- Vytvoriť import cien, zásob, obrázkov, popisov, parametrov, kategórií a variantov.
- Zaviesť mapovanie dodávateľských kategórií a parametrov na interný katalóg.
- Riešiť duplicity, chýbajúce údaje, zmeny dostupnosti a chybové záznamy importu.
- Umožniť ručné úpravy, schválenie produktu a ochranu vybraných údajov pred prepísaním feedom.
- Pripraviť filtre, radenie, fulltextové vyhľadávanie a súvisiace produkty.
- Nastaviť pravidelné synchronizácie a upozornenia na neúspešný import.

**Výstup:** spoľahlivo synchronizovaný a spravovateľný produktový katalóg.

## Fáza 4 – Špeciálne funkcie SIMSAJ

- Diagnostika chodidiel s vysvetlením služby, pobočkou, dostupnými termínmi a rezerváciou.
- Sprievodca výberom obuvi podľa veku, použitia, tvaru chodidla a zdravotného problému.
- Sprievodca výberom ortopedických vložiek s jasným odporúčaním ďalšieho kroku.
- Filtre podľa potrieb a problémov, napríklad ploché nohy, hallux valgus alebo diabetická noha; bez nahrádzania odbornej diagnózy.
- Rezervácia osobného či vzdialeného poradenstva vrátane potvrdení a pripomienok.
- Odborný blog pre edukáciu, organické vyhľadávanie a prepojenie článkov s produktmi a službami.
- Zber spätnej väzby a meranie úspešnosti sprievodcov a rezervácií.

**Výstup:** odlíšenie SIMSAJ odbornou pomocou, ktorá prirodzene prepája služby a predaj.

## Fáza 5 – Platby

- Vybrať primárnu platobnú bránu podľa poplatkov, podpory a účtovných potrieb.
- Podporiť platbu kartou a podľa možností Apple Pay a Google Pay.
- Zvážiť GoPay, Stripe alebo CardPay; finálne riešenie potvrdiť pred implementáciou.
- Doplniť dobierku, bankový prevod, vrátenie platby a párovanie stavov.
- Zabezpečiť spracovanie notifikácií platobnej brány, opakovanie chýb a ochranu pred duplicitnou objednávkou.
- Otestovať úspešné, zamietnuté, prerušené a refundované platby.

**Výstup:** bezpečný a kompletne otestovaný platobný proces.

## Fáza 6 – Doprava

- Zaviesť osobný odber a vybraných dopravcov, napríklad Packetu, SPS, GLS alebo Slovenskú poštu.
- Nastaviť ceny podľa hodnoty, hmotnosti, rozmerov, krajiny a prípadnej dobierky.
- Integrovať výber odberného miesta, tvorbu zásielky, štítky a sledovanie.
- Synchronizovať stavy zásielok a posielať zákazníkom transakčné oznámenia.
- Definovať proces výmeny, vrátenia a reklamácie tovaru.

**Výstup:** transparentné možnosti doručenia a zvládnutý životný cyklus zásielky.

## Fáza 7 – Marketing a analytika

- Nastaviť Google Analytics 4 a Google Tag Manager so súhlasmi podľa platnej legislatívy.
- Definovať meranie zobrazenia produktu, vyhľadávania, košíka, nákupu, rezervácie a odoslania formulára.
- Prepojiť Google Search Console a skontrolovať indexáciu a štruktúrované dáta.
- Pripraviť produktový feed pre Google Merchant Center.
- Podľa obchodnej stratégie zapojiť Meta Pixel, Heureku, Pricemaniu a prípadne Glami.
- Zaviesť e-mailové scenáre pre opustený košík, následnú starostlivosť a opakovaný nákup.
- Vytvoriť prehľad kľúčových ukazovateľov: obrat, konverzia, priemerná objednávka, rezervácie a návratnosť kampaní.

**Výstup:** merateľný predajný lievik a dátový základ pre marketingové rozhodnutia.

## Administrácia

Admin rozhranie má postupne obsahovať:

- dashboard objednávok, predaja, zásob, rezervácií a upozornení,
- produkty, varianty, kategórie, značky, parametre, ceny, médiá a SEO údaje,
- importy XML feedov, mapovanie údajov, históriu behov a chybové záznamy,
- objednávky, platby, zásielky, vratky, reklamácie a interné poznámky,
- zákazníkov, adresy a komunikáciu v súlade s pravidlami ochrany osobných údajov,
- kalendár diagnostiky a poradenstva, kapacity, blokácie a notifikácie,
- obsahové stránky, navigáciu, bannery, blog a presmerovania URL,
- zľavy, kupóny, dopravu, platobné metódy a konfigurovateľné pravidlá,
- používateľské roly, oprávnenia a auditnú stopu citlivých operácií.

## Odporúčaná architektúra stránok

```text
/
├── Obuv
│   ├── Barefoot
│   ├── Ortopedická
│   ├── Zdravotná
│   └── Detská
├── Ortopedické vložky
├── Zdravotnícke ponožky
├── Rehabilitačné a ortopedické pomôcky
├── Diagnostika chodidiel
├── Poradenstvo a rezervácia
├── Blog
│   └── Článok
├── O nás
├── Kontakt
├── Vyhľadávanie
├── Košík
├── Pokladňa
├── Môj účet
│   ├── Objednávky
│   ├── Rezervácie
│   └── Osobné údaje
└── Právne a informačné stránky
    ├── Obchodné podmienky
    ├── Ochrana osobných údajov
    ├── Doprava a platba
    └── Vrátenie a reklamácie
```

## Konkrétne míľniky

### M0 – Projekt pripravený

- GitHub repozitár, roadmapa a základná dokumentácia.
- Vlastníci projektu, spôsob rozhodovania a zoznam potrebných externých účtov.

### M1 – Technický základ online

- Next.js 16 aplikácia prepojená so Supabase a Vercelom.
- Náhľadové a produkčné prostredie, administrátorské prihlásenie a SEO minimum.

### M2 – Klikateľný nákupný tok

- Dizajnový systém a responzívne hlavné stránky.
- Funkčný prechod od kategórie cez produkt a košík po pokladňu s testovacími dátami.

### M3 – Reálny katalóg

- Prvý dodávateľský feed importovaný a monitorovaný.
- Produkty sú vyhľadateľné, filtrovateľné a editovateľné v administrácii.

### M4 – Objednávky od začiatku do konca

- Produkčné platby, doprava, e-maily a správa objednávok.
- Otestované chybové situácie, refundácie, vratky a reklamácie.

### M5 – SIMSAJ služby

- Diagnostika, sprievodcovia výberom a rezervácie poradenstva.
- Blog a odborný obsah prepojený s relevantnými produktmi.

### M6 – Predprodukčná pripravenosť

- Testovanie funkčnosti, bezpečnosti, výkonu, prístupnosti a SEO.
- Kontrola obsahu, právnych textov, analytiky, súhlasov a prevádzkových postupov.

### M7 – Spustenie a stabilizácia

- Produkčné spustenie, dohľad nad chybami, platbami, feedmi a objednávkami.
- Vyhodnotenie prvých dát, opravy kritických problémov a plán ďalších iterácií.

## Priebežné zásady

- Chrániť osobné a zdravotne citlivé informácie už pri návrhu každej funkcie.
- Neprezentovať produktové filtre ani sprievodcov ako náhradu zdravotnej diagnostiky.
- Každú fázu uzavrieť merateľnými akceptačnými kritériami a krátkym používateľským testom.
- Uprednostniť stabilný nákupný proces, kvalitné dáta a zrozumiteľný obsah pred nadbytočnými funkciami.
- Dokumentovať integrácie, prevádzkové postupy, zálohovanie a obnovu po chybe.
