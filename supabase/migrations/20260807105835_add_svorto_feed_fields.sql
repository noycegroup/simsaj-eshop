alter table private.supplier_products
  add column if not exists supplier_reference text,
  add column if not exists vat_rate numeric(5,2),
  add column if not exists features jsonb not null default '[]'::jsonb;

alter table private.supplier_variants
  add column if not exists wholesale_price_tax_incl numeric(12,2),
  add column if not exists wholesale_price_tax_excl numeric(12,2),
  add column if not exists retail_price_tax_incl numeric(12,2),
  add column if not exists retail_price_tax_excl numeric(12,2),
  add column if not exists stock_band text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'supplier_products_vat_rate_check') then
    alter table private.supplier_products add constraint supplier_products_vat_rate_check
      check (vat_rate is null or vat_rate between 0 and 100);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'supplier_variants_svorto_prices_check') then
    alter table private.supplier_variants add constraint supplier_variants_svorto_prices_check
      check (
        (wholesale_price_tax_incl is null or wholesale_price_tax_incl >= 0) and
        (wholesale_price_tax_excl is null or wholesale_price_tax_excl >= 0) and
        (retail_price_tax_incl is null or retail_price_tax_incl >= 0) and
        (retail_price_tax_excl is null or retail_price_tax_excl >= 0)
      );
  end if;
end $$;
