"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Skeleton, Result, Button, Tag } from "antd";
import RequireMarketplaceAuth from "@/src/features/marketplace/auth/RequireMarketplaceAuth";
import MarketplaceTopBar from "@/src/features/marketplace/components/MarketplaceTopBar";
import MarketplaceHeader from "@/src/features/marketplace/components/MarketplaceHeader";
import MarketplaceFooter from "@/src/features/marketplace/components/MarketplaceFooter";
import { getRfqDetail } from "@/src/features/marketplace/rfqs/rfqs-api";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#E9ECF2] last:border-0 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium text-right">{value ?? "—"}</span>
    </div>
  );
}

function RfqDetailContent({ id }: { id: string }) {
  const { data: rfq, isLoading } = useQuery({
    queryKey: ["marketplace", "rfq-detail", id],
    queryFn: () => getRfqDetail(id),
  });

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <MarketplaceTopBar />
      <MarketplaceHeader search="" onSearch={() => {}} />

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 flex-1 w-full">
        <div className="text-sm text-gray-500 mb-3">
          <Link href="/marketplace/rfqs" className="hover:underline">
            RFQ&apos;s
          </Link>{" "}
          <span className="mx-1">›</span> {rfq?.rfq_code ?? "…"}
        </div>

        {isLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : !rfq ? (
          <Result
            status="404"
            title="RFQ not found"
            extra={
              <Link href="/marketplace/rfqs">
                <Button type="primary">Back to RFQ&apos;s</Button>
              </Link>
            }
          />
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">
                {rfq.mineral_type} <span className="text-gray-400 font-normal text-lg">{rfq.rfq_code}</span>
              </h1>
              <Tag color="blue" className="text-sm capitalize">
                {rfq.status.replace(/_/g, " ")}
              </Tag>
            </div>

            <div className="bg-white border border-[#E9ECF2] rounded-xl p-5">
              <h2 className="font-semibold text-gray-900 mb-1">Request details</h2>
              <Row label="Grade specification" value={rfq.grade_spec} />
              <Row label="Total weight" value={`${Number(rfq.total_weight).toLocaleString()} MT`} />
              <Row label="Pricing structure" value={rfq.pricing_structure} />
              <Row label="Incoterm" value={rfq.incoterm} />
              <Row label="Destination" value={rfq.destination} />
              <Row
                label="Response deadline"
                value={rfq.response_deadline ? new Date(rfq.response_deadline).toLocaleString() : undefined}
              />
              <Row
                label="Delivery deadline"
                value={rfq.delivery_deadline ? new Date(rfq.delivery_deadline).toLocaleString() : undefined}
              />
              <Row label="Requested by" value={rfq.buyer?.company_name} />
            </div>
          </>
        )}
      </div>

      <MarketplaceFooter />
    </div>
  );
}

export default function RfqDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <RequireMarketplaceAuth>
      <RfqDetailContent id={id} />
    </RequireMarketplaceAuth>
  );
}
