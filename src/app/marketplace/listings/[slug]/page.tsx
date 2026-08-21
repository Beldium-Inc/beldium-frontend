"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button, Skeleton, Tag } from "antd";
import { CheckCircleFilled, ShareAltOutlined, BookOutlined } from "@ant-design/icons";
import { getPublicListingDetail } from "@/src/features/marketplace/public-api";
import MarketplaceTopBar from "@/src/features/marketplace/components/MarketplaceTopBar";
import MarketplaceHeader from "@/src/features/marketplace/components/MarketplaceHeader";
import MarketplaceFooter from "@/src/features/marketplace/components/MarketplaceFooter";
import ListingGallery from "@/src/features/marketplace/components/detail/ListingGallery";
import MaterialDetails from "@/src/features/marketplace/components/detail/MaterialDetails";
import AboutMaterial from "@/src/features/marketplace/components/detail/AboutMaterial";
import MaterialDocuments from "@/src/features/marketplace/components/detail/MaterialDocuments";
import PricingCard from "@/src/features/marketplace/components/detail/PricingCard";
import SellerCard from "@/src/features/marketplace/components/detail/SellerCard";
import CommercialTermsCard from "@/src/features/marketplace/components/detail/CommercialTermsCard";
import ShippingDeliveryCard from "@/src/features/marketplace/components/detail/ShippingDeliveryCard";

export default function ListingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const { data: listing, isLoading, isError } = useQuery({
    queryKey: ["marketplace", "listing-detail", slug],
    queryFn: () => getPublicListingDetail(slug),
  });

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <MarketplaceTopBar />
      <MarketplaceHeader search="" onSearch={() => {}} />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : isError || !listing ? (
          <div className="text-center py-24 text-gray-500">
            Listing not found.{" "}
            <Link href="/marketplace" className="text-[#101E3D] underline">
              Back to marketplace
            </Link>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-500 mb-4">
              <Link href="/marketplace" className="hover:underline">
                Marketplace
              </Link>{" "}
              <span className="mx-1">›</span> {listing.mineral_type}
            </div>

            <div className="flex items-start justify-between gap-4 mb-1 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900">{listing.mineral_type}</h1>
                  <Tag>Sponsored</Tag>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm">
                  {listing.is_verified && (
                    <span className="flex items-center gap-1 text-blue-600">
                      <CheckCircleFilled /> Verified supplier
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircleFilled /> Material
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button icon={<BookOutlined />}>Save</Button>
                <Button icon={<ShareAltOutlined />}>Share</Button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 mt-6">
              <div className="flex-1 min-w-0 flex flex-col gap-4">
                <ListingGallery listing={listing} />
                <MaterialDetails listing={listing} />
                <AboutMaterial listing={listing} />
                <MaterialDocuments listing={listing} />
              </div>

              <div className="w-full lg:w-96 shrink-0 flex flex-col gap-4">
                <PricingCard listing={listing} />
                <SellerCard listing={listing} />
                <CommercialTermsCard listing={listing} />
                <ShippingDeliveryCard listing={listing} />
              </div>
            </div>
          </>
        )}
      </div>

      <MarketplaceFooter />
    </div>
  );
}
