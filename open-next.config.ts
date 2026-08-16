import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

/**
 * OpenNext Cloudflare adapter configuration.
 *
 * The incremental cache is stored in an R2 bucket
 * (NEXT_INC_CACHE_R2_BUCKET binding) so ISR data and
 * revalidated pages survive across Worker restarts and
 * deployments.
 */
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});