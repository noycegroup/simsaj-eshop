import { NextRequest, NextResponse } from "next/server";
import { getSupabaseEnvironment } from "@/lib/supabase/env";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.nextUrl.host) {
    return NextResponse.json({ error: "Požiadavka nepochádza z tejto stránky." }, { status: 403 });
  }
  const body = await request.json().catch(() => null) as { accessToken?: unknown; password?: unknown } | null;
  const accessToken = typeof body?.accessToken === "string" ? body.accessToken : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!accessToken || password.length < 10) {
    return NextResponse.json({ error: "Odkaz alebo nové heslo nie sú platné." }, { status: 400 });
  }

  const { url, publishableKey } = getSupabaseEnvironment();
  const headers = { apikey: publishableKey, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
  const userResponse = await fetch(`${url}/auth/v1/user`, { headers, cache: "no-store", signal: AbortSignal.timeout(10000) });
  const user = await userResponse.json().catch(() => ({})) as { email?: string };
  const allowedEmails = (process.env.SIMSAJ_ADMIN_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  if (!userResponse.ok || !user.email || !allowedEmails.includes(user.email.toLowerCase())) {
    return NextResponse.json({ error: "Odkaz na nastavenie hesla nie je platný." }, { status: 403 });
  }

  const updateResponse = await fetch(`${url}/auth/v1/user`, {
    method: "PUT", headers, body: JSON.stringify({ password }), cache: "no-store", signal: AbortSignal.timeout(10000),
  });
  if (!updateResponse.ok) {
    const result = await updateResponse.json().catch(() => ({})) as { message?: string };
    return NextResponse.json({ error: result.message ?? "Heslo sa nepodarilo uložiť." }, { status: updateResponse.status });
  }
  return NextResponse.json({ updated: true });
}
