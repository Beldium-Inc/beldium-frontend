"use client";

import { useQuery } from "@tanstack/react-query";
import { getListingCards, getListingsTable } from "@/src/features/miner/listings/api";
import { Card, Input, Select, Skeleton, Table, Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { ArrowRightOutlined } from "@ant-design/icons";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_CURRENCY_SYMBOL } from "@/src/constants";
import { useMemo, useState } from "react";

import { PlusOutlined } from "@ant-design/icons";



export default function ListingView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState<string>(searchParams.get("q") || "");
  const [status, setStatus] = useState<string | null>(searchParams.get("status") || null);
  const [state, setState] = useState<string | null>(searchParams.get("state") || null);
  const [sort, setSort] = useState<string | null>(searchParams.get("sort") || "recent");
  const [page, setPage] = useState<number>(Number(searchParams.get("page") || 1));

  const { data: cardsData, isLoading: cardsLoading } = useQuery({
    queryKey: ["listings", "cards"],
    queryFn: getListingCards,
  });

  const { data: tableData, isLoading: tableLoading } = useQuery({
    queryKey: ["listings", "table", { page, status, state, sort, q }],
    queryFn: () => getListingsTable({ page, status, state, sort, q }),
  });

  const results = tableData?.data?.results || [];
  const paginationConfig: TablePaginationConfig = useMemo(() => {
    const meta = tableData?.data;
    return {
      current: meta?.page_number || page,
      pageSize: meta?.per_page || 10,
      total: meta?.count || 0,
      onChange: (p: number) => setPage(p),
    };
  }, [tableData, page]);

  const formatCurrency = (amount: string | number) => {
    const n = typeof amount === "string" ? Number(amount) : amount;
    return `${DEFAULT_CURRENCY_SYMBOL}${Number.isFinite(n) ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : amount}`;
  };

  type ListingRowItem = {
    id: string;
    listing_code: string;
    grade: string;
    quantity: number;
    mineral_form: string;
    mine_state: string;
    asking_price: string;
    status: string;
  };

  const columns: ColumnsType<ListingRowItem> = [
    { title: "Listing ID", dataIndex: "listing_code", key: "listing_code", render: (v: string) => `#${v}` },
    { title: "Grade (%)", dataIndex: "grade", key: "grade" },
    { title: "Quantity (MT)", dataIndex: "quantity", key: "quantity", render: (v: number) => v?.toLocaleString() },
    { title: "Mineral Form", dataIndex: "mineral_form", key: "mineral_form" },
    { title: "Mine State", dataIndex: "mine_state", key: "mine_state" },
    { title: "Asking Price", dataIndex: "asking_price", key: "asking_price", render: (v: string) => formatCurrency(v) },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v: string) => (
        <Tag color={v === "active" ? "success" : "default"} className={v === "active" ? "bg-green-50 text-green-600 border-0" : "bg-orange-50 text-orange-600 border-0"}>
          {v === "active" ? "Active" : "In drafts"}
        </Tag>
      ),
    },
  ];

  return (
    <div className="max-w-8xl mx-auto space-y-6 pb-24 px-4 md:px-6">
      <div className="flex items-center justify-between gap-4">
  <div>
    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Listings</h1>
    <p className="text-sm md:text-base text-gray-500">Manage your mineral listings and availability</p>
  </div>
  <button
    aria-label="Create new mineral listing"
    onClick={() => location.assign('/dashboard?view=create_listing')}
    className="flex items-center gap-2 bg-[#14244a] !text-white px-5 py-4 rounded-lg text-sm font-medium hover:bg-[#1c3363] transition-colors"
  >
    <PlusOutlined />
    Create new mineral listing
  </button>
</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="rounded-xl border border-gray-200 shadow-sm">
          {cardsLoading ? (
            <Skeleton active paragraph={{ rows: 1 }} />
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-2">
                  <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <Image src="/assets/icons/users-icon.svg" alt="Total listings" width={18} height={18} />
                  </span>
                </div>
                <div className="text-[13px] text-gray-500">Total Listing(s)</div>
                <div className="text-2xl md:text-3xl font-bold">{cardsData?.data?.total_listings ?? 0}</div>
                <div className="text-xs text-gray-400">All listings created</div>
              </div>
              <ArrowRightOutlined className="text-gray-400" />
            </div>
          )}
        </Card>
        <Card className="rounded-xl border border-gray-200 shadow-sm">
          {cardsLoading ? (
            <Skeleton active paragraph={{ rows: 1 }} />
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-2">
                  <span className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                    <Image src="/assets/icons/line-graph-icon.svg" alt="Active listing" width={18} height={18} />
                  </span>
                </div>
                <div className="text-[13px] text-gray-500">Active Listing</div>
                <div className="text-2xl md:text-3xl font-bold">{cardsData?.data?.active_listings ?? 0}</div>
                <div className="text-xs text-gray-400">Currently visible to buyers</div>
              </div>
              <ArrowRightOutlined className="text-gray-400" />
            </div>
          )}
        </Card>
        <Card className="rounded-xl border border-gray-200 shadow-sm">
          {cardsLoading ? (
            <Skeleton active paragraph={{ rows: 1 }} />
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-2">
                  <span className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                    <Image src="/assets/icons/warning-bg-icon.svg" alt="Draft listings" width={18} height={18} />
                  </span>
                </div>
                <div className="text-[13px] text-gray-500">Drafted Listings</div>
                <div className="text-2xl md:text-3xl font-bold">{cardsData?.data?.draft_listings ?? 0}</div>
                <div className="text-xs text-gray-400">Listings saved in draft</div>
              </div>
              <ArrowRightOutlined className="text-gray-400" />
            </div>
          )}
        </Card>
      </div>

      <div className="rounded-xl border border-[#E9ECF2] p-4 md:p-6 bg-white">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center mb-4">
          <Input
            placeholder="Search mineral listing"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 md:h-11 flex-1"
          />
          <Select
            placeholder="Status"
            value={status ?? undefined}
            allowClear
            onChange={(v) => setStatus(v ?? null)}
            className="w-full md:w-48 h-10 md:h-11"
            options={[
              { label: "All status", value: undefined },
              { label: "Active", value: "active" },
              { label: "Draft", value: "draft" },
            ]}
          />
          <Select
            placeholder="State"
            value={state ?? undefined}
            allowClear
            onChange={(v) => setState(v ?? null)}
            className="w-full md:w-48 h-10 md:h-11"
            options={[
              { label: "All states", value: undefined },
              { label: "Kwara", value: "Kwara" },
              { label: "Oyo", value: "Oyo" },
              { label: "Zamfara", value: "Zamfara" },
              { label: "Osun", value: "Osun" },
            ]}
          />
          <Select
            placeholder="Sort by"
            value={sort ?? undefined}
            onChange={(v) => setSort(v ?? null)}
            className="w-full md:w-48 h-10 md:h-11"
            options={[
              { label: "Most recent", value: "recent" },
              { label: "Oldest", value: "oldest" },
            ]}
          />
        </div>
        <div className="overflow-x-auto">
          {tableLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <Table<ListingRowItem>
              rowKey={(r) => r.id}
              columns={columns}
              dataSource={results as ListingRowItem[]}
              pagination={paginationConfig}
              scroll={{ x: "max-content" }}
              onRow={(record) => ({
                onClick: () => router.push(`/dashboard/listings/${record.id}`),
                className: "cursor-pointer hover:bg-[#F8FAFF] transition-colors",
              })}
            />
          )}
        </div>
      </div>
    </div>
  );
}

type CreateListingButtonProps = {
  ariaLabel: string;
  onClick?: () => void;
  children: React.ReactNode;
};

function CreateListingButton({ ariaLabel, onClick, children }: CreateListingButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="group grid grid-cols-[auto_1fr_auto] items-center gap-2 min-h-[44px] h-auto px-4 md:px-5 mt-2 md:mt-0 rounded-xl bg-[#071A44] text-white shadow-[0_12px_24px_-14px_rgba(7,26,68,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0B2458] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1D6CFF] w-full md:w-auto"
    >
      <span className="w-7 h-7 md:w-5 md:h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
        <Image src="/assets/icons/atom-icon.svg" alt="" width={16} height={16} />
      </span>
      <span className="min-w-0 font-semibold text-[13px] md:text-sm leading-snug text-center text-white break-words">{children}</span>
      <span className="ml-1 w-7 h-7 md:w-5 md:h-5 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5 flex-shrink-0">
        <Image src="/assets/icons/arrow-white-icon.svg" alt="" width={14} height={14} />
      </span>
    </button>
  );
}
