# Routing

Routing defines where each type of change or artifact belongs in this project.

## ICM Structure

/_icm/
  Purpose:
  Project-level documentation and AI development methodology.

/_icm/stages/
  Purpose:
  Rules for different types of development changes.

/_icm/decisions/
  Purpose:
  Architectural Decision Records.

## Application Structure

Root files:

/IDENTITY.md
  Project identity: what the project is, its constraints, its boundaries.

/CONTEXT.md
  Architecture, data flow, security, caching, deployment — the authoritative
  technical description of the system.

/ROUTING.md
  This file: where code and artifacts belong.

/package.json, /tsconfig.json, /next.config.ts
  Application and build configuration.

/open-next.config.ts, /wrangler.jsonc, /public/_headers, /.dev.vars
  Cloudflare / OpenNext deployment configuration.

/.env.example
  Documented environment variables (never commit real values).

/supabase/
  Database configuration: /supabase/config.toml (local stack) and
  /supabase/migrations/ (versioned SQL schema + RLS, Supabase CLI format).

/src/
  Application source code.

  /src/app/
    Next.js App Router routes: pages, layouts, route handlers.
    One folder per route.
    /src/app/_layout/  — app chrome shared by every page (marquee,
      navbar, mobile menu, footer).
    /src/app/_sections/ — home-page sections (hero, featured products,
      category discovery, promo banner).
    /src/app/api/ — route handlers (e.g. /api/search for the search
      suggestions endpoint).

  /src/components/
    Reusable UI components. Only shared, cross-page components live here;
    route-specific components live next to their route in /src/app.
    /src/components/ui/ — design-system primitives (button, card, badge,
      input, skeleton, section, container, icons).
    /src/components/product/ — product UI (card, grid, image,
      add-to-cart button).
    /src/components/search/ — search bar (client combobox, server-backed).
    /src/components/category-nav.tsx — category navigation bar.

  /src/middleware.ts
    Session refresh for Supabase Auth (runs on every matched request).
    Kept on the legacy `middleware` convention (Edge runtime): the
    OpenNext Cloudflare adapter (1.20.x) does not yet support Next 16
    `proxy.ts` (Node.js middleware). Revisit when support ships
    (opennextjs-cloudflare PR #1309) and rename to proxy.ts.

  /src/lib/
    /src/lib/supabase/
      Supabase client factories: browser client, server client,
      middleware client.
    /src/lib/db/
      Data access: typed, paginated queries against Supabase.
      One module per domain area (e.g. catalogue.ts). Pages and services
      consume these; raw PostgREST calls do not belong in routes.
    /src/lib/data/
      Frontend data contract: catalogue.ts is the seam consumed by pages
      and the search API; mock/ contains the isolated mock implementation
      used until Supabase is configured. Swapping the seam's export to
      /src/lib/db/catalogue.ts activates the real layer, UI unchanged.
    /src/lib/storage/image-url.ts
      Derives public R2 URLs from stored object keys.
    /src/lib/services/
      Business logic orchestration (cart, checkout, orders, promotions).
      Currently empty: created when those features are implemented.
    /src/lib/storage/
      External storage services: R2 (S3 API) client in r2.ts.
    /src/lib/config/
      Server environment validation (env.ts, server-only).

  /src/types/
    Shared domain types (domain.ts) mirroring the database schema.

  /src/utils/
    Pure, unit-tested helpers (formatting, slugs).

  /src/**/*.test.ts
    Unit tests, colocated with the code they test (Vitest).

## Where Future Code Belongs

New route (page, layout, API route handler)
  → /src/app/<route>/... (app chrome → _layout/, home sections → _sections/)

Shared reusable UI component
  → /src/components/... (primitives → ui/, product → product/, registered here first)

New database query
  → /src/lib/db/<domain>.ts (or new domain module)

New data-seam function used by the UI
  → /src/lib/data/catalogue.ts (+ mock in /src/lib/data/mock/)

New business logic (cart/checkout/orders/...)
  → /src/lib/services/<domain>.ts

New external service integration
  → /src/lib/storage/ (or a sibling under /src/lib/)

New schema change / RLS policy
  → /supabase/migrations/ (timestamped SQL migration)

New domain type
  → /src/types/domain.ts (or sibling module)

Pure helper
  → /src/utils/

If no appropriate location exists:

1. Define the new category.
2. Update ROUTING.md.
3. Explain the reason.
4. Implement the change.