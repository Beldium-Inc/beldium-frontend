"use client";

import { useQuery } from "@tanstack/react-query";
import { Empty, Skeleton, Button } from "antd";
import Link from "next/link";
import RequireMarketplaceAuth from "@/src/features/marketplace/auth/RequireMarketplaceAuth";
import MarketplaceTopBar from "@/src/features/marketplace/components/MarketplaceTopBar";
import MarketplaceHeader from "@/src/features/marketplace/components/MarketplaceHeader";
import MarketplaceFooter from "@/src/features/marketplace/components/MarketplaceFooter";
import MarketplaceListingCard from "@/src/features/marketplace/components/MarketplaceListingCard";
import { getSavedListings } from "@/src/features/marketplace/public-api";

function SavedContent() {
  const { data, isLoading } = useQuery({
    queryKey: ["marketplace", "saved-listings"],
    queryFn: getSavedListings,
  });

  const listings = data?.results ?? [];

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <MarketplaceTopBar />
      <MarketplaceHeader search="" onSearch={() => {}} />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex-1 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Saved</h1>
        <p className="text-sm text-gray-500 mb-6">Listings you&apos;ve saved for later.</p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton.Image key={i} active className="!w-full !h-56" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white border border-[#E9ECF2] rounded-xl py-16">
            <Empty
              description={
                <div>
                  <p className="text-gray-900 font-medium mb-1">No saved listings yet</p>
                  <p className="text-sm text-gray-500">Tap &quot;Save&quot; on any listing to keep it here.</p>
                </div>
              }
            >
              <Link href="/marketplace">
                <Button type="primary">Browse marketplace</Button>
              </Link>
            </Empty>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <MarketplaceListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
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
