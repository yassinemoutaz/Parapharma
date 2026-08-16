# Decision

## Status
Accepted (2026-08-16) — implemented.

## Context
Phase 3 delivers the storefront UI. The Supabase-backed data layer (`src/lib/db/catalogue.ts`) exists but cannot run until a Supabase project is configured (real credentials), which should not block frontend development. The UI must be built against a stable contract so the real layer can be activated later without UI changes, and no UI code may depend on mock data leaking through.

## Decision
Introduce a frontend data seam at `src/lib/data/catalogue.ts` whose function signatures are copied from the real layer (`src/lib/db/catalogue.ts`); it currently re-exports an isolated mock implementation living in `src/lib/data/mock/`:

- **Contract**: the seam exports the same function names and parameter types as `src/lib/db/catalogue.ts` (paged listing, category/brand browsing, search, single-product by slug), returning shared domain types from `src/types/domain.ts`. No type duplication.
- **Mock isolation**: `mock/` imports only shared types and mirrors the real signatures; UI code imports only the seam. `import "server-only"` keeps the seam server-side; pages pass serializable data to client components (search bar, product cards).
- **Activation**: swapping `src/lib/data/catalogue.ts`'s export from `./mock` to `../db/catalogue` activates Supabase with zero UI changes. Mock↔real behavioural parity is asserted by unit tests where semantics matter (e.g. search matching, pagination shape).
- **UI runtime behaviour**: the add-to-cart button is a visual-only stub (confirmation state) — no cart service exists yet; product images are derived via `getImageUrl(key, base)` so mock keys render from `NEXT_PUBLIC_R2_PUBLIC_URL`.

## Alternatives Considered
- **UI against real layer with placeholder credentials**: rejected — every page/data fetch would fail without a configured Supabase project; the mock also lets tests run offline.
- **Inlining mock data into components**: rejected — leaks mock dependencies into UI code and breaks the later swap.
- **Generating a client-side mock API**: rejected — adds network indirection for no benefit; the seam is a direct function call.

## Consequences
- Frontend development is unblocked and fully testable without external services.
- The activation step is a one-line export change; the real layer's signatures are frozen as the contract (change to the real layer must be mirrored in the mock and vice versa).
- The catalogue in production will come from Supabase/RLS (only active rows), while the mock intentionally has no auth concept — the seam is a read-only public-catalogue contract.
- Search semantics are case-insensitive but accent-sensitive in both mock and real layer (trigram `ILIKE`), keeping behaviour consistent.