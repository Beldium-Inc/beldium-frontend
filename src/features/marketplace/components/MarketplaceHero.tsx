"use client";

import Link from "next/link";
import { Skeleton } from "antd";
import type { MarketplaceStats } from "@/src/features/marketplace/public-api";

export default function MarketplaceHero({
  stats,
  isLoading,
}: {
  stats: MarketplaceStats | undefined;
  isLoading: boolean;
}) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#2b2b28] min-h-[220px] md:min-h-[260px]">
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />

      <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 px-6 md:px-10 py-8 md:py-10">
        <div className="max-w-xl">
          <h1 className="text-2xl md:text-4xl font-serif text-white leading-tight">
            Buy &amp; Sell with Confidence <span className="italic">on Beldium</span>
          </h1>
          <p className="text-white/80 mt-3 text-sm md:text-base">
            Source verified minerals from trusted suppliers or connect your own
            supply with buyers across Beldium&apos;s trusted marketplace.
          </p>
          <Link
            href="#active-listings"
            className="inline-flex items-center gap-2 mt-5 bg-white text-[#101E3D] font-medium px-5 py-2.5 rounded-full text-sm hover:bg-gray-100"
          >
            Explore marketplace <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-xl px-5 py-4 w-full lg:w-auto lg:min-w-[300px] shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-wide">
            <span>Total active listing</span>
          </div>
          {isLoading ? (
            <Skeleton.Input active size="small" style={{ width: 100, marginTop: 6 }} />
          ) : (
            <div className="text-2xl font-bold text-[#101E3D] mt-0.5">
              {(stats?.total_active_listings ?? 0).toLocaleString()}
            </div>
          )}
          <div className="text-xs text-gray-400 mb-3">
            Across {stats?.mineral_count ?? 0} minerals
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-center">
            <div>
              <div className="text-[11px] text-gray-400 uppercase">Buyers</div>
              {isLoading ? (
                <Skeleton.Input active size="small" style={{ width: 40 }} />
              ) : (
                <div className="font-semibold text-[#101E3D]">{stats?.buyer_count ?? 0}</div>
              )}
            </div>
            <div>
              <div className="text-[11px] text-gray-400 uppercase">Suppliers</div>
              {isLoading ? (
                <Skeleton.Input active size="small" style={{ width: 40 }} />
              ) : (
                <div className="font-semibold text-[#101E3D]">{stats?.supplier_count ?? 0}</div>
              )}
            </div>
            <div>
              <div className="text-[11px] text-gray-400 uppercase">Transactions</div>
              {isLoading ? (
                <Skeleton.Input active size="small" style={{ width: 40 }} />
              ) : (
                <div className="font-semibold text-[#101E3D]">{stats?.transaction_count ?? 0}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
