import { describe, expect, it } from "vitest";
import { getImageUrl } from "@/lib/storage/image-url";

describe("getImageUrl", () => {
  it("builds the public URL from a key and base", () => {
    expect(getImageUrl("products/cerave.jpg", "https://cdn.example.com")).toBe(
      "https://cdn.example.com/products/cerave.jpg",
    );
  });

  it("strips a trailing slash from the base", () => {
    expect(getImageUrl("a.jpg", "https://cdn.example.com/")).toBe(
      "https://cdn.example.com/a.jpg",
    );
  });

  it("returns null when the key is missing", () => {
    expect(getImageUrl(null, "https://cdn.example.com")).toBeNull();
    expect(getImageUrl(undefined, "https://cdn.example.com")).toBeNull();
  });

  it("returns null when the base URL is not configured", () => {
    expect(getImageUrl("a.jpg", undefined)).toBeNull();
  });
});