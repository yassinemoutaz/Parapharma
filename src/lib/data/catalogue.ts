/**
 * Catalogue data seam — the single entry point for catalogue
 * reads used by the UI.
 *
 * Currently backed by isolated mock data (src/lib/data/mock/)
 * because the Supabase connection is not configured yet.
 *
 * Swap point: when the database is connected, replace the
 * re-export source with "@lib/db/catalogue" (same signatures,
 * same domain types). No UI component changes are required.
 */

export {
  getProductBySlug,
  listActiveBrands,
  listActiveCategories,
  listProducts,
  searchProducts,
} from "./mock/catalogue";

export type { ListProductsParams, ProductSort } from "@/lib/db/catalogue";