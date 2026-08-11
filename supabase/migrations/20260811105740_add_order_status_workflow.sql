create or replace function public.admin_update_order_status(
  p_order_id uuid,
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
  current_status text;
  test_order boolean;
begin
  select status, is_test into current_status, test_order
  from public.orders
  where id = p_order_id
  for update;

  if current_status is null then raise exception 'Objednávka neexistuje.'; end if;
  if not test_order then raise exception 'Zmeny ostrých objednávok ešte nie sú povolené.'; end if;
  if not (
    (current_status = 'pending' and p_status in ('confirmed', 'cancelled')) or
    (current_status = 'confirmed' and p_status in ('processing', 'cancelled')) or
    (current_status = 'processing' and p_status in ('completed', 'cancelled'))
  ) then raise exception 'Táto zmena stavu nie je povolená.'; end if;

  update public.orders set status = p_status where id = p_order_id;
  insert into public.admin_audit_log (entity_type, entity_id, action, actor_id, actor_email, changes)
  values ('order', p_order_id, 'order_status_changed', p_actor_id, lower(trim(p_actor_email)),
    jsonb_build_object('status', jsonb_build_object('from', current_status, 'to', p_status)));

  return p_status;
end;
$$;

revoke all on function public.admin_update_order_status(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.admin_update_order_status(uuid, text, text, text) to service_role;

comment on function public.admin_update_order_status(uuid, text, text, text) is
  'Atomická zmena stavu skúšobnej objednávky s povinným auditným záznamom; iba serverová rola.';
