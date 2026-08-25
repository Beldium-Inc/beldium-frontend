"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Table, Empty, Skeleton, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import RequireMarketplaceAuth from "@/src/features/marketplace/auth/RequireMarketplaceAuth";
import MarketplaceTopBar from "@/src/features/marketplace/components/MarketplaceTopBar";
import MarketplaceHeader from "@/src/features/marketplace/components/MarketplaceHeader";
import MarketplaceFooter from "@/src/features/marketplace/components/MarketplaceFooter";
import { getBuyerEscrowRecords, EscrowRecord } from "@/src/features/marketplace/escrow/escrow-api";
import { formatNaira } from "@/src/features/marketplace/rfqs/mock-offers";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending_transfer: { label: "Awaiting transfer", className: "bg-amber-50 text-amber-600" },
  LOCKED: { label: "Escrow secured", className: "bg-green-50 text-green-600" },
};

function EscrowContent() {
  const { data, isLoading } = useQuery({
    queryKey: ["marketplace", "escrow-records"],
    queryFn: getBuyerEscrowRecords,
  });

  const records = data?.results ?? [];

  const columns: ColumnsType<EscrowRecord> = [
    {
      title: "Miner",
      key: "miner",
      render: (_, record) => record.miner.company_name,
    },
    {
      title: "Amount",
      key: "amount",
      render: (_, record) => (record.total_value ? formatNaira(Number(record.total_value)) : "—"),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const style = STATUS_STYLES[record.escrow_status] ?? {
          label: record.escrow_status,
          className: "bg-gray-100 text-gray-500",
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.className}`}>
            {style.label}
          </span>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (v: string) => new Date(v).toLocaleDateString(),
    },
    {
      title: "",
      key: "action",
      render: (_, record) => (
        <Link href={`/marketplace/rfqs/${record.rfq}`} className="text-sm text-[#101E3D] font-medium hover:underline">
          View RFQ →
        </Link>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <MarketplaceTopBar />
      <MarketplaceHeader search="" onSearch={() => {}} />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex-1 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Escrow</h1>
        <p className="text-sm text-gray-500 mb-6">
          Funds you&apos;ve secured in Beldium Escrow for your accepted quotes, and their release status.
        </p>

        <div className="bg-white border border-[#E9ECF2] rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-6">
              <Skeleton active paragraph={{ rows: 5 }} />
            </div>
          ) : records.length === 0 ? (
            <Empty
              className="py-16"
              description={
                <div>
                  <p className="text-gray-900 font-medium mb-1">No escrow activity yet</p>
                  <p className="text-sm text-gray-500">
                    Once you accept a quote and fund escrow, it&apos;ll show up here.
                  </p>
                </div>
              }
            >
              <Link href="/marketplace/rfqs">
                <Button type="primary">View my RFQ&apos;s</Button>
              </Link>
            </Empty>
          ) : (
            <Table<EscrowRecord> rowKey="id" columns={columns} dataSource={records} pagination={false} />
          )}
        </div>
      </div>
      <MarketplaceFooter />
    </div>
  );
}

export default function EscrowPage() {
  return (
    <RequireMarketplaceAuth>
      <EscrowContent />
    </RequireMarketplaceAuth>
  );
}
