# Decision

## Status
Accepted (2026-08-16) — implemented.

## Context
All media (product images, category images, banners, logos) must be stored outside PostgreSQL, which should hold only references. The project must allow a future CDN/custom domain (e.g. `cdn.example.com`) without code changes. Supabase must not be treated as the image CDN.

## Decision
Store all media in Cloudflare R2 (S3-compatible API). PostgreSQL tables store only metadata: the object key (`r2_key`), position, alt text. The public URL is derived at runtime from `NEXT_PUBLIC_R2_PUBLIC_URL`; no domain is hard-coded anywhere. Browser reads hit the public bucket URL directly (CDN-cached). Server-side writes (upload/delete) and presigned upload URLs for the future admin UI live in `src/lib/storage/r2.ts`, using server-only R2 API credentials.

Supabase Storage is intentionally disabled in `supabase/config.toml`.

## Alternatives Considered
- **Supabase Storage**: rejected — the project constraint says Supabase is not the image CDN; it would duplicate R2's role.
- **Storing images as bytea in PostgreSQL**: rejected — bloat, no CDN caching, contradicts the architecture.
- **Hard-coded public domain in code**: rejected — derived from configuration to allow `cdn.example.com` later.

## Consequences
- Image delivery is CDN-cached at the edge; origin serves are rare.
- R2 credentials are server-only (enforced with `import "server-only"`); a leaked bucket key would only expose images, not database access.
- Attaching a custom domain later is configuration-only: change `NEXT_PUBLIC_R2_PUBLIC_URL`.
- Orphaned objects (deleted products) must be cleaned by application logic; the database holds keys, not binaries.