"use client";

import { useState } from "react";
import { CheckIcon, PlusIcon } from "@/components/ui/icons";

/**
 * Add-to-cart action.
 *
 * Placeholder behavior until the cart phase: the click gives
 * visual confirmation only; no backend mutation happens yet.
 * The cart service will replace this handler without changing
 * the component contract.
 */
export function AddToCartButton({
  productId,
  inStock,
}: {
  productId: string;
  inStock: boolean;
}) {
  const [added, setAdded] = useState(false);

  if (!inStock) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-line bg-mist/60 text-sm font-medium text-ink-soft"
      >
        Rupture de stock
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label="Ajouter au panier"
      onClick={() => {
        setAdded(true);
        setTimeout(() => setAdded(false), 1600);
      }}
      className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors ${
        added
          ? "bg-primary-deep text-white"
          : "bg-primary text-ink hover:bg-[#8cd763]"
      }`}
    >
      {added ? <CheckIcon /> : <PlusIcon />}
      {added ? "Ajouté" : "Ajouter"}
    </button>
  );
}