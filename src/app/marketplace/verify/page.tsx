"use client";

import { Suspense } from "react";
import MarketplaceOtpVerify from "@/src/features/marketplace/auth/MarketplaceOtpVerify";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MarketplaceOtpVerify />
    </Suspense>
  );
}
