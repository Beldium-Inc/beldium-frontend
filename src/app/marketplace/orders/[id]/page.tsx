"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button, Skeleton, Result } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import RequireMarketplaceAuth from "@/src/features/marketplace/auth/RequireMarketplaceAuth";
import MarketplaceTopBar from "@/src/features/marketplace/components/MarketplaceTopBar";
import MarketplaceHeader from "@/src/features/marketplace/components/MarketplaceHeader";
import MarketplaceFooter from "@/src/features/marketplace/components/MarketplaceFooter";
import { getBuyerOrderDetail } from "@/src/features/marketplace/orders/orders-api";
import OrderTimeline from "@/src/features/marketplace/orders/components/OrderTimeline";
import ProductDetailsCard from "@/src/features/marketplace/orders/components/ProductDetailsCard";
import PaymentStatusCard from "@/src/features/marketplace/orders/components/PaymentStatusCard";
import MaterialDocumentsCard from "@/src/features/marketplace/orders/components/MaterialDocumentsCard";
import LogisticRouteCard from "@/src/features/marketplace/orders/components/LogisticRouteCard";

function OrderDetailContent({ id }: { id: string }) {
  const { data: order, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["marketplace", "order-detail", id],
    queryFn: () => getBuyerOrderDetail(id),
  });

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <MarketplaceTopBar />
      <MarketplaceHeader search="" onSearch={() => {}} />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex-1 w-full">
        <div className="text-sm text-gray-500 mb-3">
          <Link href="/marketplace/orders" className="hover:underline">
            Order&apos;s
          </Link>{" "}
          <span className="mx-1">›</span> {order?.mineral_type ?? "…"}
        </div>

        {isLoading ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : !order ? (
          <Result
            status="404"
            title="Order not found"
            extra={
              <Link href="/marketplace/orders">
                <Button type="primary">Back to orders</Button>
              </Link>
            }
          />
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {order.mineral_type} <span className="text-gray-400 font-normal text-lg">{order.order_code}</span>
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">Last updated Today, 9:20 AM</p>
              </div>
              <div className="flex items-center gap-2">
                <Button icon={<DownloadOutlined />}>Export PDF</Button>
                <Button
                  icon={<ReloadOutlined spin={isFetching} />}
                  onClick={() => refetch()}
                  className="!rounded-full"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <OrderTimeline currentStep={order.current_step} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <ProductDetailsCard order={order} />
                <PaymentStatusCard order={order} />
                <MaterialDocumentsCard order={order} />
              </div>

              <LogisticRouteCard order={order} />
            </div>
          </>
        )}
      </div>

      <MarketplaceFooter />
    </div>
  );
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <RequireMarketplaceAuth>
      <OrderDetailContent id={id} />
    </RequireMarketplaceAuth>
  );
}
