"use client";

import { Inter } from "next/font/google";
import { ConfigProvider } from "antd";

// The marketing site (beldium-landingPage) - whose Header/Footer were
// ported into MarketplaceHeader/MarketplaceFooter - uses Inter as both its
// body and heading (`font-display`) family (see beldium-landingPage/
// tailwind.config.ts + src/index.css). Scoped to /marketplace only so the
// rest of the app (dashboard, compliance) keeps its existing Poppins setup.
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-marketplace-inter",
  display: "swap",
});

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={inter.variable}
      style={{ fontFamily: "var(--font-marketplace-inter), system-ui, sans-serif" }}
    >
      {/* Nested ConfigProvider merges with the root one (AntProvider.tsx) -
          only fontFamily is overridden here, so antd inputs/buttons inside
          the marketplace render in Inter instead of the app-wide Poppins. */}
      <ConfigProvider theme={{ token: { fontFamily: "var(--font-marketplace-inter), system-ui, sans-serif" } }}>
        {children}
      </ConfigProvider>
    </div>
  );
}
