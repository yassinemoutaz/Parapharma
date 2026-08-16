import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { ProductImage } from "@/components/product/product-image";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getProductBySlug, listProducts } from "@/lib/data/catalogue";

export const metadata: Metadata = {
  title: "Produit",
};

// ISR: known product slugs are prerendered at build time; any
// other slug is rendered on demand and then cached. Pages are
// revalidated at most every 5 minutes (R2 incremental cache).
export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const { items } = await listProducts({ page: 1, pageSize: 100 });
  return items.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const hasPromo = product.promotionalPrice !== null && product.promotionalPrice < product.price;
  const outOfStock = product.stock <= 0;

  return (
    <Container className="py-10 sm:py-14">
      <nav aria-label="Fil d'Ariane" className="mb-5 text-xs text-ink-soft">
        <Link href="/" className="hover:text-primary-dark">
          Accueil
        </Link>{" "}
        /{" "}
        {product.categories[0] ? (
          <>
            <Link
              href={`/recherche?cat=${product.categories[0].slug}`}
              className="hover:text-primary-dark"
            >
              {product.categories[0].name}
            </Link>{" "}
            /{" "}
          </>
        ) : null}
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-soft">
          <ProductImage r2Key={product.images[0]?.r2Key} name={product.name} priority />
        </div>

        <div className="flex flex-col">
          {product.brandName ? (
            <p className="text-xs font-bold uppercase tracking-wide text-primary-deep">
              {product.brandName}
            </p>
          ) : null}
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {hasPromo ? <Badge variant="sale">Promotion</Badge> : null}
            {outOfStock ? (
              <Badge variant="promo">Rupture de stock</Badge>
            ) : (
              <Badge variant="stock">En stock</Badge>
            )}
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-ink">
              {(product.promotionalPrice ?? product.price).toFixed(2)} DH
            </span>
            {hasPromo ? (
              <span className="text-lg text-ink-soft line-through">
                {product.price.toFixed(2)} DH
              </span>
            ) : null}
          </div>

          {product.description ? (
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-ink-soft sm:text-base">
              {product.description}
            </p>
          ) : null}

          <div className="mt-8 max-w-sm">
            <AddToCartButton productId={product.id} inStock={!outOfStock} />
          </div>

          {product.sku ? (
            <p className="mt-6 text-xs text-ink-soft">Référence : {product.sku}</p>
          ) : null}

          <div className="mt-8 border-t border-line pt-6">
            <ButtonLink href="/recherche" variant="ghost">
              Retour à la boutique
            </ButtonLink>
          </div>
        </div>
      </div>
    </Container>
  );
}