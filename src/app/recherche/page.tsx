import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import {
  ProductGrid,
  ProductGridSkeleton,
} from "@/components/product/product-grid";
import { Section } from "@/components/ui/section";
import { listProducts } from "@/lib/data/catalogue";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/ui/icons";

const PAGE_SIZE = 24;
const MAX_QUERY_LENGTH = 60;

export const metadata: Metadata = {
  title: "Recherche",
};

async function Results({
  q,
  cat,
  page,
}: {
  q: string | undefined;
  cat: string | undefined;
  page: number;
}) {
  const { items, total, totalPages } = await listProducts({
    page,
    pageSize: PAGE_SIZE,
    search: q,
    categorySlug: cat,
  });

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/60 bg-white/70 p-10 text-center shadow-soft">
        <p className="text-lg font-bold">Aucun produit trouvé</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
          {q
            ? `Aucun résultat pour « ${q} ». Vérifiez l'orthographe ou essayez un autre terme.`
            : "Aucun produit dans cette catégorie pour le moment."}
        </p>
        <div className="mt-6 flex justify-center">
          <ButtonLink href="/recherche">Voir tous les produits</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <>
      <p className="mb-5 text-sm text-ink-soft">
        {total} produit{total > 1 ? "s" : ""}
        {q ? <> pour « {q} »</> : null}
      </p>

      <ProductGrid products={items} />

      {totalPages > 1 ? (
        <nav
          aria-label="Pagination des résultats"
          className="mt-10 flex items-center justify-center gap-3"
        >
          {page > 1 ? (
            <ButtonLink
              href={{
                pathname: "/recherche",
                query: { q, cat, page: page - 1 },
              }}
              variant="secondary"
              size="sm"
            >
              Page précédente
            </ButtonLink>
          ) : null}
          <span className="text-sm text-ink-soft">
            Page {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <ButtonLink
              href={{
                pathname: "/recherche",
                query: { q, cat, page: page + 1 },
              }}
              variant="secondary"
              size="sm"
            >
              Page suivante
              <ArrowRightIcon />
            </ButtonLink>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; page?: string }>;
}) {
  const { q, cat, page: pageParam } = await searchParams;
  const query = q?.trim().slice(0, MAX_QUERY_LENGTH) || undefined;
  const rawPage = Number(pageParam ?? "1");
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const title = cat
    ? "Catégorie"
    : query
      ? `Résultats pour « ${query} »`
      : "Tous les produits";

  return (
    <Section ariaLabelledBy="search-title">
      <Container>
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <nav aria-label="Fil d'Ariane" className="mb-2 text-xs text-ink-soft">
              <Link href="/" className="hover:text-primary-dark">
                Accueil
              </Link>{" "}
              / <span aria-current="page">Recherche</span>
            </nav>
            <h1 id="search-title" className="text-xl font-bold tracking-tight sm:text-2xl">
              {title}
            </h1>
          </div>
          {cat ? (
            <Link
              href="/recherche"
              className="text-sm font-medium text-primary-dark hover:underline"
            >
              Effacer le filtre
            </Link>
          ) : null}
        </div>

        <Suspense
          fallback={<ProductGridSkeleton count={8} />}
          key={`${query ?? ""}-${cat ?? ""}-${page}`}
        >
          <Results q={query} cat={cat} page={page} />
        </Suspense>
      </Container>
    </Section>
  );
}