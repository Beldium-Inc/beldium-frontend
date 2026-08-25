import Link from "next/link";
import { CheckCircleFilled } from "@ant-design/icons";
import type { PublicListing } from "@/src/features/marketplace/public-api";

const CURRENCY_SYMBOL: Record<string, string> = {
  NGN: "₦",
  USD: "$",
};

function formatPrice(listing: PublicListing) {
  const symbol = CURRENCY_SYMBOL[listing.currency] ?? `${listing.currency} `;
  const amount = Number(listing.asking_price_per_mt).toLocaleString();
  return `${symbol}${amount}`;
}

export default function MarketplaceListingCard({ listing }: { listing: PublicListing }) {
  return (
    <Link
      href={`/marketplace/listings/${listing.slug}`}
      className="bg-white border border-[#E9ECF2] rounded-xl overflow-hidden flex flex-col cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        {listing.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote S3 host isn't in next.config.ts remotePatterns
          <img
            src={listing.image}
            alt={listing.mineral_type}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
            No image
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <h3 className="font-semibold text-gray-900">
          {listing.mineral_type}{" "}
          <span className="font-normal text-gray-500">({listing.mineral_form})</span>
        </h3>
        <p className="text-sm text-gray-500">
          {listing.quantity_available.toLocaleString()} MT Available
        </p>
        <p className="text-sm text-gray-500 flex items-center gap-1">
          <span aria-hidden></span> {listing.mine_state}
        </p>

        {listing.is_verified && (
          <p className="text-sm text-blue-600 flex items-center gap-1">
            <CheckCircleFilled /> Verified supplier
          </p>
        )}

        <div className="mt-2 font-bold text-gray-900">
          {formatPrice(listing)} <span className="font-normal text-sm text-gray-500">/ MT</span>
        </div>
      </div>
    </Link>
  );
}
