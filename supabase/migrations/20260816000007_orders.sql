-- Orders and order items.
--
-- Orders are owned by a user and are private to them (RLS).
-- Order items snapshot the product name and unit price at
-- purchase time so the order history stays intact even if a
-- product is later edited or deleted.
--
-- Totals are stored (not computed on read): subtotal,
-- shipping_cost, discount and total are written once by the
-- server during checkout.

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete restrict,
  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
  ),
  currency text not null default 'MAD',
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  shipping_cost numeric(10, 2) not null default 0 check (shipping_cost >= 0),
  discount numeric(10, 2) not null default 0 check (discount >= 0),
  total numeric(10, 2) not null check (total >= 0),
  shipping_address jsonb not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Order history pages (per user).
create index orders_user_id_idx
  on public.orders (user_id);

-- Back-office filtering by status.
create index orders_status_idx
  on public.orders (status);

-- Recent orders / admin listing.
create index orders_created_at_idx
  on public.orders (created_at desc);

create trigger orders_set_updated_at
  before update on public.orders
  for each row
  execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  constraint order_items_order_product_unique unique (order_id, product_id)
);

create index order_items_order_id_idx
  on public.order_items (order_id);