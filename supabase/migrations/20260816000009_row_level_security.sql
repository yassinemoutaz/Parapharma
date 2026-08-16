-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- Security model (three roles):
--   public       : unauthenticated visitors — read public catalogue only
--   authenticated: signed-in customers — own profile, own cart, own orders
--   admin        : profiles.is_admin = true — full administrative access
--
-- The database is the security boundary. API keys used in the
-- browser (anon key) are safe because RLS restricts every row.
-- Administrative write access is gated by public.is_admin(),
-- a SECURITY DEFINER helper that bypasses RLS for the check.
-- ============================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_categories enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.promotions enable row level security;

-- ------------------------------------------------------------
-- profiles
-- Users read and update their own profile. The WITH CHECK
-- prevents a user from granting themselves is_admin. Admins
-- have full access via the is_admin() policy.
-- ------------------------------------------------------------
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and is_admin = false);

create policy "profiles_admin_all"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- categories / brands
-- Public: active rows are readable. Admin: full write access.
-- ------------------------------------------------------------
create policy "categories_select_active"
  on public.categories for select
  using (is_active = true);

create policy "categories_admin_write"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "brands_select_active"
  on public.brands for select
  using (is_active = true);

create policy "brands_admin_write"
  on public.brands for all
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- products
-- Public: active products only. Admin: full access (including
-- inactive products for the back-office).
-- ------------------------------------------------------------
create policy "products_select_active"
  on public.products for select
  using (is_active = true);

create policy "products_admin_all"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- product_images / product_categories
-- Readable publicly (they belong to public products), written
-- only by admins.
-- ------------------------------------------------------------
create policy "product_images_select_public"
  on public.product_images for select
  using (true);

create policy "product_images_admin_write"
  on public.product_images for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_categories_select_public"
  on public.product_categories for select
  using (true);

create policy "product_categories_admin_write"
  on public.product_categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- carts / cart_items
-- Strictly private: only the owner can read or modify their
-- own cart. Cart items are protected through the cart.
-- ------------------------------------------------------------
create policy "carts_owner_all"
  on public.carts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "cart_items_owner_all"
  on public.cart_items for all
  using (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- orders / order_items
-- Customers: read and create their own orders. They cannot
-- modify them (status changes are administrative). Admins:
-- full access for order management.
-- ------------------------------------------------------------
create policy "orders_select_own"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "orders_insert_own"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "orders_admin_all"
  on public.orders for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "order_items_select_own"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "order_items_insert_own"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "order_items_admin_all"
  on public.order_items for all
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- promotions
-- Public: active promotions readable (needed to validate a
-- discount code at checkout). Admin: full management.
-- ------------------------------------------------------------
create policy "promotions_select_active"
  on public.promotions for select
  using (is_active = true);

create policy "promotions_admin_write"
  on public.promotions for all
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- Auth hook: create profile + cart at signup.
-- ------------------------------------------------------------
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();