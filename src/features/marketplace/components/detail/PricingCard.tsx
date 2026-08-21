"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicListingDetail } from "@/src/features/marketplace/public-api";
import { useMarketplaceAuth } from "@/src/features/marketplace/auth/use-marketplace-auth";
import AuthRequiredModal from "@/src/features/marketplace/components/AuthRequiredModal";
import { createMockOrderFromListing } from "@/src/features/marketplace/orders/mock-data";

const CURRENCY_SYMBOL: Record<string, string> = { NGN: "₦", USD: "$" };

export default function PricingCard({ listing }: { listing: PublicListingDetail }) {
  const router = useRouter();
  const { isAuthenticated } = useMarketplaceAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const symbol = CURRENCY_SYMBOL[listing.currency] ?? `${listing.currency} `;
  const price = Number(listing.asking_price_per_mt).toLocaleString();
  const quoteHref = `/marketplace/listings/${listing.slug}/request-quote`;

  // No real checkout/RFQ endpoint exists yet (see the message sent to the
  // backend team - item 5). Creates a mock order client-side so the buyer
  // still lands on a working, fully-built order detail page - swap this
  // for a real order/RFQ creation call once that endpoint ships.
  const handlePurchaseIntent = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    const order = createMockOrderFromListing({
      mineralType: listing.mineral_type,
      supplierName: listing.miner_company_name,
      quantityAvailable: listing.quantity_available,
      askingPricePerMt: listing.asking_price_per_mt,
      currency: listing.currency,
      mineState: listing.mine_state,
    });
    router.push(`/marketplace/orders/${order.id}`);
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
          onClick={handlePurchaseIntent}
          className="flex-1 bg-[#101E3D] !text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#0c1730]"
        >
          Buy now
        </button>
        <button
          type="button"
          onClick={handlePurchaseIntent}
          className="flex-1 text-center border border-[#101E3D] text-[#101E3D] text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50"
        >
          Request quote
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
