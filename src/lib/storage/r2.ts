/**
 * Cloudflare R2 storage client (S3-compatible API).
 *
 * R2 stores all uploaded media: product images, category
 * images, banners, logos. The PostgreSQL database stores the
 * object key (and derived public URL), never the binary.
 *
 * Read paths use the public bucket URL (NEXT_PUBLIC_R2_PUBLIC_URL).
 * Write paths (upload/delete) are server-only and use the R2
 * S3 API credentials from the server environment.
 */

import "server-only";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerEnv } from "@/lib/config/env";

let client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (client) return client;

  const env = getServerEnv();

  client = new S3Client({
    region: "auto",
    endpoint: `https://${env.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.r2AccessKeyId,
      secretAccessKey: env.r2SecretAccessKey,
    },
  });

  return client;
}

export function getR2BucketName(): string {
  return getServerEnv().r2BucketName;
}

/** Public URL of an object, built from the configured public base URL. */
export function getPublicImageUrl(key: string): string {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!base) {
    throw new Error(
      "Missing required public environment variable: NEXT_PUBLIC_R2_PUBLIC_URL",
    );
  }
  return `${base.replace(/\/$/, "")}/${key}`;
}

/** Server-side upload of an object to R2. */
export async function putObject(key: string, body: Buffer | Uint8Array, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: getR2BucketName(),
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  return getR2Client().send(command);
}

/** Server-side deletion of an object from R2. */
export async function deleteObject(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: getR2BucketName(),
    Key: key,
  });
  return getR2Client().send(command);
}

/**
 * Presigned upload URL for direct browser-to-R2 uploads
 * (used later by the administration interface).
 */
export async function createPresignedUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: getR2BucketName(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(getR2Client(), command, { expiresIn: 60 * 15 });
}