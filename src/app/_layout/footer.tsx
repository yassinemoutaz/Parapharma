import Link from "next/link";
import { Container } from "@/components/ui/container";
import {
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/ui/icons";

const SHOP_LINKS = [
  { href: "/recherche", label: "Tous les produits" },
  { href: "/recherche?cat=promotion", label: "Promotions" },
  { href: "/recherche?cat=cheveux", label: "Cheveux" },
  { href: "/recherche?cat=corps", label: "Corps" },
];

const SERVICE_LINKS = [
  { href: "/livraison", label: "Livraison & retours" },
  { href: "/faq", label: "Questions fréquentes" },
  { href: "/contact", label: "Contact" },
  { href: "/compte", label: "Mon compte" },
];

const LEGAL_LINKS = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgv", label: "Conditions générales de vente" },
  { href: "/confidentialite", label: "Politique de confidentialité" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-white/60">
      <Container className="py-12 sm:py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-ink">
                P
              </span>
              <span className="text-lg font-bold tracking-tight">Parapharmacie</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
              Votre parapharmacie en ligne au Maroc : produits
              authentiques, conseils professionnels et livraison
              rapide à Casablanca.
            </p>
          </div>

          <nav aria-label="Navigation boutique">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink">
              Boutique
            </h2>
            <ul className="mt-4 space-y-2.5">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-soft transition-colors hover:text-primary-dark"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Service client">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink">
              Service client
            </h2>
            <ul className="mt-4 space-y-2.5">
              {SERVICE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-soft transition-colors hover:text-primary-dark"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 md:col-span-1">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink">
              Contact
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
              <li className="flex items-start gap-2.5">
                <MapPinIcon className="mt-0.5 shrink-0 text-primary-dark" />
                <span>
                  Adresse de la parapharmacie à préciser — Casablanca, Maroc
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <PhoneIcon className="shrink-0 text-primary-dark" />
                <span>+212 0 00 00 00 00</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MailIcon className="shrink-0 text-primary-dark" />
                <span>contact@exemple.ma</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
          <p className="text-xs text-ink-soft">
            © {new Date().getFullYear()} Parapharmacie. Tous droits réservés.
          </p>
          <nav aria-label="Mentions légales">
            <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-ink-soft transition-colors hover:text-primary-dark"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  );
}