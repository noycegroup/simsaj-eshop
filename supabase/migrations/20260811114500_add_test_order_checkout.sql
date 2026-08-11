alter table public.orders
  add column if not exists is_test boolean not null default false,
  add column if not exists shipping_method text not null default 'personal_pickup';

create index if not exists orders_is_test_created_at_idx
  on public.orders (is_test, created_at desc);

create sequence if not exists private.test_order_number_seq;

create or replace function public.create_test_order(
  p_email text,
  p_billing_address jsonb,
  p_shipping_address jsonb,
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
begin
  if p_email is null or length(trim(p_email)) < 3 or length(p_email) > 254 then
    raise exception 'Neplatný e-mail objednávky.';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 50 then
    raise exception 'Objednávka musí obsahovať 1 až 50 položiek.';
  end if;

  select round(sum((item->>'unit_price')::numeric * (item->>'quantity')::integer), 2)
    into calculated_subtotal
  from jsonb_array_elements(p_items) item
  where (item->>'quantity')::integer between 1 and 99
    and (item->>'unit_price')::numeric between 0 and 100000;

  if calculated_subtotal is null then
    raise exception 'Objednávka neobsahuje platné položky.';
  end if;

  new_order_number := 'TEST-' || to_char(timezone('UTC', now()), 'YYYYMMDD') || '-' ||
    lpad(nextval('private.test_order_number_seq')::text, 6, '0');

  insert into public.orders (
    id, order_number, email, billing_address, shipping_address, subtotal,
    shipping_total, discount_total, tax_total, grand_total, currency,
    status, payment_status, payment_method, shipping_method, customer_note,
    placed_at, is_test
  ) values (
    new_order_id, new_order_number, lower(trim(p_email)), p_billing_address,
    p_shipping_address, calculated_subtotal, 0, 0, 0, calculated_subtotal,
    'EUR', 'pending', 'not_required', 'cash_on_pickup', 'personal_pickup',
    'Nezáväzná skúšobná objednávka – bez platby a fakturácie.', now(), true
  );

  insert into public.order_items (
    order_id, product_id, variant_id, product_name, variant_name, sku,
    quantity, unit_price, line_total, vat_rate
  )
  select
    new_order_id,
    nullif(item->>'product_id', '')::uuid,
    nullif(item->>'variant_id', '')::uuid,
    left(item->>'product_name', 300),
    nullif(left(item->>'variant_name', 300), ''),
    left(item->>'sku', 120),
    (item->>'quantity')::integer,
    round((item->>'unit_price')::numeric, 2),
    round((item->>'unit_price')::numeric * (item->>'quantity')::integer, 2),
    (item->>'vat_rate')::numeric
  from jsonb_array_elements(p_items) item;

  return jsonb_build_object(
    'orderId', new_order_id,
    'orderNumber', new_order_number,
    'grandTotal', calculated_subtotal
  );
end;
$$;

revoke all on function public.create_test_order(text, jsonb, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.create_test_order(text, jsonb, jsonb, jsonb) to service_role;
grant usage, select on sequence private.test_order_number_seq to service_role;

comment on column public.orders.is_test is
  'Skúšobné objednávky sa nesmú odosielať do platieb, fakturácie ani marketingových integrácií.';
comment on function public.create_test_order(text, jsonb, jsonb, jsonb) is
  'Server-only atomické uloženie nezáväznej skúšobnej objednávky.';
