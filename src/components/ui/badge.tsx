import type { ReactNode } from "react";

type Variant = "sale" | "stock" | "promo" | "neutral";

const variantClasses: Record<Variant, string> = {
  sale: "bg-primary/15 text-primary-deep",
  stock: "bg-sage/20 text-primary-deep",
  promo: "bg-ink text-white",
  neutral: "bg-white text-ink-soft border border-line",
};

export function Badge({
  variant = "neutral",
  children,
  className = "",
}: {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}