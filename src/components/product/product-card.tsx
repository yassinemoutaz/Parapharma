import Link from "next/link";
import type { Product } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductImage } from "./product-image";

function discountPercent(price: number, promo: number): number {
  return Math.round(((price - promo) / price) * 100);
}

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { promotionalPrice, price, stock } = product;
  const hasPromo = promotionalPrice !== null && promotionalPrice < price;
  const outOfStock = stock <= 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-soft transition-shadow duration-300 hover:shadow-glass">
      <Link
        href={`/produit/${product.slug}`}
        className="relative block"
        aria-label={product.name}
      >
        <ProductImage r2Key={product.images[0]?.r2Key} name={product.name} priority={priority} />

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {hasPromo ? (
            <Badge variant="sale">−{discountPercent(price, promotionalPrice!)} %</Badge>
          ) : null}
          {outOfStock ? <Badge variant="promo">Rupture</Badge> : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3.5 sm:p-4">
        <div className="min-h-0 flex-1">
          {product.brandName ? (
            <p className="text-[11px] font-bold uppercase tracking-wide text-primary-deep">
              {product.brandName}
            </p>
          ) : null}
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-ink">
            <Link href={`/produit/${product.slug}`} className="hover:text-primary-deep">
              {product.name}
            </Link>
          </h3>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-ink">
            {(promotionalPrice ?? price).toFixed(2)} DH
          </span>
          {hasPromo ? (
            <span className="text-xs text-ink-soft line-through">{price.toFixed(2)} DH</span>
          ) : null}
        </div>

        <AddToCartButton productId={product.id} inStock={!outOfStock} />
      </div>
    </article>
  );
}