# Decision

## Status
Accepted (2026-08-16) — implemented.

## Context
The platform needs a relational database for catalogue, carts, orders, promotions and profiles, with authentication and row-level security. Scale target: ~100 to ~10,000+ users/day; the architecture must stay simple and inexpensive initially.

## Decision
Use Supabase: managed PostgreSQL 15, accessed exclusively through its PostgREST API. The schema is versioned in `supabase/migrations/` (Supabase CLI, timestamped SQL). Supabase Auth provides accounts/sessions; Supabase Auth users are linked 1:1 to a `profiles` table. Row Level Security is enabled on every table and is the primary authorization boundary.

Schema: `profiles`, `categories` (hierarchical), `brands`, `products`, `product_images`, `product_categories` (many-to-many), `carts`, `cart_items`, `orders`, `order_items`, `promotions`. UUID primary keys, `numeric(10,2)` prices in MAD, stock as an integer on the product row. Indexes exist for the hot paths (active products, brand/category browsing, trigram + full-text search, order ownership/status/recency, active promotions) — rationale documented inline in the migrations.

## Alternatives Considered
- **Self-hosted PostgreSQL**: rejected — adds operational burden; Supabase provides managed Postgres, auth, PostgREST and RLS out of the box.
- **Another managed Postgres (Neon, RDS)**: viable, but Supabase also supplies auth + PostgREST + RLS, keeping the stack to fewer providers.
- **ORM with direct SQL migrations**: the typed data-access layer in `src/lib/db/` sits on top of PostgREST; no ORM is introduced because PostgREST already provides typed, filtered, paginated access.

## Consequences
- RLS policies in the database are the security boundary; the anon key can be exposed to the browser safely.
- Data access goes through `src/lib/db/` modules; schema changes are SQL migrations reviewed like code.
- PostgREST imposes a pagination model (range-based) — compatible with the paginated catalogue design; cursor-based pagination can be added later.
- Admin operations may use the service role key only in trusted server contexts, never in the browser.