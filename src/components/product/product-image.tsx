import Image from "next/image";
import { getImageUrl } from "@/lib/storage/image-url";

/**
 * Product image with a consistent aspect ratio.
 *
 * Renders the R2 image when a key and the public URL are
 * configured; otherwise a clean placeholder with the product
 * initial (no broken images, no distorted ratios).
 *
 * unoptimized: R2 originals are already sized and compressed
 * for display, and served through the CDN. Skipping the image
 * optimizer avoids Worker CPU per request (the optimizer runs
 * inside the application Worker on Cloudflare).
 */
export function ProductImage({
  r2Key,
  name,
  priority = false,
}: {
  r2Key: string | null | undefined;
  name: string;
  priority?: boolean;
}) {
  const url = getImageUrl(r2Key);

  return (
    <div className="relative aspect-square w-full overflow-hidden bg-white">
      {url ? (
        <Image
          src={url}
          alt={name}
          fill
          unoptimized
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 via-white to-sage/20"
        >
          <span className="text-4xl font-extrabold uppercase tracking-tight text-primary-deep/40">
            {name.charAt(0)}
          </span>
        </div>
      )}
    </div>
  );
}