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
    <section className="rounded-[32px] border border-[#e8ecf4] bg-white/75 p-4 shadow-[0_28px_60px_-48px_rgba(16,30,61,0.35)]">
      <div className="grid gap-4 2xl:grid-cols-4 xl:grid-cols-2">
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
}: {
  rows?: AdminReviewRow[];
}) {
  return (
    <section className="rounded-[32px] border border-[#e8ecf4] bg-white p-5 shadow-[0_28px_60px_-48px_rgba(16,30,61,0.35)] sm:p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-[24px] font-semibold tracking-[-0.04em] text-[#2c313c]">
            Miner Pipeline
          </h2>
          <p className="mt-1 text-[14px] text-[#7f8796]">
            Review onboarding readiness, document status, and reviewer workload at a glance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-[16px] border border-[#dce3ef] bg-[#fafbfd] px-4 py-3 text-[14px] font-medium text-[#5d6675]"
          >
            Current Stage
            <span className="rounded-full bg-white px-3 py-1 text-[#353b47] shadow-sm">
              Mining Method
            </span>
          </button>
          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-[#dce3ef] bg-[#f4f6fa] text-[24px] text-[#4b5260] shadow-sm"
          >
            +
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#e5e9f1]">
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] w-full border-separate border-spacing-0 text-left">
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
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={classNames(
                    "text-[15px] text-[#4b5260]",
                    index % 2 === 0 ? "bg-white" : "bg-[#fcfdff]",
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
}: {
  metrics: DashboardMetric[];
  rows?: AdminReviewRow[];
}) {
  return (
    <div className="space-y-6">
      <AdminMetricsSection metrics={metrics} />
      <AdminPipelineSection rows={rows} />
    </div>
  );
}

