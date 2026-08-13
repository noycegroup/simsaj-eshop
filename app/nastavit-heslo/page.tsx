"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    if (password.length < 10) return setError("Heslo musí mať aspoň 10 znakov.");
    if (password !== confirmation) return setError("Heslá sa nezhodujú.");
    setSaving(true);
    const { error: updateError } = await createClient().auth.updateUser({ password });
    if (updateError) {
      setError("Odkaz nie je platný alebo vypršal. Požiadajte o novú pozvánku.");
      setSaving(false);
      return;
    }
    window.location.assign("/admin");
  }

  return <><SiteHeader suggestions={[]} /><main className="login-page"><section className="login-card">
    <p className="eyebrow">SIMSAJ ADMINISTRÁCIA</p><h1>Nastavenie hesla</h1><p>Dokončite aktiváciu správcovského účtu.</p>
    {error ? <p className="checkout-error" role="alert">{error}</p> : null}
    <form onSubmit={submit}><label>Nové heslo<input name="password" type="password" autoComplete="new-password" minLength={10} required /></label><label>Zopakujte heslo<input name="confirmation" type="password" autoComplete="new-password" minLength={10} required /></label><button className="button primary" type="submit" disabled={saving}>{saving ? "Ukladám…" : "Nastaviť heslo"}</button></form>
    <Link href="/prihlasenie">Späť na prihlásenie</Link>
  </section></main></>;
}
