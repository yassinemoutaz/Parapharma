-- Catalogue taxonomy: categories (hierarchical) and brands.

-- Categories support a parent/child hierarchy (e.g.
-- Soins -> Visage). image_key references an R2 object;
-- the public URL is derived from configuration, never
-- hard-coded.
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  parent_id uuid references public.categories (id) on delete set null,
  image_key text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_no_self_parent check (parent_id <> id)
);

create index categories_active_idx
  on public.categories (is_active)
  where is_active;

create trigger categories_set_updated_at
  before update on public.categories
  for each row
  execute function public.set_updated_at();

-- Brands (CeraVe, Avène, La Roche-Posay, ...).
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  logo_key text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index brands_active_idx
  on public.brands (is_active)
  where is_active;

create trigger brands_set_updated_at
  before update on public.brands
  for each row
  execute function public.set_updated_at();