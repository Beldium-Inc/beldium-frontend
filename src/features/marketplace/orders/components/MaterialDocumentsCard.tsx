import { EyeOutlined, DownloadOutlined, FileTextOutlined, UploadOutlined } from "@ant-design/icons";
import type { MockOrder } from "../mock-data";

export default function MaterialDocumentsCard({ order }: { order: MockOrder }) {
  return (
    <div className="bg-white border border-[#E9ECF2] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-900">Material documents</h2>
        <button
          type="button"
          className="text-xs text-gray-500 flex items-center gap-1 hover:text-gray-800"
        >
          Upload document <UploadOutlined />
        </button>
      </div>
      <div className="flex flex-col divide-y divide-[#E9ECF2]">
        {order.documents.map((doc) => (
          <div key={doc.label} className="flex items-center justify-between py-2.5 text-sm">
            <span className="flex items-center gap-2 text-gray-700">
              <FileTextOutlined className="text-red-400" /> {doc.label}
            </span>
            <span className="flex items-center gap-3 text-gray-400">
              <EyeOutlined className="cursor-pointer hover:text-gray-700" />
              <DownloadOutlined className="cursor-pointer hover:text-gray-700" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
