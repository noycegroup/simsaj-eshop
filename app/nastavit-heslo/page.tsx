"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let active = true;
    async function acceptInvitation() {
      const supabase = createClient();
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = fragment.get("access_token");
      const refreshToken = fragment.get("refresh_token");
      try {
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (sessionError) throw sessionError;
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        }
        const { data } = await supabase.auth.getSession();
        if (!data.session) throw new Error("missing-session");
        if (active) setSessionReady(true);
      } catch {
        if (active) setError("Pozývací odkaz nie je platný alebo vypršal. Požiadajte o novú pozvánku.");
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
      const update = createClient().auth.updateUser({ password });
      const timeout = new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("timeout")), 12000));
      const { error: updateError } = await Promise.race([update, timeout]);
      if (updateError) throw updateError;
      window.location.assign("/admin");
    } catch {
      setError("Heslo sa nepodarilo uložiť. Skúste novú pozvánku alebo to zopakujte o chvíľu.");
      setSaving(false);
    }
  }

  return <><SiteHeader suggestions={[]} /><main className="login-page"><section className="login-card">
    <p className="eyebrow">SIMSAJ ADMINISTRÁCIA</p><h1>Nastavenie hesla</h1><p>Dokončite aktiváciu správcovského účtu.</p>
    {error ? <p className="checkout-error" role="alert">{error}</p> : null}
    <form onSubmit={submit}><label>Nové heslo<input name="password" type="password" autoComplete="new-password" minLength={10} required /></label><label>Zopakujte heslo<input name="confirmation" type="password" autoComplete="new-password" minLength={10} required /></label><button className="button primary" type="submit" disabled={saving || !sessionReady}>{saving ? "Ukladám…" : sessionReady ? "Nastaviť heslo" : "Overujem pozvánku…"}</button></form>
    <Link href="/prihlasenie">Späť na prihlásenie</Link>
  </section></main></>;
}
