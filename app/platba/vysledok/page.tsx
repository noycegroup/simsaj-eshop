import Link from "next/link";
import { readAndPersistComgateStatus } from "@/lib/server/comgate";

export const dynamic = "force-dynamic";

export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const transId = typeof params.id === "string" ? params.id : "";
  let result: { orderNumber: string; paymentStatus: string } | null = null;
  if (transId) {
    try { result = await readAndPersistComgateStatus(transId); }
    catch (error) { console.error("Overenie platby po návrate zlyhalo.", error); }
  }
  const paid = result?.paymentStatus === "paid";
  const cancelled = result?.paymentStatus === "cancelled";
  return <main className="flow-page payment-result"><div className="checkout-success"><span>{paid ? "✓" : cancelled ? "×" : "…"}</span><p className="eyebrow">BEZPEČNÁ PLATBA COMGATE</p><h1>{paid ? "Platba bola úspešná." : cancelled ? "Platba nebola dokončená." : "Platbu ešte overujeme."}</h1>{result?.orderNumber && <p>Číslo objednávky: <strong>{result.orderNumber}</strong></p>}<p>{paid ? "Objednávku sme označili ako uhradenú." : cancelled ? "Objednávka zostáva uložená a platbu môžete skúsiť znova." : "Rozhodujúci je stav bezpečne overený priamo v Comgate."}</p><Link className="button primary" href="/produkty">Pokračovať v nákupe</Link></div></main>;
}
