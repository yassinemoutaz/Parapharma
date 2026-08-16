-- ============================================================
-- ATOMIC CHECKOUT
-- ============================================================
-- Order creation must never trust the browser:
--   - totals are computed exclusively from database rows
--     (products.promotional_price / products.price);
--   - stock is decremented atomically (no read-modify-write);
--   - promotions are validated against their validity window
--     and usage limit inside the same transaction;
--   - everything runs in one transaction: any failure rolls
--     back the whole order.
--
-- Orders/order_items direct INSERT policies are removed: the
-- only way for a customer to create an order is the
-- place_order() function.
-- ============================================================

-- ------------------------------------------------------------
-- decrement_stock: atomic stock reduction with a guard.
-- Returns true when stock was decremented, false when the
-- product is missing or has insufficient stock. No application
-- code ever does SELECT stock -> stock - 1 -> UPDATE.
-- Restricted to the service role: regular users never call it
-- directly (place_order is the customer entry point).
-- ------------------------------------------------------------
create or replace function public.decrement_stock(
  p_product_id uuid,
  p_quantity integer
)
returns boolean
language sql
security definer
set search_path = public
as $$
  update public.products
     set stock = stock - p_quantity,
         updated_at = now()
   where id = p_product_id
     and stock >= p_quantity
  returning true;
$$;

revoke all on function public.decrement_stock(uuid, integer) from public;
grant execute on function public.decrement_stock(uuid, integer) to service_role;

-- ------------------------------------------------------------
-- place_order: customer checkout, executed inside one
-- transaction. SECURITY DEFINER bypasses RLS, so every input
-- is re-validated here (nothing can be trusted from the JWT
-- caller beyond auth.uid() itself):
--   - auth.uid() must exist (authenticated caller);
--   - the cart must belong to auth.uid() (a user can never
--     place an order for another user);
--   - prices come from the products table, never from input;
--   - stock is decremented atomically per line;
--   - the promotion (when provided) must be active, inside its
--     window, respect min_order_amount and usage_limit;
--   - the order and its snapshot items are written, the
--     promotion counter is incremented, and the cart is
--     cleared — all or nothing.
-- ------------------------------------------------------------
create or replace function public.place_order(
  p_shipping_address jsonb,
  p_promotion_code text default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_cart_id uuid;
  v_subtotal numeric(10, 2) := 0;
  v_discount numeric(10, 2) := 0;
  v_total numeric(10, 2);
  v_order_id uuid;
  v_promotion_id uuid;
  v_item record;
  v_unit_price numeric(10, 2);
  v_updated integer;
begin
  if v_uid is null then
    raise exception 'authentification requise';
  end if;

  if p_shipping_address is null then
    raise exception 'adresse de livraison requise';
  end if;

  select id into v_cart_id
    from public.carts
   where user_id = v_uid;

  if v_cart_id is null then
    raise exception 'aucun panier pour cet utilisateur';
  end if;

  -- Iterate over the cart lines, validating product availability,
  -- computing prices from the database and decrementing stock
  -- atomically. Any failure aborts the whole transaction.
  for v_item in
    select ci.product_id, ci.quantity, p.name, p.price, p.promotional_price
      from public.cart_items ci
      join public.products p on p.id = ci.product_id
     where ci.cart_id = v_cart_id
  loop
    if not v_item.is_active then
      raise exception 'produit indisponible: %', v_item.product_id;
    end if;

    if not public.decrement_stock(v_item.product_id, v_item.quantity) then
      raise exception 'stock insuffisant: %', v_item.name;
    end if;

    v_unit_price := coalesce(v_item.promotional_price, v_item.price);
    v_subtotal := v_subtotal + v_unit_price * v_item.quantity;
  end loop;

  if v_subtotal = 0 then
    raise exception 'panier vide';
  end if;

  -- Promotion: active, inside its validity window, within its
  -- usage limit, and respecting min_order_amount.
  if p_promotion_code is not null then
    select id into v_promotion_id
      from public.promotions
     where code = p_promotion_code
       and is_active = true
       and starts_at <= now()
       and (ends_at is null or ends_at > now())
       and (usage_limit is null or times_used < usage_limit)
       and (min_order_amount is null or v_subtotal >= min_order_amount);

    if v_promotion_id is null then
      raise exception 'code promotion invalide ou expire';
    end if;

    select case
             when type = 'percentage' then least(round(v_subtotal * value / 100, 2), v_subtotal)
             else least(value, v_subtotal)
           end
      into v_discount
      from public.promotions
     where id = v_promotion_id;
  end if;

  v_total := v_subtotal - v_discount;

  insert into public.orders (
    user_id, status, currency, subtotal, shipping_cost, discount, total,
    shipping_address, notes
  )
  values (
    v_uid, 'pending', 'MAD', v_subtotal, 0, v_discount, v_total,
    p_shipping_address, p_notes
  )
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, product_name, unit_price, quantity)
  select v_order_id, ci.product_id, p.name,
         coalesce(p.promotional_price, p.price), ci.quantity
    from public.cart_items ci
    join public.products p on p.id = ci.product_id
   where ci.cart_id = v_cart_id;

  -- Atomic usage counter: two concurrent checkouts cannot both
  -- consume the last remaining use.
  if v_promotion_id is not null then
    update public.promotions
       set times_used = times_used + 1,
           updated_at = now()
     where id = v_promotion_id
       and (usage_limit is null or times_used < usage_limit);

    get diagnostics v_updated = row_count;
    if v_updated = 0 then
      raise exception 'code promotion epuise';
    end if;
  end if;

  delete from public.cart_items where cart_id = v_cart_id;

  return v_order_id;
end;
$$;

revoke all on function public.place_order(jsonb, text, text) from public;
grant execute on function public.place_order(jsonb, text, text) to authenticated;

-- ------------------------------------------------------------
-- Remove the direct INSERT paths: orders can now only be
-- created through place_order() (or by admins / service role).
-- ------------------------------------------------------------
drop policy if exists "orders_insert_own" on public.orders;
drop policy if exists "order_items_insert_own" on public.order_items;