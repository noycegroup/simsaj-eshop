import { NextRequest, NextResponse } from "next/server";
import { createComgatePayment, loadPaymentOrder, verifyPaymentAccessToken } from "@/lib/server/comgate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { orderId?: unknown; token?: unknown };
    if (typeof body.orderId !== "string" || typeof body.token !== "string") return NextResponse.json({ error: "Neplatná požiadavka." }, { status: 400 });
    const order = await loadPaymentOrder(body.orderId);
    if (!order) return NextResponse.json({ error: "Objednávka sa nenašla." }, { status: 404 });
    if (!order.payment_access_token_hash || !verifyPaymentAccessToken(body.token, order.payment_access_token_hash)) return NextResponse.json({ error: "Neplatné oprávnenie platby." }, { status: 403 });
    return NextResponse.json({ payment: await createComgatePayment(order) });
  } catch (error) {
    console.error("Založenie Comgate platby zlyhalo.", error);
    return NextResponse.json({ error: "Platbu sa nepodarilo založiť. Skúste to znova." }, { status: 502 });
  }
}
