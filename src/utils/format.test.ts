import { describe, expect, it } from "vitest";
import { formatDate, formatPrice, slugify } from "@/utils/format";

describe("formatPrice", () => {
  it("formats amounts in Moroccan Dirhams", () => {
    expect(formatPrice(1250)).toContain("1");
    expect(formatPrice(1250)).toContain("MAD");
  });

  it("formats decimal amounts with two digits", () => {
    const formatted = formatPrice(19.9);
    expect(formatted).toContain("19,90");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toContain("0");
  });
});

describe("formatDate", () => {
  it("formats an ISO date", () => {
    expect(formatDate("2026-08-16T10:00:00Z")).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });
});

describe("slugify", () => {
  it("normalizes accents and lowercases", () => {
    expect(slugify("Crème Hydratante")).toBe("creme-hydratante");
  });

  it("removes leading and trailing separators", () => {
    expect(slugify("  CeraVe  ")).toBe("cerave");
  });

  it("replaces spaces with dashes", () => {
    expect(slugify("La Roche Posay")).toBe("la-roche-posay");
  });
});