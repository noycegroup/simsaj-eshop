import Image from "next/image";
import Link from "next/link";

const categories = [
  { icon: "◒", title: "Ortopedická obuv", text: "Pohodlie a podpora pre každý krok" },
  { icon: "♧", title: "Detská obuv", text: "Zdravý vývoj detských nôh" },
  { icon: "⌁", title: "Barefoot obuv", text: "Prirodzený pohyb bez obmedzení" },
  { icon: "▥", title: "Zdravotné ponožky", text: "Kvalitné materiály pre vaše zdravie" },
  { icon: "◓", title: "Ortopedické vložky", text: "Individuálna podpora chodidla" },
  { icon: "◎", title: "Meranie a diagnostika", text: "Presné meranie na moderných prístrojoch" },
  { icon: "+", title: "Rehabilitačné pomôcky", text: "Podpora a rýchlejšia regenerácia" },
];

const services = [
  { icon: "♙", title: "Meranie chodidiel", text: "Moderná 3D technológia pre presné meranie" },
  { icon: "♧", title: "Odborné poradenstvo", text: "Individuálny výber podľa vašich potrieb" },
  { icon: "◒", title: "Individuálny výber obuvi", text: "Pomôžeme vám nájsť správnu obuv" },
  { icon: "⌁", title: "Diagnostika", text: "Analýza postoja a dynamiky chôdze" },
];

const brands = ["EPUR", "SVORTO", "SIDAS", "PROTETIKA", "WANDA", "RAK", "TATRASVIT", "ANTIPLESS", "IOMI", "LEON", "DIAVIN"];

const reviews = [
  { name: "Jana K., Topoľčany", text: "Profesionálny prístup a široký výber kvalitnej obuvi. Vďaka meraniu som konečne našla topánky, ktoré mi vyhovujú." },
  { name: "Peter M., Nitra", text: "Skvelé poradenstvo od prvého kroku. Odporúčam každému, kto rieši problémy s nohami." },
  { name: "Mária L., Partizánske", text: "Výborný obchod s kvalitnými značkami. Rýchle doručenie a spokojnosť na sto percent." },
];

function Arrow() {
  return <span aria-hidden="true">→</span>;
}

