create schema if not exists private;
revoke all on schema private from anon, authenticated;

create table private.suppliers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  website_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table private.supplier_feeds (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references private.suppliers(id) on delete cascade,
  feed_key text not null,
  feed_type text not null check (feed_type in ('catalog', 'inventory', 'price', 'combined')),
  format text not null default 'xml' check (format in ('xml', 'csv', 'json')),
  source_url text,
  mapping_version integer not null default 1 check (mapping_version > 0),
  is_active boolean not null default true,
  last_imported_at timestamptz,
  created_at timestamptz not null default now(),
  unique (supplier_id, feed_key)
);

create table private.feed_imports (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references private.suppliers(id) on delete cascade,
  status text not null default 'running' check (status in ('running', 'succeeded', 'failed', 'partial')),
  source_generated_at timestamptz,
  source_checksum text,
  product_count integer not null default 0 check (product_count >= 0),
  variant_count integer not null default 0 check (variant_count >= 0),
  error_count integer not null default 0 check (error_count >= 0),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  notes text
);

create table private.supplier_products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references private.suppliers(id) on delete cascade,
  external_model_id text not null,
  canonical_product_id uuid references public.products(id) on delete set null,
  name text not null,
  brand text not null,
  product_line_id text,
  product_line_name text,
  category_id text,
  category_name text,
  description text,
  image_urls text[] not null default '{}',
  product_url text,
  currency char(3),
  suggested_price numeric(12,2) check (suggested_price is null or suggested_price >= 0),
  is_complete boolean not null default false,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (supplier_id, external_model_id)
);

create table private.supplier_variants (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references private.suppliers(id) on delete cascade,
  supplier_product_id uuid not null references private.supplier_products(id) on delete cascade,
  sku text not null,
  gtin text,
  size text,
  width_code text,
  width_label text,
  quantity integer not null default 0 check (quantity >= 0),
  availability text not null check (availability in ('in_stock', 'out_of_stock', 'preorder', 'backorder')),
  price numeric(12,2) check (price is null or price >= 0),
  currency char(3),
  source_updated_at timestamptz,
  last_seen_at timestamptz not null default now(),
  unique (supplier_id, sku),
  unique (supplier_id, gtin)
);

create index supplier_feeds_supplier_idx on private.supplier_feeds(supplier_id);
create index feed_imports_supplier_started_idx on private.feed_imports(supplier_id, started_at desc);
create index supplier_products_supplier_complete_idx on private.supplier_products(supplier_id, is_complete);
create index supplier_products_canonical_idx on private.supplier_products(canonical_product_id)
  where canonical_product_id is not null;
create index supplier_variants_product_idx on private.supplier_variants(supplier_product_id);
create index supplier_variants_supplier_stock_idx on private.supplier_variants(supplier_id, availability)
  where quantity > 0;

insert into private.suppliers (code, name, website_url)
values ('diawin', 'Diawin', 'https://diawin.online')
on conflict (code) do update set
  name = excluded.name,
  website_url = excluded.website_url,
  is_active = true,
  updated_at = now();

insert into private.supplier_feeds (supplier_id, feed_key, feed_type, format, mapping_version)
select id, 'google_feed', 'catalog', 'xml', 1
from private.suppliers where code = 'diawin'
on conflict (supplier_id, feed_key) do update set
  feed_type = excluded.feed_type,
  format = excluded.format,
  mapping_version = excluded.mapping_version,
  is_active = true;

insert into private.supplier_feeds (supplier_id, feed_key, feed_type, format, mapping_version)
select id, 'inventory_feed', 'inventory', 'xml', 1
from private.suppliers where code = 'diawin'
on conflict (supplier_id, feed_key) do update set
  feed_type = excluded.feed_type,
  format = excluded.format,
  mapping_version = excluded.mapping_version,
  is_active = true;

insert into public.categories (name, slug, description, sort_order, is_active)
values (
  'Zdravotná obuv',
  'zdravotna-obuv',
  'Zdravotná obuv pre pohodlie, oporu a každodenné nosenie.',
  4,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  is_active = true,
  updated_at = now();
