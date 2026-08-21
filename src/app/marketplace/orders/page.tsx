"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input, Table, Tag, Empty, Button } from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import RequireMarketplaceAuth from "@/src/features/marketplace/auth/RequireMarketplaceAuth";
import MarketplaceTopBar from "@/src/features/marketplace/components/MarketplaceTopBar";
import MarketplaceHeader from "@/src/features/marketplace/components/MarketplaceHeader";
import MarketplaceFooter from "@/src/features/marketplace/components/MarketplaceFooter";
import { getBuyerOrders, BuyerOrderRow } from "@/src/features/marketplace/orders/orders-api";

const STATUS_COLOR: Record<string, string> = {
  in_transit: "blue",
  delivered: "green",
  payment_secured: "default",
};

function OrdersContent() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["marketplace", "buyer-orders", search],
    queryFn: () => getBuyerOrders({ search }),
    retry: false,
  });

  const results = data?.data?.results ?? [];

  const columns: ColumnsType<BuyerOrderRow> = [
    { title: "Mineral", dataIndex: "mineral_type", key: "mineral_type" },
    { title: "Supplier", dataIndex: "supplier_name", key: "supplier_name" },
    { title: "QTY (DMT)", dataIndex: "agreed_tonnage", key: "agreed_tonnage" },
    { title: "Order ID", dataIndex: "order_code", key: "order_code" },
    {
      title: "Amount",
      dataIndex: "total_value",
      key: "total_value",
      render: (v: string, r) => `${r.currency === "USD" ? "$" : "₦"}${Number(v).toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v: string) => <Tag color={STATUS_COLOR[v] ?? "default"}>{v.replace(/_/g, " ")}</Tag>,
    },
    { title: "Date", dataIndex: "created_at", key: "created_at" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <MarketplaceTopBar />
      <MarketplaceHeader search="" onSearch={() => {}} />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex-1 w-full">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My orders</h1>
            <p className="text-sm text-gray-500">Track and manage your recent mineral purchases</p>
          </div>
          <Button
            icon={<ReloadOutlined spin={isFetching} />}
            onClick={() => refetch()}
            className="!rounded-full"
          />
        </div>

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Search miner, order ID..."
          className="max-w-sm mb-4 rounded-full"
        />

        <div className="bg-white border border-[#E9ECF2] rounded-xl overflow-hidden">
          {isError || (!isLoading && results.length === 0) ? (
            <Empty
              className="py-16"
              description={
                <div>
                  <p className="text-gray-900 font-medium mb-1">No orders yet</p>
                  <p className="text-sm text-gray-500">
                    Your purchases will appear here once you place an order with a supplier.
                  </p>
                </div>
              }
            >
              <Link href="/marketplace">
                <Button>Browse Marketplace</Button>
              </Link>
            </Empty>
          ) : (
            <Table<BuyerOrderRow>
              rowKey="id"
              loading={isLoading}
              columns={columns}
              dataSource={results}
              pagination={{ total: data?.data?.count, pageSize: data?.data?.per_page }}
              onRow={(record) => ({
                onClick: () => router.push(`/marketplace/orders/${record.id}`),
                className: "cursor-pointer hover:bg-[#F8FAFF] transition-colors",
              })}
            />
          )}
        </div>
      </div>

      <MarketplaceFooter />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <RequireMarketplaceAuth>
      <OrdersContent />
    </RequireMarketplaceAuth>
  );
}
