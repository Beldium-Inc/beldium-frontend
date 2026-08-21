"use client";

import { Skeleton } from "antd";
import type { MarketplaceCategory } from "@/src/features/marketplace/public-api";

export default function MarketplaceCategorySidebar({
  categories,
  isLoading,
  selected,
  onSelect,
}: {
  categories: MarketplaceCategory[];
  isLoading: boolean;
  selected: string | null;
  onSelect: (mineralType: string | null) => void;
}) {
  return (
    <aside className="w-full md:w-56 shrink-0">
      <div className="bg-white border border-[#E9ECF2] rounded-xl p-4">
        <h2 className="text-xs font-semibold tracking-wide text-gray-500 uppercase mb-3">
          Categories
        </h2>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton.Input key={i} active size="small" block style={{ height: 28 }} />
            ))}
          </div>
        ) : (
          <ul className="space-y-1">
            {categories.map((c) => (
              <li key={c.mineral_type}>
                <button
                  type="button"
                  onClick={() => onSelect(selected === c.mineral_type ? null : c.mineral_type)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition-colors ${
                    selected === c.mineral_type
                      ? "bg-[#101E3D] !text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{c.mineral_type}</span>
                  <span
                    className={`text-xs ${
                      selected === c.mineral_type ? "text-white/70" : "text-gray-400"
                    }`}
                  >
                    {c.count}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
