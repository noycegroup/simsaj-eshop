import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { login } from "./actions";

export const metadata: Metadata = { title: "Prihlásenie do administrácie | SIMSAJ", robots: { index: false, follow: false } };
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function LoginPage({ searchParams }: Props) {
  if (await getChatGPTUser()) redirect("/admin");
  const params = await searchParams;
  const error = Array.isArray(params.chyba) ? params.chyba[0] : params.chyba;
  const returnToRaw = Array.isArray(params.return_to) ? params.return_to[0] : params.return_to;
  const returnTo = returnToRaw?.startsWith("/") && !returnToRaw.startsWith("//") ? returnToRaw : "/admin";

  return <><SiteHeader suggestions={[]} /><main className="login-page"><section className="login-card">
    <p className="eyebrow">SIMSAJ ADMINISTRÁCIA</p><h1>Prihlásenie</h1><p>Prihláste sa účtom správcu e-shopu.</p>
    {error ? <p className="checkout-error" role="alert">{error === "opravnenie" ? "Tento účet nemá oprávnenie správcu." : "Nesprávny e-mail alebo heslo."}</p> : null}
    <form action={login}><input type="hidden" name="return_to" value={returnTo} /><label>E-mail<input name="email" type="email" autoComplete="email" required /></label><label>Heslo<input name="password" type="password" autoComplete="current-password" required /></label><button className="button primary" type="submit">Prihlásiť sa</button></form>
  </section></main></>;
}
