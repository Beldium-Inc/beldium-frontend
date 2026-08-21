"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input, Table, Tag, Empty, Button } from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import RequireMarketplaceAuth from "@/src/features/marketplace/auth/RequireMarketplaceAuth";
import MarketplaceTopBar from "@/src/features/marketplace/components/MarketplaceTopBar";
import MarketplaceHeader from "@/src/features/marketplace/components/MarketplaceHeader";
import MarketplaceFooter from "@/src/features/marketplace/components/MarketplaceFooter";
import { getBuyerRfqs, RfqRow } from "@/src/features/marketplace/rfqs/rfqs-api";

const STATUS_COLOR: Record<string, string> = {
  draft: "default",
  pending_routing: "gold",
  routed: "blue",
  in_progress: "blue",
  compliance_failed: "red",
  funded: "green",
  fulfilled: "green",
  archived: "default",
  initiated: "gold",
  no_match: "red",
};

function RfqsContent() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["marketplace", "buyer-rfqs"],
    queryFn: () => getBuyerRfqs({}),
    retry: false,
  });

  const results = useMemo(() => {
    const all = data?.data?.results ?? [];
    if (!search) return all;
    const q = search.toLowerCase();
    return all.filter(
      (r) => r.mineral_type.toLowerCase().includes(q) || r.rfq_code?.toLowerCase().includes(q),
    );
  }, [data, search]);

  const columns: ColumnsType<RfqRow> = [
    { title: "RFQ ID", dataIndex: "rfq_code", key: "rfq_code", render: (v: string) => v || "—" },
    { title: "Mineral", dataIndex: "mineral_type", key: "mineral_type" },
    {
      title: "Quantity (MT)",
      dataIndex: "total_weight",
      key: "total_weight",
      render: (v: string) => Number(v).toLocaleString(),
    },
    { title: "Incoterm", dataIndex: "incoterm", key: "incoterm" },
    { title: "Destination", dataIndex: "destination", key: "destination" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v: string) => <Tag color={STATUS_COLOR[v] ?? "default"}>{v.replace(/_/g, " ")}</Tag>,
    },
    {
      title: "Response deadline",
      dataIndex: "response_deadline",
      key: "response_deadline",
      render: (v: string | null) => (v ? new Date(v).toLocaleDateString() : "—"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <MarketplaceTopBar />
      <MarketplaceHeader search="" onSearch={() => {}} />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex-1 w-full">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">RFQ&apos;s</h1>
            <p className="text-sm text-gray-500">Track the quote requests you&apos;ve sent to suppliers</p>
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
          placeholder="Search by mineral or RFQ ID..."
          className="max-w-sm mb-4 rounded-full"
        />

        <div className="bg-white border border-[#E9ECF2] rounded-xl overflow-hidden">
          {isError || (!isLoading && results.length === 0) ? (
            <Empty
              className="py-16"
              description={
                <div>
                  <p className="text-gray-900 font-medium mb-1">No RFQ&apos;s yet</p>
                  <p className="text-sm text-gray-500">
                    Requests for quotation you send to suppliers will appear here.
                  </p>
                </div>
              }
            >
              <Link href="/marketplace">
                <Button>Browse Marketplace</Button>
              </Link>
            </Empty>
          ) : (
            <Table<RfqRow>
              rowKey="id"
              loading={isLoading}
              columns={columns}
              dataSource={results}
              pagination={{ total: data?.data?.count, pageSize: 20 }}
              onRow={(record) => ({
                onClick: () => router.push(`/marketplace/rfqs/${record.id}`),
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

export default function RfqsPage() {
  return (
    <RequireMarketplaceAuth>
      <RfqsContent />
    </RequireMarketplaceAuth>
  );
}
