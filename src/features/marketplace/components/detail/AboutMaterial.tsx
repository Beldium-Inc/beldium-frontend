import type { PublicListingDetail } from "@/src/features/marketplace/public-api";

export default function AboutMaterial({ listing }: { listing: PublicListingDetail }) {
  return (
    <div className="bg-white border border-[#E9ECF2] rounded-xl p-5">
      <h2 className="font-semibold text-gray-900 mb-3">About this material</h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        {listing.description ?? "No description provided for this listing yet."}
      </p>
    </div>
  );
}
