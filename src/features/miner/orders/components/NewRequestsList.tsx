import { Button, Tag, Skeleton } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { OpenQueueItem } from "../../dashboard/api";

type Props = {
  items: OpenQueueItem[];
  loading?: boolean;
};

export default function NewRequestsList({ items, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="p-6 bg-white border border-gray-200 rounded-xl">
            <Skeleton active paragraph={{ rows: 3 }} />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500">
        No new requests found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col xl:flex-row gap-6"
        >
          {/* Header / Buyer Info */}
          <div className="xl:w-1/4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900 text-base">{item.buyer_name}</span>
              <CheckCircleFilled className="text-teal-500" />
            </div>
            <div className="text-xs text-gray-500">Order ID: #{item.id.slice(0, 8)}</div>
          </div>

          {/* Details Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-2">
                 <span className="text-gray-400 min-w-[100px]">Mineral type:</span>
                 <span className="font-medium text-gray-900">{item.mineral_type}</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-gray-400 min-w-[100px]">Quantity:</span>
                 <span className="font-medium text-gray-900">{item.quantity}</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-gray-400 min-w-[100px]">Proposed price:</span>
                 <span className="font-semibold text-gray-900">{item.proposed_price}</span>
               </div>
            </div>
            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-2">
                 <span className="text-gray-400 min-w-[120px]">Requested timeline:</span>
                 <span className="font-medium text-gray-900 truncate" title={item.delivery_timeline}>{item.delivery_timeline}</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-gray-400 min-w-[120px]">Location:</span>
                 <span className="font-medium text-gray-900 truncate" title={item.location}>{item.location}</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-gray-400 min-w-[120px]">Logistics method:</span>
                 <span className="font-medium text-gray-900 truncate" title={item.logistics_method}>{item.logistics_method}</span>
               </div>
            </div>
          </div>

          {/* Actions */}
          <div className="xl:w-auto flex flex-row xl:flex-row items-center justify-end gap-4 xl:border-l xl:border-gray-100 xl:pl-6 pt-4 xl:pt-0 border-t xl:border-t-0 border-gray-100 mt-2 xl:mt-0">
            <Button danger type="text" className="font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-6">
              Decline
            </Button>
            <Button type="primary" className="bg-slate-900 hover:!bg-slate-800 h-10 px-6 font-medium shadow-none border-none rounded-lg">
              Review request
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
