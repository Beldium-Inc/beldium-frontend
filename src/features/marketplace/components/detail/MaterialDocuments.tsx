import { EyeOutlined, FileTextOutlined } from "@ant-design/icons";
import type { PublicListingDetail } from "@/src/features/marketplace/public-api";

export default function MaterialDocuments({ listing }: { listing: PublicListingDetail }) {
  const docs = [
    { label: "Assay reports", url: listing.assay_report },
    { label: "Certificate of analysis (COA)", url: listing.coa_document_url },
    { label: "Export documentation", url: listing.export_docs_url },
  ];

  return (
    <div className="bg-white border border-[#E9ECF2] rounded-xl p-5">
      <h2 className="font-semibold text-gray-900 mb-3">Material documents</h2>
      <div className="flex flex-col divide-y divide-[#E9ECF2]">
        {docs.map((doc) => (
          <div key={doc.label} className="flex items-center justify-between py-2.5 text-sm">
            <span className="flex items-center gap-2 text-gray-700">
              <FileTextOutlined className="text-red-400" /> {doc.label}
            </span>
            {doc.url ? (
              <a href={doc.url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-700">
                <EyeOutlined />
              </a>
            ) : (
              <span className="text-xs text-gray-300">Not available</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
