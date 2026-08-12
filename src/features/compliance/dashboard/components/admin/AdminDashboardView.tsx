"use client";

import { UsergroupAddOutlined, UserOutlined } from "@ant-design/icons";
import type { DashboardMetric } from "@/src/features/compliance/dashboard/mock";
import type { AdminReviewRow } from "@/src/features/compliance/dashboard/types";
import { classNames } from "@/src/features/compliance/dashboard/lib/style";
import {
  DashboardMetricCard,
  StatusBadgePill,
  ScoreMeter,
} from "@/src/features/compliance/dashboard/components/shared/DashboardMetricCard";

export function AdminMetricsSection({ metrics }: { metrics: DashboardMetric[] }) {
  const metricIcons = [
    {
      icon: <UsergroupAddOutlined />,
      tone: "blue" as const,
    },
    {
      icon: <UserOutlined />,
      tone: "orange" as const,
    },
    {
      icon: <UsergroupAddOutlined />,
      tone: "mint" as const,
    },
    {
      icon: <UserOutlined />,
      tone: "rose" as const,
    },
  ];

  return (
    <section className="rounded-[20px] border border-[#e8ecf4] bg-white/75 p-4 shadow-[0_16px_40px_-32px_rgba(16,30,61,0.35)]">
      <div className="grid gap-3 2xl:grid-cols-4 xl:grid-cols-2">
        {metrics.map((metric, index) => {
          const iconData = metricIcons[index];

          return (
            <DashboardMetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              icon={iconData.icon}
              iconTone={iconData.tone}
              trendText={metric.trendText}
              trendDirection={metric.trendDirection}
              featured={metric.featured}
            />
          );
        })}
      </div>
    </section>
  );
}

export function AdminPipelineSection({
  rows = [],
  activeReviewId,
  onOpenReview,
}: {
  rows?: AdminReviewRow[];
  activeReviewId?: string;
  onOpenReview?: (reviewId: string) => void;
}) {
  return (
    <section className="rounded-[20px] border border-[#e8ecf4] bg-white p-4 shadow-[0_16px_40px_-32px_rgba(16,30,61,0.35)] sm:p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#2c313c]">
            Miner Pipeline
          </h2>
          <p className="mt-0.5 text-[12px] text-[#7f8796]">
            Review onboarding readiness, document status, and reviewer workload at a glance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-[10px] border border-[#dce3ef] bg-[#fafbfd] px-3 py-2 text-[12px] font-medium text-[#5d6675]"
          >
            Current Stage
            <span className="rounded-full bg-white px-2.5 py-0.5 text-[#353b47] shadow-sm">
              Mining Method
            </span>
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-[#e5e9f1]">
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-[#fbfcfe] text-[12px] font-medium text-[#353b47]">
                <th className="border-b border-[#e5e9f1] px-4 py-3">Miner ID</th>
                <th className="border-b border-[#e5e9f1] px-4 py-3">Name / Company</th>
                <th className="border-b border-[#e5e9f1] px-4 py-3">State / LGA</th>
                <th className="border-b border-[#e5e9f1] px-4 py-3">Review status</th>
                <th className="border-b border-[#e5e9f1] px-4 py-3">Risk level</th>
                <th className="border-b border-[#e5e9f1] px-4 py-3">Compliance score</th>
                <th className="border-b border-[#e5e9f1] px-4 py-3">Assigned reviewer</th>
                <th className="border-b border-[#e5e9f1] px-4 py-3">Last action date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={classNames(
                    "text-[13px] text-[#4b5260]",
                    index % 2 === 0 ? "bg-white" : "bg-[#fcfdff]",
                  )}
                >
                  <td className="border-b border-[#edf1f7] px-4 py-3 font-medium text-[#4c5565]">
                    {row.minerId}
                  </td>
                  <td className="border-b border-[#edf1f7] px-4 py-3 text-[#2f3541]">
                    <div className="max-w-[220px] truncate">{row.company}</div>
                  </td>
                  <td className="border-b border-[#edf1f7] px-4 py-3">{row.location}</td>
                  <td className="border-b border-[#edf1f7] px-4 py-3">
                    <StatusBadgePill badge={row.reviewStatus} />
                  </td>
                  <td className="border-b border-[#edf1f7] px-4 py-3">
                    <StatusBadgePill badge={row.riskLevel} />
                  </td>
                  <td className="border-b border-[#edf1f7] px-4 py-3">
                    <ScoreMeter score={row.complianceScore} />
                  </td>
                  <td className="border-b border-[#edf1f7] px-4 py-3">
                    {row.reviewer === "Unassigned" && onOpenReview ? (
                      <button
                        type="button"
                        onClick={() => onOpenReview(row.id)}
                        disabled={activeReviewId === row.id}
                        className="inline-flex h-8 items-center gap-1.5 rounded-[8px] bg-[#101e3d] px-3 text-[12px] font-semibold !text-white shadow-[0_14px_24px_-18px_rgba(16,30,61,0.8)] transition-colors hover:bg-[#16284f] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <UserOutlined />
                        {activeReviewId === row.id ? "Selected" : "Claim"}
                      </button>
                    ) : (
                      <div className="max-w-[180px] truncate">{row.reviewer}</div>
                    )}
                  </td>
                  <td className="border-b border-[#edf1f7] px-4 py-3 whitespace-nowrap">
                    {row.lastActionDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default function AdminDashboardView({
  metrics,
  rows = [],
  activeReviewId,
  onOpenReview,
}: {
  metrics: DashboardMetric[];
  rows?: AdminReviewRow[];
  activeReviewId?: string;
  onOpenReview?: (reviewId: string) => void;
}) {
  return (
    <div className="space-y-6">
      <AdminMetricsSection metrics={metrics} />
      <AdminPipelineSection
        rows={rows}
        activeReviewId={activeReviewId}
        onOpenReview={onOpenReview}
      />
    </div>
  );
}

