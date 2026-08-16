import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ChevronRightIcon } from "@/components/ui/icons";
import { Section, SectionHeader } from "@/components/ui/section";
import { listActiveCategories } from "@/lib/data/catalogue";

const TILE_STYLES = [
  "from-primary/25 to-sage/25",
  "from-sage/30 to-mist",
  "from-primary/15 to-mist",
  "from-white to-sage/20",
];

export async function CategoryDiscovery() {
  const categories = await listActiveCategories();

  return (
    <Section ariaLabelledBy="discovery-title" className="bg-white/40">
      <Container>
        <SectionHeader
          id="discovery-title"
          title="Explorez nos rayons"
          subtitle="Trouvez le produit qu'il vous faut"
        />
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <li key={cat.id} className="min-w-0">
              <Link
                href={`/recherche?cat=${cat.slug}`}
                className={`group flex h-24 items-center justify-between rounded-2xl border border-white/60 bg-gradient-to-br p-4 shadow-soft transition-shadow hover:shadow-glass sm:h-28 ${TILE_STYLES[i % TILE_STYLES.length]}`}
              >
                <span className="text-sm font-bold leading-snug text-ink sm:text-base">
                  {cat.name}
                </span>
                <ChevronRightIcon className="shrink-0 text-primary-deep transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}