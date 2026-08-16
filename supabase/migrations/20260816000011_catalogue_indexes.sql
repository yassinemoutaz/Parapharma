-- ============================================================
-- CATALOGUE LISTING INDEXES
-- ============================================================
-- Serves the public listing queries (src/lib/db/catalogue.ts):
--   - default sort "newest" is ORDER BY created_at DESC on
--     active products — the existing products_active_idx only
--     covers the filter, not the sort;
--   - brand browse pages filter (is_active, brand_id).
-- Both are partial indexes: only active rows are ever listed
-- publicly, keeping the indexes small.
-- ============================================================

create index products_active_created_at_idx
  on public.products (is_active, created_at desc)
  where is_active;

create index products_active_brand_id_idx
  on public.products (is_active, brand_id)
  where is_active;