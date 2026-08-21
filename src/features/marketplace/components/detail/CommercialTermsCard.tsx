import type { PublicListingDetail } from "@/src/features/marketplace/public-api";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium">{value ?? "—"}</span>
    </div>
  );
}

export default function CommercialTermsCard({ listing }: { listing: PublicListingDetail }) {
  return (
    <div className="bg-white border border-[#E9ECF2] rounded-xl p-5">
      <h2 className="font-semibold text-gray-900 mb-2">Commercial terms</h2>
      <div className="flex flex-col divide-y divide-[#E9ECF2]">
        <Row label="Shipping terms" value={listing.delivery_basis} />
        <Row label="Payment" value={listing.payment_term} />
        <Row
          label="Quote validity"
          value={listing.quote_validity_days ? `${listing.quote_validity_days} days` : undefined}
        />
        <Row label="Lead time" value={listing.lead_time_days ? `${listing.lead_time_days} days` : undefined} />
      </div>
    </div>
  );
}
