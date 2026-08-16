import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon, SparkleIcon } from "@/components/ui/icons";

export function PromoBanner() {
  return (
    <section aria-labelledby="promo-title">
      <Container className="py-10 sm:py-14">
        <div className="glass-dark relative overflow-hidden rounded-3xl px-6 py-10 text-white sm:px-10 sm:py-12">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-sage/25 blur-3xl"
          />

          <div className="relative max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3.5 py-1 text-xs font-semibold tracking-wide">
              <SparkleIcon className="h-3.5 w-3.5 text-primary" />
              Offre de bienvenue
            </p>
            <h2 id="promo-title" className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
              −10 % sur votre première commande
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/80 sm:text-base">
              Avec le code <strong className="font-semibold text-white">BIENVENUE10</strong>,
              valable sur tout le site, livraison gratuite incluse à Casablanca.
            </p>
            <div className="mt-6">
              <ButtonLink
                href="/recherche?cat=promotion"
                size="lg"
                className="bg-primary text-ink hover:bg-[#8cd763]"
              >
                J'en profite
                <ArrowRightIcon />
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}