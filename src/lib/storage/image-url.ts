/**
 * Builds the public URL of an R2 object from its key.
 *
 * Null-safe variant used by the UI: returns null when the key
 * or the public base URL is not configured, so components can
 * fall back to their placeholder rendering without throwing.
 */

export function getImageUrl(
  key: string | null | undefined,
  base: string | undefined = process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
): string | null {
  if (!key || !base) return null;
  return `${base.replace(/\/$/, "")}/${key}`;
}