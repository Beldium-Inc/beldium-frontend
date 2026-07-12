"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { getOrderDetail } from "@/src/features/miner/dashboard/api";
import { Button, Tag, Skeleton, Tooltip } from "antd";
import { ArrowLeftOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { DEFAULT_CURRENCY_SYMBOL } from "@/src/constants";
import { useEffect } from "react";
import ArchiveActions from "@/src/features/miner/orders/components/ArchiveActions";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  // Handle Escape key for back navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        router.push('/dashboard?view=orders');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["orderDetail", id],
    queryFn: () => getOrderDetail(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 mb-4">Failed to load order details</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const order = data.data;

  // Helper to format currency
  const formatCurrency = (amount: string | number) => {
    return `${DEFAULT_CURRENCY_SYMBOL}${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-400 flex items-center gap-1.5">
        <button
          onClick={() => router.push('/dashboard?view=orders')}
          className="hover:text-gray-600 transition-colors"
        >
          Order
        </button>
        <span>›</span>
        <span className="text-gray-500">Order Detail</span>
      </div>

      {/* Back Navigation */}
      <div className="-mt-2">
        <Tooltip title="Return to Orders list (Esc)">
          <button
            onClick={() => router.push('/dashboard?view=orders')}
            className="group flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors py-2 px-3 -ml-3 rounded-lg hover:bg-gray-100"
            aria-label="Back to Orders"
          >
            <ArrowLeftOutlined className="transition-transform group-hover:-translate-x-1" />
            Back to Orders
          </button>
        </Tooltip>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex m-4 flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">Order #{order.order_code}</h1>
            <div className="flex items-center gap-2 mt-1 md:mt-0">
                {order.status === 'completed' && (
                <Tag color="success" className="rounded-full px-3 py-0.5 font-medium border-0 bg-green-50 text-green-600 m-0 flex items-center gap-1">
                    <SafetyCertificateOutlined /> COMPLETED
                </Tag>
                )}
                <Tag className="rounded-full px-3 py-0.5 font-medium border-0 bg-gray-100 text-gray-500 m-0">
                READ ONLY
                </Tag>
            </div>
          </div>
          <p className="text-gray-500 mt-2 text-sm md:text-base m-4">
            {order.delivered_at ? `Completed on ${dayjs(order.delivered_at).format("MMM DD, YYYY")}` : `Created on ${dayjs(order.created_at).format("MMM DD, YYYY")}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order Summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-5 h-5 rounded-full border border-blue-500 flex items-center justify-center text-blue-500 text-xs font-bold">i</div>
              <h2 className="text-base font-semibold text-gray-900">Order Summary</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div>
                <span className="text-xs text-gray-400 block mb-1">Mineral Type</span>
                <span className="text-sm font-medium text-gray-900">{order.mineral_type || "--"}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Grade/Purity</span>
                <span className="text-sm font-medium text-gray-900">{order.grade || "--"}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Quantity</span>
                <span className="text-sm font-medium text-gray-900">{Number(order.agreed_tonnage).toLocaleString()} Metric Tons</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Unit Price</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(order.agreed_price)}</span>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
             <div className="flex items-center gap-2 mb-6">
              <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 text-xs">₦</div>
              <h2 className="text-base font-semibold text-gray-900">Payment Breakdown</h2>
            </div>

            <div className="space-y-4 border-b border-gray-100 pb-6 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(order.subtotal || order.total_value)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Shipping & Handling</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Export Tariffs</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(order.export_tariffs)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-base font-bold text-gray-900">Total Amount Paid</span>
              <span className="text-xl font-bold text-gray-900">{formatCurrency(order.amount_paid || order.total_value)}</span>
            </div>

            {order.transactions && order.transactions.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Transaction Reference</div>
                <div className="font-mono text-sm text-gray-700">{order.transactions[0].transaction_code || order.transactions[0].payment_reference}</div>
              </div>
            )}
          </div>

          {/* Timeline / Tracking */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
               {/* Using a generic icon for timeline */}
               <div className="w-5 h-5 text-blue-500">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
               </div>
              <h2 className="text-base font-semibold text-gray-900">Shipment Tracking</h2>
            </div>

            <div className="relative pl-4 space-y-8 before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {/* Order Placed */}
              <div className="relative pl-8">
                <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-indigo-900 border-4 border-white shadow-sm z-10 flex items-center justify-center">
                   <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <h3 className="text-sm font-medium text-gray-900">Order Placed</h3>
                <p className="text-xs text-gray-500 mt-1">{dayjs(order.created_at).format("MMM DD, YYYY • hh:mm A")}</p>
              </div>

              {/* Shipped */}
              <div className="relative pl-8">
                 <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm z-10 flex items-center justify-center ${order.shipped_at ? 'bg-indigo-900' : 'bg-gray-200'}`}>
                   {order.shipped_at && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <h3 className={`text-sm font-medium ${order.shipped_at ? 'text-gray-900' : 'text-gray-400'}`}>Shipped from port</h3>
                {order.shipped_at && <p className="text-xs text-gray-500 mt-1">{dayjs(order.shipped_at).format("MMM DD, YYYY • hh:mm A")}</p>}
              </div>

              {/* Delivered */}
              <div className="relative pl-8">
                <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm z-10 flex items-center justify-center ${order.delivered_at ? 'bg-indigo-900' : 'bg-gray-200'}`}>
                   {order.delivered_at && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <h3 className={`text-sm font-medium ${order.delivered_at ? 'text-gray-900' : 'text-gray-400'}`}>Delivered</h3>
                {order.delivered_at && <p className="text-xs text-gray-500 mt-1">{dayjs(order.delivered_at).format("MMM DD, YYYY • hh:mm A")}</p>}
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar - Right Column */}
        <div className="lg:col-span-1 space-y-6">
          <ArchiveActions 
            orderId={order.id}
            orderCode={order.order_code}
          />
        </div>
      </div>
    </div>
  );
}