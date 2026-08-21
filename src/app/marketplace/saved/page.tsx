"use client";

import RequireMarketplaceAuth from "@/src/features/marketplace/auth/RequireMarketplaceAuth";
import MarketplaceTopBar from "@/src/features/marketplace/components/MarketplaceTopBar";
import MarketplaceHeader from "@/src/features/marketplace/components/MarketplaceHeader";
import MarketplaceFooter from "@/src/features/marketplace/components/MarketplaceFooter";

function SavedContent() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <MarketplaceTopBar />
      <MarketplaceHeader search="" onSearch={() => {}} />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 flex-1 w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Saved</h1>
        <p className="text-sm text-gray-500">
          Listings you save will appear here. This page is coming soon.
        </p>
      </div>
      <MarketplaceFooter />
    </div>
  );
}

export default function SavedPage() {
  return (
    <RequireMarketplaceAuth>
      <SavedContent />
    </RequireMarketplaceAuth>
  );
}
