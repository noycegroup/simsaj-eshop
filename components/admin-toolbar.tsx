import Link from "next/link";

type AdminToolbarProps = {
  label: string;
  userName: string;
  signOutHref: string;
  backHref?: string;
  backLabel?: string;
};

export function AdminToolbar({ label, userName, signOutHref, backHref, backLabel }: AdminToolbarProps) {
  return <header className="admin-header">
    <div>
      <Link className="admin-brand" href="/admin">SIMSAJ administrácia</Link>
      <span>{label}</span>
    </div>
    <div className="admin-user">
      {backHref && backLabel ? <Link href={backHref}>← {backLabel}</Link> : null}
      <span>{userName}</span>
      <a href={signOutHref}>Odhlásiť</a>
    </div>
  </header>;
}
