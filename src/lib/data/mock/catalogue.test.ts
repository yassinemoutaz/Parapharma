import { describe, expect, it } from "vitest";
import {
  listProducts,
  searchProducts,
} from "@/lib/data/mock/catalogue";

describe("mock catalogue — search", () => {
  it("matches Cera against product names and brands", async () => {
    const result = await searchProducts("Cera", 1, 24);
    expect(result.items.length).toBeGreaterThan(0);
    expect(
      result.items.every(
        (p) => p.name.includes("CeraVe") || p.brandName === "CeraVe",
      ),
    ).toBe(true);
  });

  it("is case-insensitive", async () => {
    const result = await searchProducts("CRÈME HYDRATANTE", 1, 24);
    expect(
      result.items.some((p) => p.name.includes("Crème Hydratante")),
    ).toBe(true);
  });

  it("returns empty results for an empty query", async () => {
    const result = await searchProducts("   ", 1, 24);
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});

describe("mock catalogue — pagination", () => {
  it("pages through the catalogue", async () => {
    const page1 = await listProducts({ page: 1, pageSize: 8 });
    const page2 = await listProducts({ page: 2, pageSize: 8 });

    expect(page1.items).toHaveLength(8);
    expect(page2.items).toHaveLength(8);
    expect(page1.items[0].id).not.toBe(page2.items[0].id);
    expect(page1.totalPages).toBeGreaterThan(1);
  });

  it("caps pageSize at 100", async () => {
    const result = await listProducts({ page: 1, pageSize: 500 });
    expect(result.pageSize).toBe(100);
  });
});

describe("mock catalogue — filters and sort", () => {
  it("filters by category slug", async () => {
    const result = await listProducts({
      page: 1,
      pageSize: 24,
      categorySlug: "cheveux",
    });
    expect(result.items.length).toBeGreaterThan(0);
    expect(
      result.items.every((p) => p.categories.some((c) => c.slug === "cheveux")),
    ).toBe(true);
  });

  it("sorts by price ascending", async () => {
    const result = await listProducts({
      page: 1,
      pageSize: 24,
      sort: "price_asc",
    });
    const prices = result.items.map((p) => p.price);
    expect([...prices].sort((a, b) => a - b)).toEqual(prices);
  });

  it("exposes promotional products with a valid discount", async () => {
    const { items } = await listProducts({ page: 1, pageSize: 24 });
    const promo = items.find((p) => p.promotionalPrice !== null);
    expect(promo).toBeDefined();
    expect(promo!.promotionalPrice!).toBeLessThan(promo!.price);
  });
});