import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFoundPage() {
  return (
    <Container className="py-20">
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary-deep">
          Page introuvable
        </p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight">
          Cette page n'existe pas
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Le lien que vous avez suivi est peut-être obsolète, ou la
          page n'est pas encore disponible.
        </p>
        <div className="mt-6 flex justify-center">
          <ButtonLink href="/">Retour à l'accueil</ButtonLink>
        </div>
      </div>
    </Container>
  );
}