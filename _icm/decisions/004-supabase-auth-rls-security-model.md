# Decision

## Status
Accepted (2026-08-16) — implemented.

## Context
The platform needs registration, login, sessions, customer accounts and administrator accounts. The security model distinguishes public visitors, authenticated customers and administrators. Customers must never modify other accounts, other orders, products, stock or prices. The authentication UI is a later phase; the infrastructure and data model must exist now.

## Decision
Use Supabase Auth (email/password) with `@supabase/ssr` session management:
- Browser client (`src/lib/supabase/client.ts`), server client for Server Components (`src/lib/supabase/server.ts`), and middleware session refresh (`src/middleware.ts`).
- A signup trigger (`handle_new_user`) creates the `profiles` row and the user's cart automatically.

Authorization is enforced by RLS policies in the database (`supabase/migrations/20260816000009_row_level_security.sql`):
- **Public**: read active products, categories, brands, product images, active promotions.
- **Customers**: own profile (read/update, with a WITH CHECK that forbids self-granting `is_admin`), own cart, own orders (read/create; status changes are admin-only).
- **Admins**: detected server-side via `public.is_admin()` (SECURITY DEFINER, bypasses RLS for the check); admin-only policies cover catalogue writes, promotions and order management.

Admin accounts are provisioned by a trusted operator (SQL/Supabase console) — never self-service. The service role key exists but is server-only, reserved for trusted server contexts, and never touches browser code.

## Alternatives Considered
- **Custom auth (JWT/sessions in code)**: rejected — Supabase Auth provides battle-tested auth, and its `auth.users` rows anchor RLS.
- **Client-side-only session checks**: rejected — authorization lives in the database, not in the UI.
- **Self-service admin flag**: rejected — the RLS WITH CHECK makes it impossible; admins are provisioned by operators.

## Consequences
- RLS is the single source of authorization truth; UI checks are cosmetic, not security.
- The anon key is safe in the browser; it cannot read protected rows.
- Future auth UI (login/register pages, forms) only needs to call Supabase Auth; no schema change required.
- The middleware refreshes sessions on every matched request; private pages must additionally check the user server-side.