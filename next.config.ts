import type { NextConfig } from "next";

const STAGING_BASE_URL = "https://stg-api.beldium.com";
const PRODUCTION_BASE_URL = "https://api.beldium.com";

const getApiOrigin = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  switch (process.env.NEXT_PUBLIC_APP_ENV?.toLowerCase()) {
    case "production":
    case "prod":
      return PRODUCTION_BASE_URL;
    case "staging":
    case "stage":
    default:
      return STAGING_BASE_URL;
  }
};

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  skipTrailingSlashRedirect: true,
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    const origin = getApiOrigin();
    return [
      // Next.js drops the trailing slash from the `:path*` wildcard capture,
      // which breaks Django's APPEND_SLASH-based routes (they 301-redirect,
      // and the redirect's Location header isn't rewritten back through /api,
      // sending the browser to a non-existent un-proxied path). Matching the
      // trailing slash explicitly preserves it in the destination.
      {
        source: "/api/:path*/",
        destination: `${origin}/:path*/`,
      },
      {
        source: "/api/:path*",
        destination: `${origin}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
    ],
  },
};

export default nextConfig;
