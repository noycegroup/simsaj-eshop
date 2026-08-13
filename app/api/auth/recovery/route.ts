import { NextRequest, NextResponse } from "next/server";
import { getSupabaseEnvironment } from "@/lib/supabase/env";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.nextUrl.host) {
    return NextResponse.json({ error: "Požiadavka nepochádza z tejto stránky." }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as { email?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const allowedEmails = (process.env.SIMSAJ_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  if (!email || !allowedEmails.includes(email)) {
    return NextResponse.json({ error: "Tento e-mail nemá oprávnenie správcu." }, { status: 403 });
  }

  const { url, publishableKey } = getSupabaseEnvironment();
  const redirectTo = `${request.nextUrl.origin}/nastavit-heslo`;
  const response = await fetch(`${url}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
    method: "POST",
    headers: { apikey: publishableKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json().catch(() => ({})) as { code?: string; error_code?: string; message?: string };
  if (!response.ok) {
    const code = result.code ?? result.error_code;
    if (response.status === 429 || code === "over_email_send_rate_limit") {
      return NextResponse.json({ error: "Obnovovací e-mail už bol nedávno odoslaný. Počkajte aspoň 60 sekúnd." }, { status: 429 });
    }
    return NextResponse.json({ error: result.message ?? "Obnovovací e-mail sa nepodarilo odoslať." }, { status: response.status });
  }
  return NextResponse.json({ sent: true });
}
