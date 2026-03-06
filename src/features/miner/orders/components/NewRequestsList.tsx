import { Button, Skeleton, Empty } from "antd";
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
        {[1, 2, 3].map((i) => (
          <Skeleton active key={i} className="p-6 bg-white rounded-xl border border-gray-100" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 border border-gray-100 flex items-center justify-center">
        <Empty description="No new requests found" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-4">
            {/* Header / Buyer Info */}
            <div className="w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{item.buyer_name}</span>
                  <CheckCircleFilled className="text-teal-500 text-sm" />
                </div>
                <div className="text-xs text-gray-500">#{item.order_id || 'N/A'}</div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <span className="text-xs text-gray-400 block mb-1">Mineral type</span>
                <span className="text-sm font-medium text-gray-700">{item.mineral_type}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Timeline</span>
                <span className="text-sm font-medium text-gray-700">{item.delivery_timeline}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Quantity</span>
                <span className="text-sm font-medium text-gray-700">{item.quantity} MT</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Location</span>
                <span className="text-sm font-medium text-gray-700">{item.location}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Price</span>
                <span className="text-sm font-medium text-gray-700">{item.proposed_price}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Logistics</span>
                <span className="text-sm font-medium text-gray-700">{item.logistics_method}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                <Button type="text" danger className="font-medium text-xs sm:text-sm">
                  Decline
                </Button>
                <Button type="primary" className="bg-[#1e293b] hover:!bg-[#0f172a] border-none px-4 sm:px-6 text-xs sm:text-sm">
                  Review request
                </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
