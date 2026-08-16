# Decision

## Status
Accepted (2026-08-16) — implemented.

## Context
Product search must be server-side: the browser must never download the catalogue. Queries like "CeraVe", "Avène", "shampooing", "crème hydratante" must work well, with evolution toward brand/category/keyword search. No external search engine unless PostgreSQL clearly cannot satisfy the requirements at current scale.

## Decision
Search is executed in PostgreSQL:
- **Primary mechanism**: case-insensitive `ILIKE '%term%'` on the product name, backed by a GIN trigram index (`pg_trgm`, `products_name_trgm_idx`). This handles partial words and typos at current scale. Matching is accent-sensitive (standard `ILIKE` semantics, no accent folding) — the mock layer mirrors this behaviour.
- **Evolution path**: a generated `tsvector` column (`search_vector`, `simple` config over name + description) with a GIN index is already materialized; a full-text query can be switched on without schema changes.
- Brand/category filtering composes with search through the existing indexed joins (`products_brand_id_idx`, `product_categories`).
- Paginated results only: the data-access layer (`src/lib/db/catalogue.ts`) returns page-sized rows.

A dedicated search engine (Meilisearch/Typesense/Elasticsearch) is deliberately NOT introduced; it is the documented upgrade path if catalogue size or traffic outgrows PostgreSQL.

## Alternatives Considered
- **Client-side search (download all products)**: rejected — violates the performance rule at any scale beyond a few hundred products.
- **External search engine now**: rejected — added cost/ops without a demonstrated need at ~100–10,000 users/day.
- **ILIKE without indexes**: rejected — sequential scans would degrade with thousands of products; the trigram GIN index makes it fast.

## Consequences
- Search quality is capped by trigram matching until full-text is enabled (a config-level query change in `src/lib/db/catalogue.ts`).
- Truncated/`%` wildcard inputs are bounded by pagination; the query API sanitizes length.
- Switching to a dedicated engine later only touches the search function in the data-access layer; route and UI contracts stay stable.