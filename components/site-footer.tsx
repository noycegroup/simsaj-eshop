import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return <footer id="kontakt">
    <div className="footer-grid">
      <div className="footer-brand"><Image src="/brand/logo-simsaj-sk.jpeg" alt="SIMSAJ" width={180} height={83} unoptimized /><p>Špecializovaná predajňa ortopedickej obuvi, zdravotníckych ponožiek a odborného poradenstva.</p></div>
      <div><h2>Kontakt</h2><p>SIMSAJ s.r.o.<br />17. novembra 1300<br />958 01 Topoľčany</p><p><a href="tel:+421905123456">+421 905 123 456</a><br /><a href="mailto:info@simsaj.sk">info@simsaj.sk</a></p></div>
      <div><h2>Otváracie hodiny</h2><p>Po – Pia: 9:00 – 18:00<br />So: 9:00 – 13:00<br />Ne: Zatvorené</p><Link className="footer-button" href="/#hodiny">Aktuálne otváracie hodiny</Link></div>
      <div><h2>Užitočné odkazy</h2><ul><li><Link href="/#podmienky">Obchodné podmienky</Link></li><li><Link href="/#reklamacie">Reklamačný poriadok</Link></li><li><Link href="/#ochrana">Ochrana osobných údajov</Link></li><li><Link href="/#doprava">Doprava a platba</Link></li><li><Link href="/#vratenie">Vrátenie tovaru</Link></li></ul></div>
      <div><h2>Predajňa</h2><div className="map-placeholder"><span>SIMSAJ</span><small>Topoľčany</small><Link href="/#mapa">Zobraziť na mape</Link></div></div>
    </div>
    <div className="footer-bottom"><span>© 2026 SIMSAJ s.r.o. Všetky práva vyhradené.</span><span>Bezpečné platby cez Comgate</span></div>
    <div className="footer-payment-logos"><span>Platobné možnosti</span><a href="https://www.comgate.eu/sk/platobna-brana" target="_blank" rel="noopener noreferrer" aria-label="Platobná brána Comgate – oficiálna stránka"><Image src="/comgate-payment-logos-dark.png" alt="Comgate, Visa, Mastercard, Google Pay a Apple Pay" width={550} height={50} unoptimized /></a></div>
  </footer>;
}
