import type { ComponentPropsWithoutRef } from "react";

export function Input({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"input">) {
  return (
    <input
      className={`h-11 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary-dark focus:outline-none ${className}`}
      {...props}
    />
  );
}