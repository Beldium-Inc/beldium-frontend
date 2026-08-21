"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Skeleton } from "antd";
import { useMarketplaceAuth } from "./use-marketplace-auth";

export default function RequireMarketplaceAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useMarketplaceAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/marketplace/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return <>{children}</>;
}