export default function Home() {
  return (
    <main>
      <div className="topbar">
        <span>▱ Doprava zdarma pri nákupe nad 70 €</span>
        <span>♧ Odborné poradenstvo a diagnostika</span>
        <span>◇ Overené značky a kvalita</span>
      </div>

      <header className="site-header">
        <a href="#" className="brand" aria-label="SIMSAJ – domov">
          <Image src="/brand/logo-simsaj-sk.jpeg" alt="SIMSAJ – pre vaše nohy" width={230} height={106} priority />
        </a>
        <form className="search" role="search">
          <label className="sr-only" htmlFor="site-search">Hľadať produkty</label>
          <input id="site-search" type="search" placeholder="Hľadať produkty..." />
          <button type="submit" aria-label="Vyhľadať">⌕</button>
        </form>
        <nav className="quick-actions" aria-label="Používateľské možnosti">
          <a href="#ucet"><b>♙</b><span>Prihlásenie</span></a>
          <a href="#oblubene"><b>♡</b><span>Obľúbené</span></a>
          <a href="#kosik" className="cart"><b>▱</b><span>Košík</span><em>0</em></a>
        </nav>
      </header>

      <nav className="category-nav" aria-label="Hlavná navigácia">
        <a href="#ortopedicka">Ortopedická obuv</a>
        <a href="#detska">Detská obuv</a>
        <a href="#barefoot">Barefoot</a>
        <a href="#ponozky">Zdravotné ponožky</a>
        <a href="#vlozky">Ortopedické vložky</a>
        <a href="#diagnostika">Meranie a diagnostika</a>
        <a href="#health">SIMSAJ Health</a>
        <a href="#onas">O nás</a>
        <a href="#blog">Blog</a>
        <a href="#kontakt">Kontakt</a>
      </nav>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">ODBORNÁ STAROSTLIVOSŤ O VAŠE NOHY</p>
          <h1 id="hero-title">Zdravie<br />začína od <span>nôh.</span></h1>
          <p>Kvalitná ortopedická obuv, vložky, ponožky a odborné poradenstvo pre vaše pohodlie každý deň.</p>
          <div className="hero-actions">
            <Link className="button primary" href="/produkty">Nakupovať <Arrow /></Link>
            <a className="button secondary" href="#diagnostika">Meranie a diagnostika <span aria-hidden="true">♧</span></a>
          </div>
        </div>
        <div className="hero-media">
          <Image src="/reference/simsaj-02.jpeg" alt="Prémiová zdravotná obuv SIMSAJ" fill sizes="(max-width: 760px) 100vw, 58vw" priority />
          <div className="hero-badge"><strong>⌁</strong><span>Profesionálne<br />meranie chodidiel</span></div>
        </div>
      </section>

      <section className="benefits" aria-label="Výhody nákupu">
        <div><b>▱</b><span><strong>Doprava zdarma</strong>pri nákupe nad 70 €</span></div>
        <div><b>↶</b><span><strong>Vrátenie tovaru</strong>do 14 dní</span></div>
        <div><b>◷</b><span><strong>Rýchle doručenie</strong>1–2 pracovné dni</span></div>
        <div><b>♙</b><span><strong>Bezpečný nákup</strong>chránené platby</span></div>
      </section>

      <section className="section categories" id="kategorie" aria-labelledby="categories-title">
        <div className="section-heading">
          <div><p className="eyebrow">VŠETKO PRE ZDRAVÝ KROK</p><h2 id="categories-title">Vyberte si podľa svojich potrieb</h2></div>
          <Link href="/produkty">Všetky kategórie <Arrow /></Link>
        </div>
        <div className="category-grid">
          {categories.map((category, index) => (
            <Link className={`category-card category-${index + 1}`} href="/produkty" key={category.title}>
              <span className="category-icon">{category.icon}</span>
              <div><h3>{category.title}</h3><p>{category.text}</p></div>
              <span className="card-link">Zobraziť <Arrow /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section care-section" id="diagnostika">
        <article className="expert-card">
          <div className="expert-portrait" aria-hidden="true">S</div>
          <div><p className="eyebrow">ODBORNÝ PRÍSTUP</p><h2>Vaše nohy si zaslúžia správnu starostlivosť</h2><p>Spájame skúsenosti, modernú diagnostiku a individuálne poradenstvo.</p><a href="#onas">Spoznajte SIMSAJ <Arrow /></a></div>
        </article>
        <div className="services-card">
          <h2>Naše služby pre vaše zdravie</h2>
          <div className="services-grid">
            {services.map((service) => <article key={service.title}><b>{service.icon}</b><h3>{service.title}</h3><p>{service.text}</p></article>)}
          </div>
        </div>
        <aside className="booking-card">
          <p className="eyebrow">ONLINE REZERVÁCIA</p>
          <h2>Objednajte sa na diagnostiku</h2>
          <p>Rezervujte si termín merania online.</p>
          <a className="button light" href="#termin">Rezervovať termín <Arrow /></a>
        </aside>
      </section>

      <section className="premium section" aria-labelledby="premium-title">
        <div className="premium-image"><Image src="/reference/simsaj-04.jpeg" alt="Kolekcia luxusnej zdravotnej obuvi SIMSAJ" fill sizes="(max-width: 900px) 100vw, 55vw" /></div>
        <div className="premium-copy"><p className="eyebrow">SIMSAJ HEALTH</p><h2 id="premium-title">Tradícia, zdravie a pohodlie v každom kroku</h2><p>Objavte kolekciu zdravotnej obuvi navrhnutú pre náročných. Dôraz na anatomickú podporu, prémiové materiály a celodenné pohodlie.</p><ul><li>Anatomická podpora chodidla</li><li>Prémiové a odolné materiály</li><li>Modely pre dámy, pánov aj seniorov</li></ul><a className="button primary" href="#kolekcia">Objaviť kolekciu <Arrow /></a></div>
      </section>

      <section className="section brand-section" aria-labelledby="brand-title">
        <div className="section-heading"><div><p className="eyebrow">KVALITA, KTOREJ VERÍME</p><h2 id="brand-title">Overené značky a výrobcovia</h2></div><a href="#znacky">Všetky značky <Arrow /></a></div>
        <div className="brand-grid">{brands.map((brand) => <span key={brand}>{brand}</span>)}</div>
      </section>

      <section className="section store-benefits" aria-label="Služby predajne">
        <article><b>▰</b><div><h3>Doprava zdarma pri nákupe nad 70 €</h3><p>Rýchle doručenie do 1–2 pracovných dní</p></div></article>
        <article><b>⌂</b><div><h3>Kamenná predajňa</h3><p>Osobný výber s odbornou pomocou</p></div></article>
        <article><b>♧</b><div><h3>Kvalita, ktorej môžete dôverovať</h3><p>Starostlivo vyberané produkty pre zdravé nohy</p></div></article>
        <article><b>◇</b><div><h3>Vernostný program a výhody</h3><p>Zbierajte body a získajte exkluzívne zľavy</p></div></article>
      </section>

      <section className="section reviews" aria-labelledby="reviews-title">
        <div className="section-heading"><div><p className="eyebrow">SKÚSENOSTI ZÁKAZNÍKOV</p><h2 id="reviews-title">Čo hovoria naši zákazníci</h2></div><a href="#recenzie">Ďalšie recenzie <Arrow /></a></div>
        <div className="review-grid">{reviews.map((review) => <blockquote key={review.name}><div aria-label="5 z 5 hviezdičiek">★★★★★</div><p>„{review.text}“</p><cite>{review.name}</cite></blockquote>)}</div>
      </section>

      <footer id="kontakt">
        <div className="footer-grid">
          <div className="footer-brand"><Image src="/brand/logo-simsaj-sk.jpeg" alt="SIMSAJ" width={180} height={83} /><p>Špecializovaná predajňa ortopedickej obuvi, zdravotníckych ponožiek a odborného poradenstva.</p></div>
          <div><h2>Kontakt</h2><p>SIMSAJ s.r.o.<br />17. novembra 1300<br />958 01 Topoľčany</p><p><a href="tel:+421905123456">+421 905 123 456</a><br /><a href="mailto:info@simsaj.sk">info@simsaj.sk</a></p></div>
          <div><h2>Otváracie hodiny</h2><p>Po – Pia: 9:00 – 18:00<br />So: 9:00 – 13:00<br />Ne: Zatvorené</p><a className="footer-button" href="#hodiny">Aktuálne otváracie hodiny</a></div>
          <div><h2>Užitočné odkazy</h2><ul><li><a href="#podmienky">Obchodné podmienky</a></li><li><a href="#reklamacie">Reklamačný poriadok</a></li><li><a href="#ochrana">Ochrana osobných údajov</a></li><li><a href="#doprava">Doprava a platba</a></li><li><a href="#vratenie">Vrátenie tovaru</a></li></ul></div>
          <div><h2>Predajňa</h2><div className="map-placeholder"><span>SIMSAJ</span><small>Topoľčany</small><a href="#mapa">Zobraziť na mape</a></div></div>
        </div>
        <div className="footer-bottom"><span>© 2026 SIMSAJ s.r.o. Všetky práva vyhradené.</span><span>VISA · Mastercard · Apple Pay · Google Pay</span></div>
      </footer>
    </main>
  );
}
