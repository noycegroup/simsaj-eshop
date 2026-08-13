"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/client";

function withTimeout<T>(operation: PromiseLike<T>, milliseconds = 8000) {
  return Promise.race<T>([
    Promise.resolve(operation),
    new Promise<T>((_, reject) => window.setTimeout(() => reject(new Error("timeout")), milliseconds)),
  ]);
}

export default function SetPasswordPage() {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("office@noyce.sk");
  const [sendingRecovery, setSendingRecovery] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);

  useEffect(() => {
    let active = true;
    async function acceptInvitation() {
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const authError = fragment.get("error");
      const authErrorCode = fragment.get("error_code");
      const accessToken = fragment.get("access_token");
      const refreshToken = fragment.get("refresh_token");
      try {
        if (authError || authErrorCode) {
          window.history.replaceState(null, "", window.location.pathname);
          throw new Error(authErrorCode || authError || "invalid-auth-link");
        }
        if (!accessToken || !refreshToken) {
          if (active) {
            setLinkInvalid(true);
            setError("Na nastavenie hesla potrebujete platný odkaz z e-mailu. Vyžiadajte si nový odkaz.");
          }
          return;
        }
        const supabase = createClient();
        const { error: sessionError } = await withTimeout(supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }));
        if (sessionError) throw sessionError;
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
        const { data } = await withTimeout(supabase.auth.getSession());
        if (!data.session) throw new Error("missing-session");
        if (active) setSessionReady(true);
      } catch {
        if (active) {
          setLinkInvalid(true);
          setError("Odkaz na nastavenie hesla je neplatný, už bol použitý alebo vypršal. Vyžiadajte si nový odkaz.");
        }
      }
    }
    void acceptInvitation();
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    if (password.length < 10) return setError("Heslo musí mať aspoň 10 znakov.");
    if (password !== confirmation) return setError("Heslá sa nezhodujú.");
    if (!sessionReady) return setError("Pozývací odkaz ešte nie je pripravený alebo už vypršal.");
    setSaving(true);
    try {
      const { error: updateError } = await withTimeout(createClient().auth.updateUser({ password }), 12000);
      if (updateError) throw updateError;
      window.location.assign("/admin");
    } catch {
      setError("Heslo sa nepodarilo uložiť. Skúste novú pozvánku alebo to zopakujte o chvíľu.");
      setSaving(false);
    }
  }

  async function requestRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSendingRecovery(true);
    setRecoverySent(false);
    try {
      const { error: recoveryError } = await withTimeout(createClient().auth.resetPasswordForEmail(recoveryEmail.trim(), {
        redirectTo: `${window.location.origin}/nastavit-heslo`,
      }), 12000);
      if (recoveryError) throw recoveryError;
      setRecoverySent(true);
    } catch {
      setError("Nový odkaz sa nepodarilo odoslať. Počkajte chvíľu a skúste to znova.");
    } finally {
      setSendingRecovery(false);
    }
  }

  return <><SiteHeader suggestions={[]} /><main className="login-page"><section className="login-card">
    <p className="eyebrow">SIMSAJ ADMINISTRÁCIA</p><h1>Nastavenie hesla</h1><p>Dokončite aktiváciu správcovského účtu.</p>
    {error ? <p className="checkout-error" role="alert">{error}</p> : null}
    {linkInvalid ? <form onSubmit={requestRecovery}><label>E-mail<input value={recoveryEmail} onChange={(event) => setRecoveryEmail(event.target.value)} type="email" autoComplete="email" required /></label><button className="button primary" type="submit" disabled={sendingRecovery}>{sendingRecovery ? "Odosielam…" : "Poslať nový odkaz"}</button>{recoverySent ? <p className="admin-message" role="status">Nový odkaz bol odoslaný. Otvorte iba najnovší e-mail.</p> : null}</form> : <form onSubmit={submit}><label>Nové heslo<input name="password" type="password" autoComplete="new-password" minLength={10} required /></label><label>Zopakujte heslo<input name="confirmation" type="password" autoComplete="new-password" minLength={10} required /></label><button className="button primary" type="submit" disabled={saving || !sessionReady}>{saving ? "Ukladám…" : sessionReady ? "Nastaviť heslo" : "Overujem odkaz…"}</button></form>}
    <Link href="/prihlasenie">Späť na prihlásenie</Link>
  </section></main></>;
}
