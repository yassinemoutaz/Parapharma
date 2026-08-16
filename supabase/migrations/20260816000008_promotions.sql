-- Order-level promotions (discount codes applied at checkout).
-- Product-level promotional pricing lives on products.promotional_price.

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  type text not null check (type in ('percentage', 'fixed_amount')),
  value numeric(10, 2) not null check (value > 0),
  min_order_amount numeric(10, 2) check (min_order_amount >= 0),
  starts_at timestamptz not null default now(),
  ends_at timestamptz check (ends_at is null or ends_at > starts_at),
  is_active boolean not null default true,
  usage_limit integer check (usage_limit is null or usage_limit >= 0),
  times_used integer not null default 0 check (times_used >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Checkout validation: find active promotions by code.
create index promotions_active_idx
  on public.promotions (is_active)
  where is_active;

create trigger promotions_set_updated_at
  before update on public.promotions
  for each row
  execute function public.set_updated_at();