# Decision

## Status
Accepted (2026-08-16) — implemented.

## Context
The platform must be deployed on Cloudflare and explicitly NOT on Vercel. Next.js is the framework. The architecture must avoid unnecessary intermediate Workers: a simple database read must not be routed through an extra Worker without a concrete purpose.

## Decision
Deploy Next.js as a single Cloudflare Worker produced by the OpenNext Cloudflare adapter (`@opennextjs/cloudflare`). The Next.js build output is transformed into `.open-next/worker.js`; static assets are served by Cloudflare's asset serving. The application Worker IS the application — no extra Worker sits in front of it. Additional Workers/routes are introduced only for concrete purposes (payment webhooks, image processing, security-sensitive logic).

OpenNext configuration lives in `open-next.config.ts` (R2-backed incremental cache) and `wrangler.jsonc` (nodejs_compat, assets binding, self-reference service binding, cache bucket, Images binding).

## Alternatives Considered
- **Cloudflare Pages (legacy framework support)**: superseded by the Workers-based model; OpenNext is Cloudflare's current official Next.js deployment path.
- **Vercel**: explicitly rejected by the project constraints.
- **A separate intermediary Worker in front of the application**: rejected — adds latency and complexity without a purpose; the data flow rule forbids it for plain database reads.

## Consequences
- One deployment artifact: a Worker plus static assets; `npm run deploy` handles the whole pipeline.
- Local `next dev` works unchanged; `npm run preview` serves the exact Workers runtime locally.
- ISR/cache data must live in R2 (`next-inc-cache` bucket) because Workers storage is ephemeral.
- Future specialized Workers must be justified with a concrete purpose (ADR-worthy decision each time).