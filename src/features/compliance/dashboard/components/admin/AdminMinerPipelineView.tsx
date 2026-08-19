"use client";

import type { AdminReviewRow } from "@/src/features/compliance/dashboard/types";
import { classNames } from "@/src/features/compliance/dashboard/lib/style";
import {
  StatusBadgePill,
  ScoreMeter,
} from "@/src/features/compliance/dashboard/components/shared/DashboardMetricCard";

export default function AdminMinerPipelineView({
  rows,
  onSelectMiner,
}: {
  rows: AdminReviewRow[];
  onSelectMiner?: (row: AdminReviewRow) => void;
}) {
  return (
    <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)] sm:p-6">
      <div className="overflow-hidden rounded-[24px] border border-[#e5e9f1]">
        <div className="overflow-x-auto">
          <table className="min-w-[1080px] w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-[#fbfcfe] text-[15px] font-medium text-[#353b47]">
                <th className="border-b border-[#e5e9f1] px-5 py-5">Miner ID</th>
                <th className="border-b border-[#e5e9f1] px-5 py-5">Name / Company</th>
                <th className="border-b border-[#e5e9f1] px-5 py-5">State / LGA</th>
                <th className="border-b border-[#e5e9f1] px-5 py-5">Review status</th>
                <th className="border-b border-[#e5e9f1] px-5 py-5">Risk level</th>
                <th className="border-b border-[#e5e9f1] px-5 py-5">Compliance score</th>
                <th className="border-b border-[#e5e9f1] px-5 py-5">Assigned reviewer</th>
                <th className="border-b border-[#e5e9f1] px-5 py-5">Last action date</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-[14px] text-[#8a92a1]">
                    No miners in the pipeline yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onSelectMiner?.(row)}
                    className={classNames(
                      "text-[15px] text-[#4b5260]",
                      onSelectMiner ? "cursor-pointer hover:bg-[#f4f7fc]" : "",
                    )}
                  >
                    <td className="border-b border-[#edf1f7] px-5 py-6 font-medium text-[#4c5565]">
                      {row.minerId}
                    </td>
                    <td className="border-b border-[#edf1f7] px-5 py-6 text-[#2f3541]">
                      <div className="max-w-[220px] truncate">{row.company}</div>
                    </td>
                    <td className="border-b border-[#edf1f7] px-5 py-6">{row.location}</td>
                    <td className="border-b border-[#edf1f7] px-5 py-6">
                      <StatusBadgePill badge={row.reviewStatus} />
                    </td>
                    <td className="border-b border-[#edf1f7] px-5 py-6">
                      <StatusBadgePill badge={row.riskLevel} />
                    </td>
                    <td className="border-b border-[#edf1f7] px-5 py-6">
                      <ScoreMeter score={row.complianceScore} />
                    </td>
                    <td className="border-b border-[#edf1f7] px-5 py-6">
                      <div className="max-w-[180px] truncate">{row.reviewer}</div>
                    </td>
                    <td className="border-b border-[#edf1f7] px-5 py-6 whitespace-nowrap">
                      {row.lastActionDate}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
