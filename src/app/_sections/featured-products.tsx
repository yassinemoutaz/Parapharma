import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  ProductGrid,
  ProductGridSkeleton,
} from "@/components/product/product-grid";
import { Section, SectionHeader } from "@/components/ui/section";
import { listProducts } from "@/lib/data/catalogue";

async function FeaturedProductsContent() {
  const { items } = await listProducts({ page: 1, pageSize: 8, sort: "newest" });
  return <ProductGrid products={items} priorityCount={2} />;
}

export function FeaturedProducts() {
  return (
    <Section ariaLabelledBy="featured-title">
      <Container>
        <SectionHeader
          id="featured-title"
          title="Produits phares"
          subtitle="Une sélection des marques que vous aimez"
          action={
            <ButtonLink href="/recherche" variant="ghost">
              Tout voir
            </ButtonLink>
          }
        />
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <FeaturedProductsContent />
        </Suspense>
      </Container>
    </Section>
  );
}