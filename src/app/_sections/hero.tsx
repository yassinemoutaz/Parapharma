import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  ArrowRightIcon,
  ShieldCheckIcon,
  SparkleIcon,
  TruckIcon,
} from "@/components/ui/icons";

const TRUST_ITEMS = [
  { icon: TruckIcon, label: "Livraison gratuite à Casablanca" },
  { icon: ShieldCheckIcon, label: "Produits 100 % authentiques" },
  { icon: SparkleIcon, label: "Conseils de pharmaciens" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-primary/25 via-mist to-sage/30"
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-sage/30 blur-3xl"
      />

      <Container className="relative py-14 sm:py-20 lg:py-24">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-white/70 px-3.5 py-1 text-xs font-semibold tracking-wide text-primary-deep">
            <SparkleIcon className="h-3.5 w-3.5" />
            Parapharmacie en ligne au Maroc
          </p>

          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Votre santé et votre beauté,{" "}
            <span className="text-primary-deep">livrées à Casablanca</span>
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
            Dermo-cosmétique, soins du visage, hygiène, produits
            bébé et para-médical : les plus grandes marques,
            sélectionnées par nos pharmaciens.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <ButtonLink href="/recherche" size="lg">
              Découvrir la boutique
              <ArrowRightIcon />
            </ButtonLink>
            <ButtonLink href="/recherche?cat=promotion" size="lg" variant="secondary">
              Voir les promotions
            </ButtonLink>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            {TRUST_ITEMS.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-2 text-sm font-medium text-ink-soft"
              >
                <item.icon className="shrink-0 text-primary-dark" />
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}