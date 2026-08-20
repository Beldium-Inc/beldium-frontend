"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Empty, Pagination, Select, Skeleton } from "antd";
import {
  getMarketplaceCategories,
  getMarketplaceStats,
  getPublicListings,
} from "@/src/features/marketplace/public-api";
import MarketplaceTopBar from "@/src/features/marketplace/components/MarketplaceTopBar";
import MarketplaceHeader from "@/src/features/marketplace/components/MarketplaceHeader";
import MarketplaceHero from "@/src/features/marketplace/components/MarketplaceHero";
import MarketplaceCategorySidebar from "@/src/features/marketplace/components/MarketplaceCategorySidebar";
import MarketplaceListingCard from "@/src/features/marketplace/components/MarketplaceListingCard";
import MarketplaceFooter from "@/src/features/marketplace/components/MarketplaceFooter";

type SortOption = "newest" | "price_low" | "price_high";

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_low" },
  { label: "Price: High to Low", value: "price_high" },
];

const ORDERING_BY_SORT: Record<SortOption, string> = {
  newest: "-created_at",
  price_low: "pricing__asking_price_per_mt",
  price_high: "-pricing__asking_price_per_mt",
};

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["marketplace", "stats"],
    queryFn: getMarketplaceStats,
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["marketplace", "categories"],
    queryFn: getMarketplaceCategories,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["marketplace", "listings", { search, category, sort, page }],
    queryFn: () =>
      getPublicListings({
        page,
        page_size: pageSize,
        search: search || undefined,
        mineral_type: category || undefined,
        ordering: ORDERING_BY_SORT[sort],
      }),
  });

  const results = data?.data?.results ?? [];
  const meta = data?.data;

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <MarketplaceTopBar />
      <MarketplaceHeader
        search={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6">
        <MarketplaceHero stats={stats} isLoading={statsLoading} />
      </div>

      <div id="active-listings" className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <MarketplaceCategorySidebar
            categories={categories}
            isLoading={categoriesLoading}
            selected={category}
            onSelect={(v) => {
              setCategory(v);
              setPage(1);
            }}
          />

          <div className="flex-1 min-w-0 bg-white border border-[#E9ECF2] rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <h2 className="font-semibold text-gray-900">
                Active listings{" "}
                <span className="text-gray-400 font-normal text-sm">
                  ({meta?.count ?? 0}+ minerals found)
                </span>
              </h2>
              <Select
                value={sort}
                onChange={(v: SortOption) => setSort(v)}
                className="w-full sm:w-56"
                options={SORT_OPTIONS.map((o) => ({ label: `Sort by: ${o.label}`, value: o.value }))}
              />
            </div>

            {isError && (
              <div className="text-sm text-red-500 mb-4">
                Unable to load listings right now. Please try again.
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: pageSize }).map((_, i) => (
                  <Skeleton key={i} active paragraph={{ rows: 4 }} />
                ))}
              </div>
            ) : results.length === 0 ? (
              <Empty description="No listings match your filters" className="py-16" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {results.map((listing) => (
                  <MarketplaceListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}

            {meta && meta.count > pageSize && (
              <div className="flex justify-center mt-8">
                <Pagination
                  current={meta.page_number || page}
                  pageSize={meta.per_page || pageSize}
                  total={meta.count}
                  onChange={(p) => setPage(p)}
                  showSizeChanger={false}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <MarketplaceFooter />
    </div>
  );
}
