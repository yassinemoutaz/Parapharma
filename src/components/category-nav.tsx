"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const CATEGORIES = [
  { slug: "visage", label: "Visage" },
  { slug: "maquillage", label: "Maquillage" },
  { slug: "corps", label: "Corps" },
  { slug: "cheveux", label: "Cheveux" },
  { slug: "bebe-maman", label: "Bébé & Maman" },
  { slug: "homme", label: "Homme" },
  { slug: "hygiene", label: "Hygiène" },
  { slug: "solaire", label: "Solaire" },
  { slug: "sante", label: "Santé" },
  { slug: "para-medical", label: "Para-médical" },
  { slug: "bio", label: "Bio" },
  { slug: "promotion", label: "Promotion" },
];

/**
 * Horizontal category navigation.
 *
 * The active category is the one selected in the search
 * parameters (?cat=...). On mobile the row scrolls
 * horizontally ONLY inside this element (overflow-x-auto);
 * the page itself never scrolls horizontally.
 *
 * The labels are currently static UI navigation; when the
 * database is connected they must be replaced by the real
 * category data layer (src/lib/data/catalogue.ts) — the
 * rendering contract stays identical.
 */
export function CategoryNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("cat");

  return (
    <nav
      aria-label="Catégories de produits"
      className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      <ul className="flex w-max items-center gap-1.5 sm:gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = pathname === "/recherche" && active === cat.slug;
          return (
            <li key={cat.slug}>
              <Link
                href={`/recherche?cat=${cat.slug}`}
                aria-current={isActive ? "page" : undefined}
                className={`flex h-10 items-center whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-primary bg-primary text-ink font-semibold"
                    : "border-line bg-white/70 text-ink-soft hover:border-primary/50 hover:text-ink"
                }`}
              >
                {cat.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}