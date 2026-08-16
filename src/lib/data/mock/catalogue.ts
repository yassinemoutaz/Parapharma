/**
 * MOCK CATALOGUE DATA — clearly isolated.
 *
 * Serves the frontend until the Supabase connection is
 * configured. It implements the exact same signatures as the
 * real data layer (src/lib/db/catalogue.ts) and reuses the
 * domain types from src/types/domain.ts — nothing is duplicated.
 *
 * Replacement path: switch the re-exports in src/lib/data/catalogue.ts
 * to src/lib/db/catalogue.ts. No UI change required.
 */

import type {
  Brand,
  Category,
  Paginated,
  Product,
} from "@/types/domain";
import type { ListProductsParams } from "@/lib/db/catalogue";

export const MOCK_CATEGORIES: Category[] = [
  { id: "c-visage", name: "Visage", slug: "visage", description: "Soins du visage", parentId: null, imageKey: null, isActive: true },
  { id: "c-maquillage", name: "Maquillage", slug: "maquillage", description: null, parentId: null, imageKey: null, isActive: true },
  { id: "c-corps", name: "Corps", slug: "corps", description: null, parentId: null, imageKey: null, isActive: true },
  { id: "c-cheveux", name: "Cheveux", slug: "cheveux", description: null, parentId: null, imageKey: null, isActive: true },
  { id: "c-bebe", name: "Bébé & Maman", slug: "bebe-maman", description: null, parentId: null, imageKey: null, isActive: true },
  { id: "c-homme", name: "Homme", slug: "homme", description: null, parentId: null, imageKey: null, isActive: true },
  { id: "c-hygiene", name: "Hygiène", slug: "hygiene", description: null, parentId: null, imageKey: null, isActive: true },
  { id: "c-solaire", name: "Solaire", slug: "solaire", description: null, parentId: null, imageKey: null, isActive: true },
  { id: "c-sante", name: "Santé", slug: "sante", description: null, parentId: null, imageKey: null, isActive: true },
  { id: "c-paramedical", name: "Para-médical", slug: "para-medical", description: null, parentId: null, imageKey: null, isActive: true },
  { id: "c-bio", name: "Bio", slug: "bio", description: null, parentId: null, imageKey: null, isActive: true },
  { id: "c-promotion", name: "Promotion", slug: "promotion", description: null, parentId: null, imageKey: null, isActive: true },
];

export const MOCK_BRANDS: Brand[] = [
  { id: "b-cerave", name: "CeraVe", slug: "cerave", logoKey: null, isActive: true },
  { id: "b-avene", name: "Avène", slug: "avene", logoKey: null, isActive: true },
  { id: "b-lrp", name: "La Roche-Posay", slug: "la-roche-posay", logoKey: null, isActive: true },
  { id: "b-bioderma", name: "Bioderma", slug: "bioderma", logoKey: null, isActive: true },
  { id: "b-vichy", name: "Vichy", slug: "vichy", logoKey: null, isActive: true },
  { id: "b-nuxe", name: "Nuxe", slug: "nuxe", logoKey: null, isActive: true },
  { id: "b-svr", name: "SVR", slug: "svr", logoKey: null, isActive: true },
  { id: "b-klorane", name: "Klorane", slug: "klorane", logoKey: null, isActive: true },
  { id: "b-uriage", name: "Uriage", slug: "uriage", logoKey: null, isActive: true },
  { id: "b-mustela", name: "Mustela", slug: "mustela", logoKey: null, isActive: true },
  { id: "b-cetaphil", name: "Cetaphil", slug: "cetaphil", logoKey: null, isActive: true },
  { id: "b-adema", name: "A-Derma", slug: "a-derma", logoKey: null, isActive: true },
];

const P = (
  id: string,
  name: string,
  slug: string,
  brandId: string,
  brandName: string,
  price: number,
  categories: string[],
  opts: {
    promotionalPrice?: number;
    stock?: number;
    sku?: string;
    description?: string;
  } = {},
): Product => ({
  id,
  name,
  slug,
  sku: opts.sku ?? null,
  brandId,
  brandName,
  description: opts.description ?? null,
  price,
  promotionalPrice: opts.promotionalPrice ?? null,
  stock: opts.stock ?? 25,
  isActive: true,
  images: [],
  categories: categories.map((slug) => {
    const cat = MOCK_CATEGORIES.find((c) => c.slug === slug)!;
    return { id: cat.id, name: cat.name, slug: cat.slug };
  }),
});

