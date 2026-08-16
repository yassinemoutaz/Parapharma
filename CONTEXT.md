# System Context

## Architecture
Modular monolithic e-commerce application: Next.js (App Router, TypeScript) deployed on Cloudflare Workers via the OpenNext adapter, with Supabase (PostgreSQL + Auth + RLS) as the data and security layer, and Cloudflare R2 as the object store for media.

## Architecture Diagram

```
                         USER
                           │
                           ▼
                      CLOUDFLARE
                 ┌─────────┼─────────┐
                 │         │         │
                 ▼         ▼         ▼
               CDN      SECURITY    DNS
                 │
                 ▼
          NEXT.JS (deployed as a
          Cloudflare Worker via
          the OpenNext adapter)
                 │
          ┌──────┴─────────┐
          │                │
          ▼                ▼
      SUPABASE          R2 STORAGE
          │                │
          ▼                ▼
      PostgreSQL        Product Images
      Auth              Media
      RLS
```

Notes on the conceptual model → implementation mapping:
- "Cloudflare Hosting" is implemented as a Cloudflare Worker produced by the OpenNext adapter from the Next.js build. There is no separate Worker in front of the application; the application IS the Worker.
- Static assets (`.open-next/assets`) are served directly by Cloudflare's asset serving.
- A Worker/Route is added in front only when a concrete purpose exists (e.g. payment webhooks, image processing, security-sensitive logic). A simple database read goes directly Next.js → Supabase, without an intermediary Worker.

## Application Layers
1. **Routes** (`src/app/`) — Next.js App Router pages and route handlers. App chrome lives in `src/app/_layout/` (marquee, navbar, mobile menu, footer); home sections in `src/app/_sections/`.
2. **Components** (`src/components/`) — reusable UI components (`ui/` design-system primitives, `product/`, `search/`).
3. **Data access** (`src/lib/db/`) — typed queries against Supabase (PostgREST), paginated.
4. **Frontend data seam** (`src/lib/data/`) — the contract pages and the search API consume (`catalogue.ts`). It currently re-exports an isolated mock (`mock/`) that mirrors the real layer's signatures; swapping the seam to `src/lib/db/catalogue.ts` activates Supabase without UI changes.
5. **Business logic / services** (`src/lib/services/`) — orchestration (checkout, orders, cart) that must not live in route handlers. (Empty until features are implemented.)
6. **External services** (`src/lib/storage/`, `src/lib/supabase/`) — R2 client (S3 API) and Supabase client factories (browser/server/middleware). `src/lib/storage/image-url.ts` derives public R2 URLs from object keys.
7. **Types** (`src/types/`) — shared domain types.
8. **Utilities** (`src/utils/`) — pure helpers (formatting, slugs), unit-tested.
9. **Configuration** (`src/lib/config/`) — validated server environment.
10. **Authentication** — Supabase Auth; session refreshed in `src/middleware.ts`.
11. **Database** — PostgreSQL schema + RLS (in `supabase/migrations/`).

## Data Flow

### Public catalogue read (browse / search / product page)
```
Browser
  → Cloudflare CDN (cache for static assets; cached public pages)
  → Next.js (Server Component, server-side data retrieval)
  → Supabase (anon key + RLS: only active rows exposed)
  → PostgreSQL (indexed queries, paginated)
  ← rows (page-sized)
  ← HTML/JSON to browser
Images load directly from R2's public URL (CDN-cached).
```

The search suggestions endpoint (`GET /api/search?q=`, navbar combobox) follows the same path: server-side query through the data seam, JSON response, never client-side catalogue download.

### Authenticated data (cart, orders, account)
```
Browser
  → Next.js Server Component / Route Handler (session cookie, server client)
  → Supabase (RLS: only rows owned by auth.uid() are visible)
  → PostgreSQL
Responses are NEVER publicly cached (Cache-Control: private, no-store).
```

### Administrative data
Admin-only write paths go through the application (server-side, `is_admin()` RLS gate) or directly through a trusted server context with the service role key (never from the browser). The browser only ever holds the anon key.

## Database
PostgreSQL 15 through Supabase. Schema is versioned in `supabase/migrations/` (Supabase CLI, timestamped SQL). Supabase's PostgREST API exposes `public` schema tables; Row Level Security is enabled on every table.

