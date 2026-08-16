-- Shared functions used by triggers and RLS policies.

-- Sets updated_at = now() on row updates.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Returns true when the current authenticated user is an
-- administrator. SECURITY DEFINER bypasses RLS so the check
-- itself can never be blocked by a policy.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_admin = true
  );
$$;

-- Creates a profile row (and a cart) when a user signs up.
-- Runs as the table owner, bypassing RLS.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);

  insert into public.carts (user_id)
  values (new.id);

  return new;
end;
$$;

-- Wire the auth hook up after all referenced tables exist.
-- (Tables are created in later migrations; the trigger is
-- attached in the row level security migration.)