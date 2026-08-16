"use client";

import { useState } from "react";
import Link from "next/link";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";

const LINKS = [
  { href: "/recherche", label: "Boutique" },
  { href: "/recherche?cat=bio", label: "Bio" },
  { href: "/recherche?cat=solaire", label: "Solaire" },
  { href: "/recherche?cat=promotion", label: "Promotions" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink hover:bg-ink/5"
      >
        <MenuIcon />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navigation"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav className="glass absolute inset-x-3 top-3 rounded-2xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink hover:bg-ink/5"
              >
                <CloseIcon />
              </button>
            </div>
            <ul className="flex flex-col">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between border-b border-line/70 py-3 text-sm font-medium text-ink hover:text-primary-dark"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </div>
  );
}