Tables:
- `profiles` — 1:1 with `auth.users`; email, full name, phone, `is_admin` flag. Created automatically at signup.
- `categories` — hierarchical (self-referencing `parent_id`), slug, image key, active flag.
- `brands` — name, slug, logo key, active flag.
- `products` — name, slug, SKU, brand, description, price, promotional price, stock, active flag, `search_vector` (generated, GIN-indexed).
- `product_images` — R2 object keys + position + alt text (metadata only; no binaries).
- `product_categories` — many-to-many products ↔ categories.
- `carts` / `cart_items` — one cart per user (created at signup), quantities, unique (cart, product).
- `orders` / `order_items` — totals stored at checkout; order items snapshot name/price; statuses: pending, confirmed, processing, shipped, delivered, cancelled.
- `promotions` — order-level discount codes (percentage or fixed amount), validity window, usage limit.

Key decisions: UUID primary keys everywhere; `numeric(10,2)` prices in MAD; stock is an integer on the product row (a stock-movement history table is a future option); product categories are many-to-many.

Indexes exist for: active products, brand browsing, category links, product-name trigram search (GIN), full-text search (GIN), SKU, order ownership, order status, recent orders, active promotions. Index rationale is documented inline in the migrations.

## Authentication
Supabase Auth (email/password). Architecture:
- Signup trigger creates the profile row and cart automatically.
- Sessions are managed with `@supabase/ssr`: browser client, server client (Server Components), and middleware (`src/middleware.ts`) which refreshes the session cookie on every request.
- The session-refresh middleware keeps the legacy `middleware` file convention (Edge runtime) on purpose: the OpenNext Cloudflare adapter (1.20.x) does not yet support Next 16 `proxy.ts` (Node.js middleware). Rename to `proxy.ts` once opennextjs-cloudflare ships support (PR #1309); the `updateSession` logic is runtime-agnostic.
- The UI (forms, login/register pages) is a later phase; the infrastructure and data model are in place.
- Customers: `authenticated` role, RLS-limited to their own rows.
- Administrators: `profiles.is_admin = true`, detected server-side via `public.is_admin()` (SECURITY DEFINER). Admin accounts are provisioned by a trusted operator (SQL/Supabase console) — never self-service.
- The service role key exists but is server-only; it bypasses RLS and is reserved for trusted server contexts (e.g. administrative batch operations).

## Storage
Cloudflare R2 (S3-compatible API) stores all media: product images, category images, banners, logos. PostgreSQL stores the object key (`r2_key`); the public URL is derived at runtime from `NEXT_PUBLIC_R2_PUBLIC_URL` — no domain is hard-coded, so a custom CDN domain (e.g. `cdn.example.com`) can be attached later without code changes. Browser reads use the public bucket URL (CDN-cached). Writes (upload/delete, presigned URLs for the admin UI) go through server-side code in `src/lib/storage/r2.ts` with R2 API credentials.

Supabase Storage is intentionally disabled: it is not part of this architecture.

## External Services
- **Supabase** — PostgreSQL, Auth, PostgREST (database access), RLS enforcement.
- **Cloudflare R2** — object storage (S3 API).
- **Cloudflare** — DNS, CDN, caching, TLS/HTTPS, basic edge security, static asset delivery.

### Cloudflare responsibilities — explicit split
Cloudflare is responsible for: DNS, CDN/edge caching of static assets and cacheable public content, TLS, DDoS/bot protection (managed rules), delivery of `.open-next/assets` static files, and hosting the application Worker.

Cloudflare is NOT responsible for: application business logic, catalogue queries, search, carts, orders, authentication state, image processing (R2 stores originals; image optimization via Cloudflare Images is a future option), or authorization (that is the database's RLS job). The CDN does not automatically cache Supabase responses; caching is explicit (see Caching).

## Security Assumptions
- RLS is the primary authorization boundary; it applies to every table and cannot be bypassed from the browser.
- The anon key is public by design; it is useless without RLS because policies expose only permitted rows.
- The service role key and R2 API credentials never appear in browser code; server-only modules (`import "server-only"`) enforce this at build time.
- Customers cannot modify products, stock, prices, other accounts, or other customers' orders. `profiles.is_admin` cannot be self-granted (RLS WITH CHECK).
- A customer's order history is protected by RLS (order → user ownership).
- Secrets are never committed; `.env.example` documents variables without values.
- Next.js image remote patterns are derived from the configured public R2 URL, not a hard-coded domain.

## Performance Assumptions
- Target trajectory: ~100 → ~10,000+ users/day. Architecture stays simple initially but does not assume small scale.
- The catalogue is never fully loaded: every list is paginated (`page`/`pageSize`, capped at 100 rows) and compatible with future cursor-based pagination.
- Search is server-side: PostgreSQL trigram/GIN indexes power `ILIKE`; full-text (`search_vector`) is materialized for the evolution path. No external search engine until catalogue size or traffic justifies it.
- Repeated identical queries are avoided with caching where appropriate; cacheable public content is served without hitting PostgreSQL.
- Image optimization: lazy loading and CDN caching of media; Cloudflare Images optimization is a future option.
- No unnecessary Workers: the application Worker is the only one. Extra Workers/adapters are added only with a concrete purpose.
- No unnecessary client-side JavaScript: data retrieval is server-side by default.

## Caching
Four explicit layers, never conflated:

1. **Browser cache** — static assets via `Cache-Control: public,max-age=31536000,immutable` (`public/_headers` for `/_next/static/*`); media from the public R2 URL. Private responses are marked `no-store` so browsers never cache them.
2. **CDN/Cloudflare cache** — Cloudflare caches static assets and any response explicitly marked cacheable (`Cache-Control: public`, `s-maxage`). Cloudflare does NOT cache Supabase responses automatically; caching is opt-in via response headers.
3. **Application cache** — OpenNext incremental cache stored in R2 (`NEXT_INC_CACHE_R2_BUCKET` binding), used for ISR/revalidated public pages and Next.js data cache.
4. **Database** — the source of truth; the only store that knows stock, prices, accounts and orders.

Rule: cache aggressively only public catalogue data (active products, categories, brands, product pages); NEVER cache personal account information, carts, orders, private customer data or administrative data (`private, no-store`).

## Deployment
### Local development
- `npm install`, copy `.env.example` → `.env.local`, fill real values.
- Supabase local stack (Docker): `supabase start` (config in `supabase/config.toml`; migrations in `supabase/migrations/`). Apply to a remote project with `supabase db push`.
- `npm run dev` (Next.js dev server, `initOpenNextCloudflareForDev()` enabled).
- `npm run preview` — build + serve the app in the Cloudflare Workers runtime locally (wrangler, `.dev.vars`).

### Environment variables
- Public (browser): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_R2_PUBLIC_URL`.
- Server-only (never in browser): `SUPABASE_SERVICE_ROLE_KEY`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`.
- In production these are set in the Cloudflare dashboard (Workers environment variables), not in the repository.

### Production deployment (Cloudflare Workers)
1. `npm run deploy` (`opennextjs-cloudflare build && opennextjs-cloudflare deploy`).
2. The adapter builds Next.js, transforms the output (`.open-next/`), uploads it as a Worker plus static assets, and populates the remote cache.
3. Worker configuration lives in `wrangler.jsonc`: `nodejs_compat`, static assets binding, self-reference service binding, R2 cache bucket (`NEXT_INC_CACHE_R2_BUCKET`), Cloudflare Images binding (`IMAGES`).
4. Optional: connect the GitHub repository so Cloudflare Workers Builds builds and deploys on push (Build command `npx @opennextjs/cloudflare build`, Deploy command `npx @opennextjs/cloudflare deploy`).

### Database environment
- Local: Supabase CLI + Docker. Remote: `supabase db push` against the linked project (or apply migration files in the Supabase dashboard).
- Never commit database passwords; the CLI stores project links outside the repository.

### R2 environment
- Buckets: `pharma-media` (product/media objects, public read via `NEXT_PUBLIC_R2_PUBLIC_URL`) and `next-inc-cache` (OpenNext incremental cache, Worker-bound only).
- Public media is served through a custom domain (e.g. `cdn.example.com`) configured on the bucket; value goes in `NEXT_PUBLIC_R2_PUBLIC_URL`.

### Cloudflare configuration
- Worker: `wrangler.jsonc`; cache: `open-next.config.ts` (R2 incremental cache); static asset headers: `public/_headers`; domain: configure the Worker's custom domain (e.g. `www.example.com`) in the Cloudflare dashboard.

### Domain configuration
- DNS at Cloudflare (nameservers). Main domain → Worker custom domain (proxy mode, orange cloud). Optional `cdn.example.com` → R2 bucket custom domain. TLS is automatic via Cloudflare certificates.