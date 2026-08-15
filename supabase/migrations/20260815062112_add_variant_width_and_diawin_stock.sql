alter table public.product_variants
  add column if not exists width_code text,
  add column if not exists width_label text;

insert into public.product_variants
  (product_id, sku, name, price, barcode, size, width_code, width_label,
   stock_quantity, is_active, vat_rate, updated_at)
select
  sp.canonical_product_id,
  sv.sku,
  concat_ws(' · ', sp.name, nullif('veľkosť ' || sv.size, 'veľkosť '), nullif('šírka ' || sv.width_code, 'šírka ')),
  coalesce(sv.price, sp.suggested_price, 0),
  sv.gtin,
  sv.size,
  sv.width_code,
  sv.width_label,
  sv.quantity,
  sv.availability = 'in_stock' and sv.quantity > 0,
  23,
  now()
from private.supplier_variants sv
join private.supplier_products sp on sp.id = sv.supplier_product_id
join private.suppliers supplier on supplier.id = sv.supplier_id
where supplier.code = 'diawin'
  and sp.canonical_product_id is not null
on conflict (sku) do update set
  product_id = excluded.product_id,
  name = excluded.name,
  barcode = excluded.barcode,
  size = excluded.size,
  width_code = excluded.width_code,
  width_label = excluded.width_label,
  stock_quantity = excluded.stock_quantity,
  is_active = excluded.is_active,
  updated_at = now();
