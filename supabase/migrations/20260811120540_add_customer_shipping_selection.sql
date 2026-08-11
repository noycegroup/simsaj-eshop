alter table public.orders
  add column if not exists packeta_point_id text,
  add column if not exists packeta_point_name text,
  add column if not exists packeta_point_place text,
  add column if not exists packeta_point_city text,
  add column if not exists packeta_point_zip text,
  add column if not exists packeta_point_country text,
  add column if not exists packeta_point_data jsonb;

create index if not exists orders_packeta_point_id_idx on public.orders (packeta_point_id) where packeta_point_id is not null;

create or replace function public.create_test_order(
  p_email text,
  p_billing_address jsonb,
  p_shipping_address jsonb,
  p_shipping_method text,
  p_packeta_point jsonb,
  p_items jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_order_id uuid := gen_random_uuid();
  new_order_number text;
  calculated_subtotal numeric(12,2);
  point_id text;
begin
  if p_email is null or length(trim(p_email)) < 3 or length(p_email) > 254 then raise exception 'Neplatný e-mail objednávky.'; end if;
  if p_shipping_method not in ('personal_pickup', 'packeta', 'gls') then raise exception 'Neplatný spôsob dopravy.'; end if;
  if p_shipping_method = 'packeta' then
    point_id := nullif(trim(p_packeta_point->>'id'), '');
    if point_id is null or length(point_id) > 40 or nullif(trim(p_packeta_point->>'name'), '') is null then
      raise exception 'Chýba výdajné miesto Packety.';
    end if;
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 50 then raise exception 'Objednávka musí obsahovať 1 až 50 položiek.'; end if;

  select round(sum((item->>'unit_price')::numeric * (item->>'quantity')::integer), 2) into calculated_subtotal
  from jsonb_array_elements(p_items) item
  where (item->>'quantity')::integer between 1 and 99 and (item->>'unit_price')::numeric between 0 and 100000;
  if calculated_subtotal is null then raise exception 'Objednávka neobsahuje platné položky.'; end if;

  new_order_number := 'TEST-' || to_char(timezone('UTC', now()), 'YYYYMMDD') || '-' || lpad(nextval('private.test_order_number_seq')::text, 6, '0');
  insert into public.orders (
    id, order_number, email, billing_address, shipping_address, subtotal, shipping_total, discount_total, tax_total, grand_total,
    currency, status, payment_status, payment_method, shipping_method, shipping_carrier, customer_note, placed_at, is_test,
    packeta_point_id, packeta_point_name, packeta_point_place, packeta_point_city, packeta_point_zip, packeta_point_country, packeta_point_data
  ) values (
    new_order_id, new_order_number, lower(trim(p_email)), p_billing_address, p_shipping_address, calculated_subtotal, 0, 0, 0, calculated_subtotal,
    'EUR', 'pending', 'not_required', 'cash_on_pickup', p_shipping_method,
    case p_shipping_method when 'gls' then 'gls' when 'packeta' then 'packeta' else 'personal_pickup' end,
    'Nezáväzná skúšobná objednávka – bez platby a fakturácie.', now(), true,
    case when p_shipping_method = 'packeta' then point_id end,
    case when p_shipping_method = 'packeta' then left(p_packeta_point->>'name', 200) end,
    case when p_shipping_method = 'packeta' then left(p_packeta_point->>'place', 200) end,
    case when p_shipping_method = 'packeta' then left(p_packeta_point->>'city', 100) end,
    case when p_shipping_method = 'packeta' then left(p_packeta_point->>'zip', 20) end,
    case when p_shipping_method = 'packeta' then left(lower(p_packeta_point->>'country'), 10) end,
    case when p_shipping_method = 'packeta' then p_packeta_point end
  );

  insert into public.order_items (order_id, product_id, variant_id, product_name, variant_name, sku, quantity, unit_price, line_total, vat_rate)
  select new_order_id, nullif(item->>'product_id', '')::uuid, nullif(item->>'variant_id', '')::uuid, left(item->>'product_name', 300),
    nullif(left(item->>'variant_name', 300), ''), left(item->>'sku', 120), (item->>'quantity')::integer,
    round((item->>'unit_price')::numeric, 2), round((item->>'unit_price')::numeric * (item->>'quantity')::integer, 2), (item->>'vat_rate')::numeric
  from jsonb_array_elements(p_items) item;

  return jsonb_build_object('orderId', new_order_id, 'orderNumber', new_order_number, 'grandTotal', calculated_subtotal, 'shippingMethod', p_shipping_method);
end;
$$;

revoke all on function public.create_test_order(text, jsonb, jsonb, text, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.create_test_order(text, jsonb, jsonb, text, jsonb, jsonb) to service_role;

comment on column public.orders.packeta_point_data is 'Údaje výdajného miesta vrátené Packeta widgetom pre expedíciu a audit.';
