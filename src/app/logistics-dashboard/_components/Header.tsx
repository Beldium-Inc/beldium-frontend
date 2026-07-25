"use client";

import { IconSearch, IconBell, IconChat, IconChevronDown, IconCheckBadge, AvatarPlaceholder } from "./icons";

export default function LogisticsHeader({ title = "Overview" }: { title?: string }) {
  return (
    <header className="h-16 shrink-0 bg-white border-b border-gray-100 flex items-center justify-between px-6 gap-4">
      <div className="flex items-center gap-3 text-sm text-gray-400 shrink-0">
        <span>Dashboard</span>
        <span>/</span>
        <span className="text-gray-900 font-medium">{title}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-600 text-xs font-medium px-2.5 py-1 ml-2">
          <IconCheckBadge className="w-3.5 h-3.5" />
          Verified Logistics Partner
        </span>
      </div>

      <div className="flex-1 max-w-md hidden lg:block">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400">
          <IconSearch className="w-4 h-4 shrink-0" />
          <input
            className="bg-transparent outline-none w-full placeholder:text-gray-400 text-gray-700"
            placeholder="Search jobs, routes, vehicles, drivers..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100">
          <IconBell className="w-[18px] h-[18px]" />
        </button>
        <button className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100">
          <IconChat className="w-[18px] h-[18px]" />
        </button>
        <div className="w-px h-6 bg-gray-200" />
        <span className="text-sm font-medium text-gray-800 hidden sm:block">Alpha Logistics</span>
        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
          <AvatarPlaceholder className="w-9 h-9" />
        </div>
        <IconChevronDown className="w-4 h-4 text-gray-400" />
      </div>
    </header>
  );
}
