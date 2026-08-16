import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/data/catalogue";

export const dynamic = "force-dynamic";

const MAX_QUERY_LENGTH = 60;
const SUGGESTION_LIMIT = 6;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2 || q.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ items: [] });
  }

  try {
    const result = await searchProducts(q, 1, SUGGESTION_LIMIT);

    const items = result.items.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      brandName: p.brandName,
      price: p.price,
      promotionalPrice: p.promotionalPrice,
    }));

    // Public, cacheable at the CDN: suggestions are the same
    // for every visitor, so the CDN serves repeat queries
    // without hitting the Worker. Browser cache stays off
    // (no-cache) to keep suggestions fresh.
    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "public, s-maxage=60, no-cache" } },
    );
  } catch (error) {
    console.error("search suggestions failed", error);
    // Never fail the whole navbar for a search hiccup.
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}