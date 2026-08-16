import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/60 bg-white/80 shadow-soft ${className}`}
    >
      {children}
    </div>
  );
}