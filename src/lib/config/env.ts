import "server-only";

/**
 * Server-only environment configuration.
 *
 * Validated lazily (on first access) so that `next build` and
 * Cloudflare build can run without real secrets present.
 *
 * NEVER import this module from client code: it throws if a
 * secret is missing, and it would leak secrets into the
 * browser bundle.
 */

let cached: ServerEnv | null = null;

export interface ServerEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  r2AccountId: string;
  r2AccessKeyId: string;
  r2SecretAccessKey: string;
  r2BucketName: string;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }
  return value;
}

export function getServerEnv(): ServerEnv {
  if (cached) return cached;

  cached = {
    supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
    r2AccountId: required("R2_ACCOUNT_ID"),
    r2AccessKeyId: required("R2_ACCESS_KEY_ID"),
    r2SecretAccessKey: required("R2_SECRET_ACCESS_KEY"),
    r2BucketName: required("R2_BUCKET_NAME"),
  };

  return cached;
}