import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-ink font-semibold hover:bg-[#8cd763] active:bg-[#6cb943]",
  secondary:
    "bg-white text-ink border border-line font-semibold hover:border-ink-soft/40 hover:bg-mist/60",
  ghost:
    "text-ink-soft font-medium hover:text-ink hover:bg-ink/5",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-lg gap-1.5",
  md: "h-11 px-5 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-base rounded-xl gap-2",
};

const baseClasses =
  "inline-flex items-center justify-center whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-dark disabled:cursor-not-allowed disabled:opacity-50";

export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentPropsWithoutRef<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button className={`${buttonClasses(variant, size)} ${className}`} {...props} />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ComponentPropsWithoutRef<typeof Link> & { variant?: Variant; size?: Size; children: ReactNode }) {
  return (
    <Link className={`${buttonClasses(variant, size)} ${className}`} {...props}>
      {children}
    </Link>
  );
}