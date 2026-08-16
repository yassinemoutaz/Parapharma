# Project Identity

## Project Name
Parapharmacie e-commerce platform (working directory: `PHARMA 2`).

## Purpose
Professional e-commerce website for a parapharmacy. Customers will be able to browse and search products, browse categories, view product details, add products to a cart, place orders, create and log into an account, manage their account, and view their orders. Administrators will manage the catalogue (products, categories, brands, prices, stock, images), promotions, orders and customers.

## Business Domain
E-commerce / parapharmacy (pharmacy-related health, beauty and wellness products). Initial target market: Morocco, with particular attention to Casablanca.

## Technology Stack
- Next.js (App Router) + TypeScript — application framework
- Tailwind CSS — styling foundation
- Cloudflare (Workers / OpenNext adapter) — hosting, CDN, DNS, TLS, edge security, static assets
- Supabase — PostgreSQL database, authentication, database access, Row Level Security
- Cloudflare R2 — object storage for product/category images, banners, logos
- Vitest — unit testing
- Supabase CLI — local database and migrations

## Deployment Target
Cloudflare Workers via the OpenNext Cloudflare adapter (`@opennextjs/cloudflare`). Deployed with the `opennextjs-cloudflare` CLI (`npm run deploy`). Vercel is explicitly NOT used. The Next.js application is transformed into a Worker by the OpenNext adapter and served through Cloudflare's edge network.

## External Services
- Supabase (managed PostgreSQL + Auth + PostgREST)
- Cloudflare R2 (S3-compatible object storage)
- Cloudflare (DNS, CDN, caching, TLS, edge security)

## What This Project Is
- A server-rendered Next.js e-commerce application with a PostgreSQL-backed catalogue
- A modular monolith: one application, clearly separated internal layers (routes, data access, business logic, external services)
- A database-centric security model: Row Level Security is the authorization boundary
- A platform designed to evolve from ~100 users/day to 10,000+ users/day without re-architecture

## What This Project Is Not
- Not a microservices system (no service decomposition unless a concrete reason appears)
- Not a client-side single-page application (server-side rendering and server-side data access are the default)
- Not Vercel-hosted
- Not an image CDN built on Supabase (images live in R2, referenced from PostgreSQL)
- Not a project where the browser downloads the full catalogue (pagination + server-side search only)

## Current Status
Phase 3 complete: Glass UI frontend implemented (design tokens, layout chrome, home sections, product components, server-side search UI + API, search and product pages, loading/error/not-found states), driven by an isolated mock catalogue behind a data seam (`src/lib/data/catalogue.ts`) that mirrors the real Supabase layer's signatures. All checks green (typecheck, 19 unit tests, `next build`, OpenNext Cloudflare build). Backend foundation (Phases 1–2) unchanged: Supabase schema + RLS, R2 storage, Cloudflare deployment configuration all in place.

## Important Constraints
- Scale: designed to grow from ~100 to ~10,000+ users/day; simple and inexpensive initially, scalable and cache-friendly.
- Cloudflare is the hosting/CDN/security platform; Vercel is forbidden.
- Supabase is the database, auth and security layer; it is not the image CDN.
- R2 is the object store; PostgreSQL stores keys/URLs, never image binaries.
- No unnecessary intermediate layers: a database read must not be routed through an extra Worker without a concrete reason.
- Database is the source of truth; documentation must stay synchronized with it.
- No real secrets in the repository; public (NEXT_PUBLIC_*) and server-only variables are separated.
- The final UI design (Glass UI) is implemented for the public storefront (Phase 3); admin UI, cart, checkout and account flows are later phases.
- The storefront currently runs on an isolated mock catalogue (`src/lib/data/mock/`) behind the data seam; swapping one export activates the real Supabase-backed layer.