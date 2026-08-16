"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="py-20">
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary-deep">
          Une erreur est survenue
        </p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight">
          Quelque chose s'est mal passé
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Veuillez réessayer. Si le problème persiste, contactez notre
          service client.
        </p>
        <div className="mt-6 flex justify-center">
          <Button onClick={() => reset()}>Réessayer</Button>
        </div>
      </div>
    </Container>
  );
}