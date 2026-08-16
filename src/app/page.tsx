import { Suspense } from "react";
import { CategoryNav } from "@/components/category-nav";
import { Container } from "@/components/ui/container";
import { CategoryDiscovery } from "./_sections/category-discovery";
import { FeaturedProducts } from "./_sections/featured-products";
import { Hero } from "./_sections/hero";
import { PromoBanner } from "./_sections/promo-banner";

// ISR: the public home page is revalidated at most every 5
// minutes (R2 incremental cache on Cloudflare, CDN serves the
// cached HTML to everyone). Never cache personal content.
export const revalidate = 300;

export default function Home() {
  return (
    <>
      <Hero />
      <div className="border-y border-line/60 bg-white/50 py-3">
        <Container>
          <Suspense fallback={null}>
            <CategoryNav />
          </Suspense>
        </Container>
      </div>
      <FeaturedProducts />
      <CategoryDiscovery />
      <PromoBanner />
    </>
  );
}