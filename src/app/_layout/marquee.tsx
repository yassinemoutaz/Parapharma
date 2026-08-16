export function Marquee() {
  const message = "LIVRAISON GRATUITE PARTOUT À CASABLANCA";

  return (
    <div
      className="relative h-9 overflow-hidden bg-black text-white"
      role="region"
      aria-label="Annonce"
    >
      <div className="marquee-track items-center h-full">
        {[0, 1].map((copy) => (
          <p
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 items-center text-xs font-semibold tracking-[0.18em]"
          >
            {message}
            <span aria-hidden="true" className="mx-6 text-primary">
              ●
            </span>
            {message}
            <span aria-hidden="true" className="mx-6 text-primary">
              ●
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}