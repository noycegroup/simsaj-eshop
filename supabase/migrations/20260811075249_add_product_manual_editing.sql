create table public.product_manual_overrides (
  product_id uuid primary key references public.products(id) on delete cascade,
  locked_fields text[] not null default '{}',
  updated_by text not null,
  updated_at timestamptz not null default now(),
  constraint product_manual_overrides_fields_check check (
    locked_fields <@ array['name', 'short_description', 'description', 'seo_title', 'seo_description', 'status']::text[]
  )
);

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id text not null,
  actor_email text not null,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  changes jsonb not null,
  created_at timestamptz not null default now()
);

create index admin_audit_log_entity_created_idx
  on public.admin_audit_log (entity_type, entity_id, created_at desc);

alter table public.product_manual_overrides enable row level security;
alter table public.admin_audit_log enable row level security;

revoke all on public.product_manual_overrides from anon, authenticated;
revoke all on public.admin_audit_log from anon, authenticated;
grant select, insert, update, delete on public.product_manual_overrides to service_role;
grant select, insert on public.admin_audit_log to service_role;
grant select, update on public.products to service_role;

create or replace function public.admin_update_product(
  p_product_id uuid,
  p_name text,
  p_short_description text,
  p_description text,
  p_seo_title text,
  p_seo_description text,
  p_status text,
  p_actor_id text,
  p_actor_email text
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  product_slug text;
  normalized_name text := nullif(btrim(p_name), '');
begin
  if normalized_name is null or char_length(normalized_name) > 180 then
    raise exception 'Neplatný názov produktu.';
  end if;
  if p_status not in ('draft', 'active', 'archived') then
    raise exception 'Neplatný stav produktu.';
  end if;
  if char_length(coalesce(p_seo_title, '')) > 180 or char_length(coalesce(p_seo_description, '')) > 320 then
    raise exception 'SEO údaje sú príliš dlhé.';
  end if;

  update public.products
  set
    name = normalized_name,
    short_description = nullif(btrim(p_short_description), ''),
    description = nullif(btrim(p_description), ''),
    seo_title = nullif(btrim(p_seo_title), ''),
    seo_description = nullif(btrim(p_seo_description), ''),
    status = p_status,
    published_at = case when p_status = 'active' then coalesce(published_at, now()) else published_at end,
    updated_at = now()
  where id = p_product_id
  returning slug into product_slug;

  if product_slug is null then
    raise exception 'Produkt sa nenašiel.';
  end if;

  insert into public.product_manual_overrides (product_id, locked_fields, updated_by)
  values (
    p_product_id,
    array['name', 'short_description', 'description', 'seo_title', 'seo_description', 'status'],
    p_actor_id
  )
  on conflict (product_id) do update set
    locked_fields = excluded.locked_fields,
    updated_by = excluded.updated_by,
    updated_at = now();

  insert into public.admin_audit_log (actor_id, actor_email, action, entity_type, entity_id, changes)
  values (
    p_actor_id,
    p_actor_email,
    'product.updated',
    'product',
    p_product_id,
    jsonb_build_object(
      'name', normalized_name,
      'short_description', nullif(btrim(p_short_description), ''),
      'description', nullif(btrim(p_description), ''),
      'seo_title', nullif(btrim(p_seo_title), ''),
      'seo_description', nullif(btrim(p_seo_description), ''),
      'status', p_status
    )
  );

  return product_slug;
end;
$$;

revoke all on function public.admin_update_product(uuid, text, text, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.admin_update_product(uuid, text, text, text, text, text, text, text, text) to service_role;

comment on table public.product_manual_overrides is
  'Zámky ručných redakčných úprav, ktoré partner XML import nesmie prepísať.';
comment on table public.admin_audit_log is
  'Serverová auditná stopa citlivých operácií v administrácii.';
