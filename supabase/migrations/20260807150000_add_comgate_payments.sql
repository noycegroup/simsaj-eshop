alter table public.orders
  add column if not exists payment_method text not null default 'bank_transfer',
  add column if not exists payment_status_updated_at timestamptz,
  add column if not exists payment_paid_at timestamptz,
  add column if not exists payment_access_token_hash text,
  add column if not exists comgate_trans_id text,
  add column if not exists comgate_redirect_url text,
  add column if not exists comgate_last_status_response jsonb;

alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check check (payment_status in ('not_required', 'pending', 'paid', 'cancelled', 'authorized', 'refunded'));
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check check (payment_method in ('bank_transfer', 'cash_on_delivery', 'cash_on_pickup', 'comgate'));

create unique index if not exists orders_comgate_trans_id_unique on public.orders (comgate_trans_id) where comgate_trans_id is not null;
create index if not exists orders_payment_status_idx on public.orders (payment_status, created_at desc);
comment on column public.orders.payment_access_token_hash is 'SHA-256 odtlačok jednorazového tokenu; samotný token sa do databázy neukladá.';
