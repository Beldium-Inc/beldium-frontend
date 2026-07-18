"use client";

import { useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Input, Select, Skeleton, Pagination, Empty } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { getMinerProfiles } from "@/src/features/marketplace/api";
import { getMinerComplianceDetail } from "@/src/features/marketplace/detail-api";
import MarketplaceMinerCard from "@/src/features/marketplace/components/MarketplaceMinerCard";
import MarketplaceFilters, {
  MarketplaceFilterValues,
} from "@/src/features/marketplace/components/MarketplaceFilters";

// Backend (miners/views.py MinerProfileViewSet) only supports ordering by
// created_at, miner_code, license_issue_date. "Compliance score" and
// "production capacity" sort are done client-side on the loaded page only,
// since neither is a sortable/scalar field on this endpoint.
type SortOption = "newest" | "compliance_score" | "production_capacity";

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Newest first", value: "newest" },
  { label: "Compliance score (high to low)", value: "compliance_score" },
  { label: "Production capacity", value: "production_capacity" },
];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<MarketplaceFilterValues>({
    country: null,
    state_of_operation: null,
    mining_method: null,
    mineral_type: null,
    complianceScoreMin: 0,
  });
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "marketplace",
      "miner-profiles",
      { search, filters, sort, page, pageSize },
    ],
    queryFn: () =>
      getMinerProfiles({
        page,
        page_size: pageSize,
        search: search || undefined,
        country: filters.country || undefined,
        state_of_operation: filters.state_of_operation || undefined,
        mining_method: filters.mining_method || undefined,
        mineral_type: filters.mineral_type || undefined,
        ordering: sort === "newest" ? "-created_at" : undefined,
      }),
  });

  const results = useMemo(() => data?.data?.results ?? [], [data]);
  const meta = data?.data;

  // Compliance score lives on a separate compliance-review object, not on
  // /miner-profiles/, so it's fetched per miner id for the current page only.
  const complianceQueries = useQueries({
    queries: results.map((miner) => ({
      queryKey: ["marketplace", "miner-compliance-score", miner.id],
      queryFn: () => getMinerComplianceDetail(miner.id),
      staleTime: 1000 * 60 * 5,
      enabled: results.length > 0,
    })),
  });

  const complianceScoreById = useMemo(() => {
    const map = new Map<string, { score: number | null; loading: boolean }>();
    results.forEach((miner, i) => {
      const q = complianceQueries[i];
      map.set(miner.id, {
        score: q?.data?.data?.compliance_review?.compliance_score ?? null,
        loading: q?.isLoading ?? false,
      });
    });
    return map;
  }, [results, complianceQueries]);

  const parseOutput = (value: string | null) => {
    if (!value) return 0;
    const match = value.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  const visibleResults = useMemo(() => {
    let rows = results.filter((miner) => {
      const score = complianceScoreById.get(miner.id)?.score;
      if (filters.complianceScoreMin > 0 && (score == null || score < filters.complianceScoreMin)) {
        return false;
      }
      return true;
    });

    if (sort === "compliance_score") {
      rows = [...rows].sort((a, b) => {
        const scoreA = complianceScoreById.get(a.id)?.score ?? -1;
        const scoreB = complianceScoreById.get(b.id)?.score ?? -1;
        return scoreB - scoreA;
      });
    } else if (sort === "production_capacity") {
      rows = [...rows].sort(
        (a, b) => parseOutput(b.estimated_monthly_output) - parseOutput(a.estimated_monthly_output),
      );
    }

    return rows;
  }, [results, complianceScoreById, filters.complianceScoreMin, sort]);

  const handleFilterChange = (next: Partial<MarketplaceFilterValues>) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 px-4 md:px-6 pt-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Marketplace
        </h1>
        <p className="text-sm md:text-base text-gray-500">
          Browse verified miners for sourcing and quote requests
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Search by miner name, miner code, or license number"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="h-10 md:h-11 flex-1"
          allowClear
        />
        <Select
          value={sort}
          onChange={(v: SortOption) => setSort(v)}
          className="w-full md:w-64 h-10 md:h-11"
          options={SORT_OPTIONS}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <MarketplaceFilters values={filters} onChange={handleFilterChange} />

        <div className="flex-1 min-w-0">
          {isError && (
            <div className="text-sm text-red-500 mb-4">
              Unable to load miners right now. Please try again.
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: pageSize > 6 ? 6 : pageSize }).map((_, i) => (
                <Skeleton key={i} active paragraph={{ rows: 4 }} className="p-4 border border-[#E9ECF2] rounded-xl" />
              ))}
            </div>
          ) : visibleResults.length === 0 ? (
            <Empty description="No miners match your filters" className="py-16" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleResults.map((miner) => {
                const compliance = complianceScoreById.get(miner.id);
                return (
                  <MarketplaceMinerCard
                    key={miner.id}
                    miner={miner}
                    complianceScore={compliance?.score ?? null}
                    complianceLoading={compliance?.loading ?? false}
                  />
                );
              })}
            </div>
          )}

          {meta && meta.count > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-6">
              <Pagination
                current={meta.page_number || page}
                pageSize={meta.per_page || pageSize}
                total={meta.count}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
              />
              <Select
                value={pageSize}
                onChange={(v) => {
                  setPageSize(v);
                  setPage(1);
                }}
                className="w-full md:w-32"
                options={[
                  { label: "10 / page", value: 10 },
                  { label: "20 / page", value: 20 },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
