/**
 * Catalogue data access layer.
 *
 * All queries run server-side through the Supabase client with
 * the anon key: Row Level Security exposes only public,
 * active rows to unauthenticated requests.
 *
 * Never load the full catalogue: every list query is paginated.
 * Every select is as lean as its consumer needs:
 *   - PRODUCT_SUGGESTION_SELECT: search suggestions (6 fields);
 *   - PRODUCT_LIST_SELECT: grids/cards (no sku, no description);
 *   - PRODUCT_DETAIL_SELECT: product page (full row).
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Brand,
  Category,
  Paginated,
  Product,
  ProductImage,
} from "@/types/domain";

export type ProductSort = "newest" | "price_asc" | "price_desc";

export interface ListProductsParams {
  page: number;
  pageSize: number;
  search?: string;
  categorySlug?: string;
  brandSlug?: string;
  sort?: ProductSort;
}

interface ProductImageRow {
  id: string;
  product_id: string;
  r2_key: string;
  position: number;
  alt_text: string | null;
}

interface ProductCategoryRow {
  category: { id: string; name: string; slug: string };
}

export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  brand_id: string | null;
  brand: { name: string } | null;
  description: string | null;
  price: number;
  promotional_price: number | null;
  stock: number;
  is_active: boolean;
  product_images?: ProductImageRow[];
  product_categories?: ProductCategoryRow[];
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku ?? null,
    brandId: row.brand_id,
    brandName: row.brand?.name ?? null,
    description: row.description ?? null,
    price: Number(row.price),
    promotionalPrice:
      row.promotional_price !== null && row.promotional_price !== undefined
        ? Number(row.promotional_price)
        : null,
    stock: row.stock,
    isActive: row.is_active,
    images: (row.product_images ?? [])
      .sort((a, b) => a.position - b.position)
      .map((img) => ({
        id: img.id,
        productId: img.product_id,
        r2Key: img.r2_key,
        position: img.position,
        altText: img.alt_text,
      })),
    categories: (row.product_categories ?? []).map((pc) => pc.category),
  };
}

const PRODUCT_DETAIL_SELECT = `
  id, name, slug, sku, brand_id,
  brand:brands ( name ),
  description, price, promotional_price, stock, is_active,
  product_images ( id, product_id, r2_key, position, alt_text ),
  product_categories ( category:categories ( id, name, slug ) )
`;

const PRODUCT_LIST_SELECT = `
  id, name, slug, brand_id,
  brand:brands ( name ),
  price, promotional_price, stock, is_active,
  product_images ( id, product_id, r2_key, position, alt_text ),
  product_categories ( category:categories ( id, name, slug ) )
`;

const PRODUCT_SUGGESTION_SELECT = `
  id, name, slug,
  brand:brands ( name ),
  price, promotional_price,
  product_categories ( category:categories ( name ) )
`;

/**
 * Strips characters that would break PostgREST filter parsing
 * (or=/ilike grammar): commas, parentheses, wildcards. Search
 * terms are plain words ("avène", "cerave") — nothing is lost.
 */
function toFilterTerm(term: string): string {
  return term.replace(/[%*(),]/g, " ").trim();
}

async function queryProducts(
  select: string,
  params: ListProductsParams,
): Promise<Paginated<Product>> {
  const supabase = await createSupabaseServerClient();
  const page = Math.max(1, params.page);
  const pageSize = Math.min(Math.max(1, params.pageSize), 100);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select(select, { count: "exact" })
    .eq("is_active", true)
    .range(from, to);

  if (params.search) {
    const term = toFilterTerm(params.search);
    if (term) {
      // Matches name, brand name or category name (same
      // behaviour as the mock layer).
      query = query.or(
        `name.ilike.*${term}*,brand.name.ilike.*${term}*,product_categories.category.name.ilike.*${term}*`,
      );
    }
  }

  if (params.categorySlug) {
    query = query.eq("product_categories.category.slug", params.categorySlug);
  }

  if (params.brandSlug) {
    query = query.eq("brand.slug", params.brandSlug);
  }

  switch (params.sort ?? "newest") {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    default:
      // Stable sort: id is the tiebreaker so pagination never
      // skips or repeats rows (index in migration 011).
      query = query
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });
  }

  const { data, count, error } = await query.returns<ProductRow[]>();

  if (error) throw error;

  const items = (data ?? []).map(mapProduct);

  return {
    items,
    page,
    pageSize,
    total: count ?? items.length,
    totalPages: count ? Math.ceil(count / pageSize) : 1,
  };
}

export async function listProducts(
  params: ListProductsParams,
): Promise<Paginated<Product>> {
  return queryProducts(PRODUCT_LIST_SELECT, params);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_DETAIL_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()
    .returns<ProductRow>();

  if (error) throw error;

  return data ? mapProduct(data) : null;
}

/**
 * Server-side product search (suggestions).
 *
 * Matches product name, brand name and category name with
 * case-insensitive ILIKE, backed by the GIN trigram index in
 * PostgreSQL. Only paginated, matching rows are returned —
 * the browser never downloads the catalogue.
 *
 * Evolution path: full-text search (tsvector) is already
 * materialized on products.search_vector; a dedicated search
 * engine is only justified if catalogue size or traffic
 * outgrows PostgreSQL.
 */
export async function searchProducts(
  query: string,
  page: number,
  pageSize: number,
): Promise<Paginated<Product>> {
  const term = query.trim();
  if (!term) {
    return { items: [], page, pageSize, total: 0, totalPages: 0 };
  }

  return queryProducts(PRODUCT_SUGGESTION_SELECT, {
    page,
    pageSize,
    search: term,
  });
}

export async function listActiveCategories(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, parent_id, image_key, is_active")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    parentId: row.parent_id,
    imageKey: row.image_key,
    isActive: row.is_active,
  }));
}

export async function listActiveBrands(): Promise<Brand[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("brands")
    .select("id, name, slug, logo_key, is_active")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoKey: row.logo_key,
    isActive: row.is_active,
  }));
}

export type { ProductImage };