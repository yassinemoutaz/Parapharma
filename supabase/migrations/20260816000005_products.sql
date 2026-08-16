-- Product catalogue: products, product images, product-category links.
--
-- Prices are numeric(10,2) (Moroccan Dirhams). Stock lives on
-- the product row; a dedicated stock-movement table can be
-- introduced later if audit history is required.
--
-- search_vector materializes a simple full-text vector over
-- name + description (GIN indexed) as the future evolution of
-- search; trigram indexes already serve fast ILIKE search.

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sku text unique,
  brand_id uuid references public.brands (id) on delete set null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  promotional_price numeric(10, 2) check (
    promotional_price is null
    or (promotional_price >= 0 and promotional_price < price)
  ),
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  search_vector tsvector generated always as (
    to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, ''))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Catalogue listing: only active products are shown publicly.
create index products_active_idx
  on public.products (is_active)
  where is_active;

-- Brand browse pages.
create index products_brand_id_idx
  on public.products (brand_id);

-- Case-insensitive partial product-name search.
create index products_name_trgm_idx
  on public.products
  using gin (name gin_trgm_ops);

-- Full-text search (evolution path for the search feature).
create index products_search_idx
  on public.products
  using gin (search_vector);

create trigger products_set_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

-- Product images: metadata only. The binary lives in R2;
-- r2_key is the object key. The public URL is derived from
-- NEXT_PUBLIC_R2_PUBLIC_URL at runtime.
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  r2_key text not null unique,
  position integer not null default 0,
  alt_text text,
  created_at timestamptz not null default now(),
  constraint product_images_position_unique unique (product_id, position)
);

create index product_images_product_id_idx
  on public.product_images (product_id);

-- Many-to-many links between products and categories
-- (a product can belong to several categories).
create table public.product_categories (
  product_id uuid not null references public.products (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (product_id, category_id)
);

create index product_categories_category_id_idx
  on public.product_categories (category_id);