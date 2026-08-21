"use client";

import { Suspense } from "react";
import MarketplaceLogin from "@/src/features/marketplace/auth/MarketplaceLogin";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MarketplaceLogin />
    </Suspense>
  );
}
