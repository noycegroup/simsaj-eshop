alter table public.orders
  add column if not exists shipping_carrier text,
  add column if not exists tracking_number text,
  add column if not exists shipped_at timestamptz;

alter table public.orders drop constraint if exists orders_shipping_carrier_check;
alter table public.orders add constraint orders_shipping_carrier_check
  check (shipping_carrier is null or shipping_carrier in ('personal_pickup', 'packeta', 'sps', 'gls', 'slovak_post'));

create or replace function public.admin_update_order_shipping(
  p_order_id uuid,
  p_shipping_carrier text,
  p_tracking_number text,
  p_actor_id text,
  p_actor_email text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_order public.orders%rowtype;
  clean_tracking text := nullif(trim(p_tracking_number), '');
begin
  select * into current_order from public.orders where id = p_order_id for update;
  if current_order.id is null then raise exception 'Objednávka neexistuje.'; end if;
  if not current_order.is_test then raise exception 'Zmeny ostrých objednávok ešte nie sú povolené.'; end if;
  if p_shipping_carrier not in ('personal_pickup', 'packeta', 'sps', 'gls', 'slovak_post') then
    raise exception 'Neplatný dopravca.';
  end if;
  if p_shipping_carrier = 'personal_pickup' then clean_tracking := null; end if;
  if length(coalesce(clean_tracking, '')) > 100 then raise exception 'Sledovacie číslo je príliš dlhé.'; end if;

  update public.orders
  set shipping_carrier = p_shipping_carrier,
      tracking_number = clean_tracking,
      shipped_at = case when clean_tracking is not null then coalesce(shipped_at, now()) else null end
  where id = p_order_id;

  insert into public.admin_audit_log (entity_type, entity_id, action, actor_id, actor_email, changes)
  values ('order', p_order_id, 'order_shipping_changed', p_actor_id, lower(trim(p_actor_email)),
    jsonb_build_object(
      'shipping_carrier', jsonb_build_object('from', current_order.shipping_carrier, 'to', p_shipping_carrier),
      'tracking_number', jsonb_build_object('from', current_order.tracking_number, 'to', clean_tracking)
    ));

  return jsonb_build_object('shipping_carrier', p_shipping_carrier, 'tracking_number', clean_tracking);
end;
$$;

revoke all on function public.admin_update_order_shipping(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.admin_update_order_shipping(uuid, text, text, text, text) to service_role;

comment on function public.admin_update_order_shipping(uuid, text, text, text, text) is
  'Atomická aktualizácia dopravy skúšobnej objednávky s auditom; iba serverová rola.';
