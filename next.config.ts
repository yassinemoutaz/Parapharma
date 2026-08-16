import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

const nextConfig: NextConfig = {
  images: r2PublicUrl
    ? {
        remotePatterns: [
          { protocol: "https", hostname: new URL(r2PublicUrl).hostname },
        ],
      }
    : {},
};

export default nextConfig;

initOpenNextCloudflareForDev();