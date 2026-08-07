create or replace view public.admin_product_feed_catalog
with (security_invoker = true)
as
select
  p.id,
  p.name,
  p.slug,
  p.brand,
  p.status,
  sp.supplier_reference as model,
  pi.storage_path as image_url,
  prices.customer_price,
  prices.purchase_price,
  p.updated_at
from public.products p
left join private.supplier_products sp on sp.canonical_product_id = p.id
left join lateral (
  select i.storage_path
  from public.product_images i
  where i.product_id = p.id
  order by i.sort_order, i.id
  limit 1
) pi on true
left join lateral (
  select
    min(coalesce(sv.retail_price_tax_incl, pv.price)) as customer_price,
    min(sv.wholesale_price_tax_incl) as purchase_price
  from public.product_variants pv
  left join private.supplier_variants sv on sv.sku = pv.sku
  where pv.product_id = p.id
) prices on true;

revoke all on public.admin_product_feed_catalog from anon, authenticated;
revoke all on public.admin_product_feed_catalog from service_role;
grant select on public.admin_product_feed_catalog to service_role;

comment on view public.admin_product_feed_catalog is
  'Server-only prehľad administrácie. Nákupná cena nie je dostupná verejnému Data API klientovi.';
