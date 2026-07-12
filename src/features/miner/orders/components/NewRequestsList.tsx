import { useState } from "react";
import { Button, Skeleton, Empty } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { OpenQueueItem, acceptRequest, declineRequest } from "../../dashboard/api";
import { showToast } from "@/src/store/toast.store";

type Props = {
  items: OpenQueueItem[];
  loading?: boolean;
};

export default function NewRequestsList({ items, loading }: Props) {
  const queryClient = useQueryClient();
  const [actingOn, setActingOn] = useState<{ id: string; action: "accept" | "decline" } | null>(null);

  const handleAction = async (id: string, action: "accept" | "decline") => {
    try {
      setActingOn({ id, action });
      if (action === "accept") {
        await acceptRequest(id);
        showToast("Request accepted", "success");
      } else {
        await declineRequest(id);
        showToast("Request declined", "success");
      }
      queryClient.invalidateQueries({ queryKey: ["newRequests"] });
      queryClient.invalidateQueries({ queryKey: ["ordersOverview"] });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || `Failed to ${action} request`, "error");
    } finally {
      setActingOn(null);
    }
  };

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
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Buyer Info */}
            <div className="lg:w-52 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{item.buyer_name}</span>
                <CheckCircleFilled className="text-teal-500 text-sm" />
              </div>
              <div className="text-xs text-gray-500 mt-1">Order ID: #{item.order_id || 'N/A'}</div>
            </div>

            {/* Details Grid */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-gray-400 block mb-1">Mineral type:</span>
                <span className="text-sm font-medium text-gray-700">{item.mineral_type}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Quantity:</span>
                <span className="text-sm font-medium text-gray-700">{item.quantity} MT</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Proposed price:</span>
                <span className="text-sm font-medium text-gray-700">{item.proposed_price}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Requested timeline:</span>
                <span className="text-sm font-medium text-gray-700">{item.delivery_timeline}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Location:</span>
                <span className="text-sm font-medium text-gray-700">{item.location}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Logistics method:</span>
                <span className="text-sm font-medium text-gray-700">{item.logistics_method}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-4 mt-2 lg:mt-0 flex-shrink-0">
                <Button
                  type="text"
                  danger
                  className="font-medium text-xs sm:text-sm"
                  loading={actingOn?.id === item.id && actingOn.action === "decline"}
                  disabled={!!actingOn && actingOn.id !== item.id}
                  onClick={() => handleAction(item.id, "decline")}
                >
                  Decline
                </Button>
                <Button
                  type="primary"
                  className="bg-[#1e293b] hover:!bg-[#0f172a] border-none px-4 sm:px-6 text-xs sm:text-sm"
                  loading={actingOn?.id === item.id && actingOn.action === "accept"}
                  disabled={!!actingOn && actingOn.id !== item.id}
                  onClick={() => handleAction(item.id, "accept")}
                >
                  Review request
                </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
