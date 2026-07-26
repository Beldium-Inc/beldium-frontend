"use client";

import { SearchOutlined, BellOutlined, MessageOutlined, DownOutlined, CheckCircleOutlined, UserOutlined } from "@ant-design/icons";

export default function LogisticsHeader({ title = "Overview" }: { title?: string }) {
  return (
    <header className="h-16 shrink-0 bg-white border-b border-[#e9edf5] flex items-center justify-between px-6 gap-4">
      <div className="flex items-center gap-3 text-sm text-[#8b93a1] shrink-0">
        <span>Dashboard</span>
        <span>/</span>
        <span className="text-[#172554] font-medium">{title}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#caebd1] bg-[#ecfaf0] text-[#1ea43b] text-xs font-medium px-3 py-1 ml-2">
          <CheckCircleOutlined className="text-[13px]" />
          Verified Logistics Partner
        </span>
      </div>

      <div className="flex-1 max-w-md hidden lg:block">
        <div className="relative">
          <input
            className="h-10 w-full rounded-full border border-[#dbe0ea] bg-white pl-4 pr-11 text-sm text-[#293041] outline-none transition-shadow placeholder:text-[#8b93a1] focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
            placeholder="Search jobs, routes, vehicles, drivers..."
          />
          <SearchOutlined className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[16px] text-[#687081]" />
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#eceef4] bg-[#f9fafc] text-[#2a3142] transition-colors hover:bg-white"
        >
          <BellOutlined className="text-[18px]" />
          <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-[#ff4726]" />
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#eceef4] bg-[#f9fafc] text-[#2a3142] transition-colors hover:bg-white"
        >
          <MessageOutlined className="text-[18px]" />
        </button>
        <div className="hidden h-8 w-px bg-[#e4e7ee] sm:block" />
        <div className="flex items-center gap-3 rounded-full border border-[#edf1f7] bg-[#f5f7fb] px-3 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#101e3d] text-white text-xs font-semibold shrink-0">
            <UserOutlined />
          </div>
          <span className="text-sm font-medium text-[#1f2635] hidden sm:block">Alpha Logistics</span>
          <DownOutlined className="text-[12px] text-[#8b93a1]" />
        </div>
      </div>
    </header>
  );
}
