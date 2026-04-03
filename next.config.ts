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
    return [
      {
        source: "/api/:path*",
        destination: `${getApiOrigin()}/:path*`,
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
