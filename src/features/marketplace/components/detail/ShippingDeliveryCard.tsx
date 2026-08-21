import type { PublicListingDetail } from "@/src/features/marketplace/public-api";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium">{value ?? "—"}</span>
    </div>
  );
}

export default function ShippingDeliveryCard({ listing }: { listing: PublicListingDetail }) {
  return (
    <div className="bg-white border border-[#E9ECF2] rounded-xl p-5">
      <h2 className="font-semibold text-gray-900 mb-2">Shipping &amp; delivery</h2>
      <div className="flex flex-col divide-y divide-[#E9ECF2]">
        <Row label="Origin country" value={listing.origin_country ?? "Nigeria"} />
        <Row label="Loading port" value={listing.loading_port} />
        <Row label="Incoterms" value={listing.delivery_basis} />
        <Row label="Packaging" value={listing.packaging_type} />
      </div>
    </div>
  );
}
