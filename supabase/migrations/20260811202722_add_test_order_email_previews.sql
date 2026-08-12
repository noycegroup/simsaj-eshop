create table if not exists public.order_email_notifications (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  audience text not null check (audience in ('customer', 'admin')),
  recipient_email text,
  subject text not null,
  body_text text not null,
  status text not null default 'draft' check (status in ('draft', 'queued', 'sending', 'sent', 'failed', 'skipped')),
  provider_message_id text,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, audience)
);

alter table public.order_email_notifications enable row level security;
revoke all on table public.order_email_notifications from public, anon, authenticated;
grant select, insert, update on table public.order_email_notifications to service_role;

create policy "No public access to order email notifications"
on public.order_email_notifications for select
to anon, authenticated
using (false);

create index if not exists order_email_notifications_status_created_idx
  on public.order_email_notifications (status, created_at desc);

create or replace function public.prepare_test_order_email_previews()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  customer_name text := coalesce(nullif(trim(new.shipping_address->>'name'), ''), 'zákazník');
  shipping_label text := case new.shipping_method
    when 'packeta' then 'Packeta – výdajné miesto alebo Z-BOX'
    when 'gls' then 'Kuriér GLS na adresu'
    else 'Osobný odber v kamennej predajni SIMSAJ, 17. novembra 1300, Partizánske'
  end;
begin
  if not new.is_test then return new; end if;

  insert into public.order_email_notifications (order_id, audience, recipient_email, subject, body_text)
  values
    (new.id, 'customer', new.email, 'Prijali sme skúšobnú objednávku ' || new.order_number,
      'Dobrý deň ' || customer_name || E',\n\nprijali sme vašu nezáväznú skúšobnú objednávku ' || new.order_number || E'.\nDoprava: ' || shipping_label || E'.\nSpolu: ' || to_char(new.grand_total, 'FM999999990.00') || E' EUR.\n\nPlatba, fakturácia ani expedícia neboli spustené.\n\nSIMSAJ – pre vaše nohy'),
    (new.id, 'admin', null, 'Nová skúšobná objednávka ' || new.order_number,
      'V administrácii je nová skúšobná objednávka ' || new.order_number || E'.\nZákazník: ' || customer_name || E'\nE-mail: ' || new.email || E'\nDoprava: ' || shipping_label || E'\nSpolu: ' || to_char(new.grand_total, 'FM999999990.00') || ' EUR.')
  on conflict (order_id, audience) do nothing;

  return new;
end;
$$;

revoke all on function public.prepare_test_order_email_previews() from public, anon, authenticated;

drop trigger if exists prepare_test_order_email_previews_after_insert on public.orders;
create trigger prepare_test_order_email_previews_after_insert
after insert on public.orders
for each row execute function public.prepare_test_order_email_previews();

insert into public.order_email_notifications (order_id, audience, recipient_email, subject, body_text)
select o.id, 'customer', o.email, 'Prijali sme skúšobnú objednávku ' || o.order_number,
  'Dobrý deň ' || coalesce(nullif(trim(o.shipping_address->>'name'), ''), 'zákazník') || E',\n\nprijali sme vašu nezáväznú skúšobnú objednávku ' || o.order_number || E'.\n\nPlatba, fakturácia ani expedícia neboli spustené.\n\nSIMSAJ – pre vaše nohy'
from public.orders o where o.is_test
on conflict (order_id, audience) do nothing;

insert into public.order_email_notifications (order_id, audience, recipient_email, subject, body_text)
select o.id, 'admin', null, 'Nová skúšobná objednávka ' || o.order_number,
  'V administrácii je nová skúšobná objednávka ' || o.order_number || E'.\nZákazník: ' || coalesce(nullif(trim(o.shipping_address->>'name'), ''), 'zákazník') || E'\nE-mail: ' || o.email
from public.orders o where o.is_test
on conflict (order_id, audience) do nothing;

comment on table public.order_email_notifications is
  'Transakčné e-mailové záznamy; skúšobné objednávky zostávajú v stave draft a nesmú sa odoslať.';
