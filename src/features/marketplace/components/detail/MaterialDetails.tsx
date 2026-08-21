import type { PublicListingDetail } from "@/src/features/marketplace/public-api";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="text-sm text-gray-900 mt-0.5">{value ?? "—"}</div>
    </div>
  );
}

export default function MaterialDetails({ listing }: { listing: PublicListingDetail }) {
  return (
    <div className="bg-white border border-[#E9ECF2] rounded-xl p-5">
      <h2 className="font-semibold text-gray-900 mb-4">Material details</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Field label="Mineral" value={listing.mineral_type} />
        <Field label="Type" value={listing.mineral_form} />
        <Field label="Grade" value={`${listing.grade}%`} />
        <Field label="Purity" value={listing.purity} />
        <Field label="Form" value={listing.mineral_form} />
        <Field label="Origin" value={listing.mine_state} />
        <Field
          label="Stock status"
          value={
            <span className="inline-flex items-center gap-1.5 text-blue-600">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Available
            </span>
          }
        />
      </div>
    </div>
  );
}
