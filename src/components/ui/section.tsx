import type { ReactNode } from "react";

export function Section({
  children,
  className = "",
  ariaLabelledBy,
}: {
  children: ReactNode;
  className?: string;
  ariaLabelledBy?: string;
}) {
  return (
    <section
      className={`py-10 sm:py-14 lg:py-16 ${className}`}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  id,
  title,
  subtitle,
  action,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
      <div>
        <h2 id={id} className="text-xl font-bold tracking-tight sm:text-2xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}