export const MOCK_PRODUCTS: Product[] = [
  P("p-01", "CeraVe Gel Nettoyant Visage", "cerave-gel-nettoyant-visage", "b-cerave", "CeraVe", 245, ["visage", "hygiene"], { promotionalPrice: 219, sku: "CER-001", description: "Gel nettoyant doux pour peaux normales à sèches, sans parfum." }),
  P("p-02", "CeraVe Crème Hydratante Visage & Corps", "cerave-creme-hydratante-visage-corps", "b-cerave", "CeraVe", 295, ["visage", "corps"], { sku: "CER-002", description: "Crème hydratante riche, céramides + acide hyaluronique." }),
  P("p-03", "CeraVe Lotion Hydratante", "cerave-lotion-hydratante", "b-cerave", "CeraVe", 265, ["visage", "corps"], { promotionalPrice: 239, sku: "CER-003" }),
  P("p-04", "Avène Eau Thermale Spray 150 ml", "avene-eau-thermale-spray-150ml", "b-avene", "Avène", 150, ["visage"], { sku: "AVE-001" }),
  P("p-05", "Avène Cicalfate+ Crème Réparatrice", "avene-cicalfate-plus-creme-reparatrice", "b-avene", "Avène", 210, ["visage", "sante"], { promotionalPrice: 179, sku: "AVE-002", description: "Crème réparatrice apaisante pour peaux irritées." }),
  P("p-06", "La Roche-Posay Effaclar Gel Purifiant", "la-roche-posay-effaclar-gel-purifiant", "b-lrp", "La Roche-Posay", 205, ["visage"], { sku: "LRP-001" }),
  P("p-07", "La Roche-Posay Anthelios UVMune 400 Crème", "la-roche-posay-anthelios-uvmune-400-creme", "b-lrp", "La Roche-Posay", 245, ["solaire", "visage"], { stock: 0, sku: "LRP-002" }),
  P("p-08", "Bioderma Sensibio H2O 500 ml", "bioderma-sensibio-h2o-500ml", "b-bioderma", "Bioderma", 175, ["visage", "hygiene"], { promotionalPrice: 149, sku: "BIO-001", description: "Eau micellaire démaquillante peaux sensibles." }),
  P("p-09", "Vichy Dercos Shampooing Anti-Chute", "vichy-dercos-shampooing-anti-chute", "b-vichy", "Vichy", 195, ["cheveux"], { sku: "VIC-001" }),
  P("p-10", "Nuxe Huile Sèche Multi-Usage", "nuxe-huile-seche-multi-usage", "b-nuxe", "Nuxe", 320, ["corps", "visage", "cheveux"], { promotionalPrice: 279, sku: "NUX-001", description: "Huile sèche visage, corps et cheveux aux parfums subtils." }),
  P("p-11", "SVR Sébiaclear Gel Nettoyant", "svr-sebiaclear-gel-nettoyant", "b-svr", "SVR", 240, ["visage"], { sku: "SVR-001" }),
  P("p-12", "Klorane Shampooing à l'Avocat", "klorane-shampooing-avocat", "b-klorane", "Klorane", 135, ["cheveux", "bio"], { sku: "KLO-001" }),
  P("p-13", "Uriage Eau Thermale 300 ml", "uriage-eau-thermale-300ml", "b-uriage", "Uriage", 165, ["visage"], { sku: "URI-001" }),
  P("p-14", "Mustela Crème Bébé Hydratante", "mustela-creme-bebe-hydratante", "b-mustela", "Mustela", 189, ["bebe-maman"], { stock: 0, sku: "MUS-001", description: "Crème hydratante pour la peau sensible de bébé." }),
  P("p-15", "Cetaphil Lotion Hydratante 473 ml", "cetaphil-lotion-hydratante-473ml", "b-cetaphil", "Cetaphil", 265, ["corps", "visage"], { sku: "CET-001" }),
  P("p-16", "A-Derma Dermalibour+ Crème Isolante", "a-derma-dermalibour-plus-creme-isolante", "b-adema", "A-Derma", 230, ["visage", "sante"], { promotionalPrice: 199, sku: "ADE-001" }),
];

function matchesTerm(product: Product, term: string): boolean {
  const haystack = [
    product.name,
    product.brandName,
    ...product.categories.map((c) => c.name),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(term.toLowerCase());
}

export async function listProducts(
  params: ListProductsParams,
): Promise<Paginated<Product>> {
  const page = Math.max(1, params.page);
  const pageSize = Math.min(Math.max(1, params.pageSize), 100);
  const from = (page - 1) * pageSize;

  let items = [...MOCK_PRODUCTS];

  const search = params.search;
  if (search) {
    items = items.filter((p) => matchesTerm(p, search));
  }
  if (params.categorySlug) {
    items = items.filter((p) =>
      p.categories.some((c) => c.slug === params.categorySlug),
    );
  }
  if (params.brandSlug) {
    items = items.filter((p) => p.brandId === params.brandSlug);
  }

  switch (params.sort ?? "newest") {
    case "price_asc":
      items.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      items.sort((a, b) => b.price - a.price);
      break;
    default:
      break;
  }

  const total = items.length;
  const pageItems = items.slice(from, from + pageSize);

  return {
    items: pageItems,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return MOCK_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export async function searchProducts(
  query: string,
  page: number,
  pageSize: number,
): Promise<Paginated<Product>> {
  const term = query.trim();
  if (!term) {
    return { items: [], page, pageSize, total: 0, totalPages: 0 };
  }
  return listProducts({ page, pageSize, search: term });
}

export async function listActiveCategories(): Promise<Category[]> {
  return MOCK_CATEGORIES.filter((c) => c.isActive);
}

export async function listActiveBrands(): Promise<Brand[]> {
  return MOCK_BRANDS.filter((b) => b.isActive);
}