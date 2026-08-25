"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicListingDetail } from "@/src/features/marketplace/public-api";
import { useMarketplaceAuth } from "@/src/features/marketplace/auth/use-marketplace-auth";
import AuthRequiredModal from "@/src/features/marketplace/components/AuthRequiredModal";

const CURRENCY_SYMBOL: Record<string, string> = { NGN: "₦", USD: "$" };

export default function PricingCard({ listing }: { listing: PublicListingDetail }) {
  const router = useRouter();
  const { isAuthenticated } = useMarketplaceAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const symbol = CURRENCY_SYMBOL[listing.currency] ?? `${listing.currency} `;
  const price = Number(listing.asking_price_per_mt).toLocaleString();
  const quoteParams = new URLSearchParams({
    mineral_type: listing.mineral_type,
    grade_spec: listing.grade ? `${listing.grade}%` : "",
    total_weight: String(listing.quantity_available),
    destination: listing.mine_state,
  });
  const quoteHref = `/marketplace/rfqs/new?${quoteParams.toString()}`;

  const handleRequestQuote = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    router.push(quoteHref);
  };

  return (
    <div className="bg-white border border-[#E9ECF2] rounded-xl p-5">
      <div className="font-bold text-2xl text-gray-900">
        {symbol}
        {price} <span className="text-base font-normal text-gray-500">/ MT</span>
      </div>

      <div className="mt-4 flex flex-col divide-y divide-[#E9ECF2] text-sm">
        <div className="flex items-center justify-between py-2">
          <span className="text-gray-500">Available</span>
          <span className="text-gray-900 font-medium">
            {listing.quantity_available.toLocaleString()} MT
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-gray-500">Min order</span>
          <span className="text-gray-900 font-medium">
            {listing.min_order_quantity ? `${listing.min_order_quantity.toLocaleString()} MT` : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-gray-500">Origin</span>
          <span className="text-gray-900 font-medium">{listing.mine_state}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <button
          type="button"
          onClick={handleRequestQuote}
          className="flex-1 bg-[#101E3D] !text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#0c1730]"
        >
          Request for quote
        </button>
      </div>

      <AuthRequiredModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        redirectTo={quoteHref}
      />
    </div>
  );
}
