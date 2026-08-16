-- Customer profiles, linked 1:1 to auth.users.
--
-- Ownership: each row belongs to its auth user. RLS policies
-- allow users to read/update only their own row. The email is
-- denormalized from auth.users for convenient joins; it is
-- kept in sync by the signup trigger.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();