import { useState } from "react";
import { Button, Skeleton, Empty, Modal, InputNumber } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { OpenQueueItem, declineRequest, submitQuote } from "../../dashboard/api";
import { showToast } from "@/src/store/toast.store";

type Props = {
  items: OpenQueueItem[];
  loading?: boolean;
};

export default function NewRequestsList({ items, loading }: Props) {
  const queryClient = useQueryClient();
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [quoteItem, setQuoteItem] = useState<OpenQueueItem | null>(null);
  const [quotedPrice, setQuotedPrice] = useState<number | null>(null);
  const [quotedQuantity, setQuotedQuantity] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleDecline = async (id: string) => {
    try {
      setDecliningId(id);
      await declineRequest(id);
      showToast("Request declined", "success");
      queryClient.invalidateQueries({ queryKey: ["newRequests"] });
      queryClient.invalidateQueries({ queryKey: ["ordersOverview"] });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || "Failed to decline request", "error");
    } finally {
      setDecliningId(null);
    }
  };

  const openQuoteModal = (item: OpenQueueItem) => {
    setQuoteItem(item);
    setQuotedPrice(null);
    setQuotedQuantity(Number(item.quantity) || null);
  };

  const handleSubmitQuote = async () => {
    if (!quoteItem || !quotedPrice || !quotedQuantity) return;
    try {
      setSubmitting(true);
      await submitQuote(quoteItem.id, { quoted_price: quotedPrice, quoted_quantity: quotedQuantity });
      showToast("Quote sent to buyer", "success");
      queryClient.invalidateQueries({ queryKey: ["newRequests"] });
      queryClient.invalidateQueries({ queryKey: ["ordersOverview"] });
      setQuoteItem(null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || "Failed to submit quote", "error");
    } finally {
      setSubmitting(false);
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
      <Modal
        title="Send your quote"
        open={!!quoteItem}
        onCancel={() => setQuoteItem(null)}
        footer={null}
        destroyOnHidden
      >
        {quoteItem && (
          <div className="flex flex-col gap-4 pt-2">
            <p className="text-sm text-gray-500">
              {quoteItem.buyer_name} wants {quoteItem.quantity} MT of {quoteItem.mineral_type}. Quote the volume
              you can actually supply and your price - you can offer less than the full amount.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Volume you can supply (MT)</label>
              <InputNumber
                size="large"
                className="!w-full"
                min={0}
                max={Number(quoteItem.quantity) || undefined}
                value={quotedQuantity}
                onChange={(v) => setQuotedQuantity(v)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Your price (₦ per unit)</label>
              <InputNumber
                size="large"
                className="!w-full"
                min={0}
                value={quotedPrice}
                onChange={(v) => setQuotedPrice(v)}
              />
            </div>
            <Button
              type="primary"
              block
              size="large"
              loading={submitting}
              disabled={!quotedPrice || !quotedQuantity}
              onClick={handleSubmitQuote}
            >
              Send quote
            </Button>
          </div>
        )}
      </Modal>

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
                  loading={decliningId === item.id}
                  disabled={!!decliningId && decliningId !== item.id}
                  onClick={() => handleDecline(item.id)}
                >
                  Decline
                </Button>
                <Button
                  type="primary"
                  className="bg-[#1e293b] hover:!bg-[#0f172a] border-none px-4 sm:px-6 text-xs sm:text-sm"
                  disabled={!!decliningId}
                  onClick={() => openQuoteModal(item)}
                >
                  Send quote
                </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
