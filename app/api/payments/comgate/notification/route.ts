import { NextRequest, NextResponse } from "next/server";
import { readAndPersistComgateStatus } from "@/lib/server/comgate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const merchant = String(form.get("merchant") || "");
    const transId = String(form.get("transId") || form.get("id") || "");
    if (!transId || merchant !== process.env.COMGATE_MERCHANT?.trim()) return new NextResponse("Invalid notification", { status: 400 });
    await readAndPersistComgateStatus(transId);
    return new NextResponse("OK", { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (error) {
    console.error("Spracovanie Comgate notifikácie zlyhalo.", error);
    return new NextResponse("Notification processing failed", { status: 500 });
  }
}
