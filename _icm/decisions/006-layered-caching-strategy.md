# Decision

## Status
Accepted (2026-08-16) — implemented (headers/config) and partly pending (ISR usage).

## Context
Cacheable public content (product images, static assets, public catalogue data, product pages) must be served without repeatedly hitting PostgreSQL, while personal data (carts, orders, accounts, admin data) must never be publicly cached. Cloudflare does not automatically cache Supabase responses.

## Decision
Four explicit cache layers, never conflated:

1. **Browser cache** — hashed static assets are immutable: `Cache-Control: public,max-age=31536000,immutable` (`public/_headers`). Media from the public R2 URL is long-lived. Private responses are marked `private, no-store`.
2. **CDN/Cloudflare cache** — caches static assets and any response explicitly marked cacheable (`Cache-Control: public` / `s-maxage`). Caching is opt-in via response headers, never assumed.
3. **Application cache** — OpenNext incremental cache in R2 (`NEXT_INC_CACHE_R2_BUCKET` binding, `open-next.config.ts`), the store for ISR pages and revalidated public catalogue pages.
4. **Database** — the source of truth (stock, prices, accounts, orders); never cached.

Rule: cache public catalogue data aggressively; never cache personal or administrative data.

## Alternatives Considered
- **Rely on Cloudflare auto-caching**: rejected — Cloudflare does not cache PostgREST/Supabase responses automatically; caching must be explicit.
- **Caching Supabase responses at the CDN edge**: rejected for dynamic catalogue pages at this stage — correctness (stock/prices) matters more; ISR in the application cache provides the safe middle ground.
- **No application cache**: rejected — Worker storage is ephemeral; the R2 incremental cache makes ISR durable.

## Consequences
- Public page speed improves without serving stale stock/prices: ISR revalidation controls freshness.
- Any future endpoint that serves personal data must set `private, no-store` — a documented convention, not an assumption.
- Cache invalidation is explicit (revalidate paths/tags); accidental caching of private data is prevented by header conventions and review.