import Link from "next/link";
import { SearchBar } from "@/components/search/search-bar";
import { CartIcon, UserIcon } from "@/components/ui/icons";
import { MobileMenu } from "./mobile-menu";

const NAV_LINKS = [
  { href: "/recherche", label: "Boutique" },
  { href: "/recherche?cat=bio", label: "Bio" },
  { href: "/recherche?cat=solaire", label: "Solaire" },
  { href: "/recherche?cat=promotion", label: "Promotions" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40">
      <div className="glass border-x-0 border-t-0">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:h-[4.5rem] lg:px-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2"
            aria-label="Parapharmacie — accueil"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-ink">
              P
            </span>
            <span className="hidden text-lg font-bold tracking-tight sm:block">
              Parapharmacie
            </span>
          </Link>

          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto hidden w-full max-w-sm md:block lg:max-w-md">
            <SearchBar />
          </div>

          <div className="flex items-center gap-1">
            <Link
              href="/compte"
              aria-label="Mon compte"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft hover:bg-ink/5 hover:text-ink"
            >
              <UserIcon />
            </Link>
            <Link
              href="/panier"
              aria-label="Mon panier"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft hover:bg-ink/5 hover:text-ink"
            >
              <CartIcon />
            </Link>
            <div className="ml-1 md:hidden">
              <MobileMenu />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-3 pt-2 sm:px-6 md:hidden lg:px-8">
        <SearchBar />
      </div>
    </header>
  );
}