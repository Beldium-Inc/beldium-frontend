"use client";

import Link from "next/link";
import {
  UsergroupAddOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import type { ComplianceAlert, DashboardMetric } from "@/src/features/compliance/dashboard/mock";
import type {
  ComplianceQueueRow,
  ComplianceActiveTaskCard,
  AdminReviewRow,
} from "@/src/features/compliance/dashboard/types";
import { classNames, primaryActionStyle } from "@/src/features/compliance/dashboard/lib/style";
import {
  DashboardMetricCard,
  SpeedRing,
  StatusBadgePill,
  ScoreMeter,
  LinearProgress,
} from "@/src/features/compliance/dashboard/components/shared/DashboardMetricCard";

export function ComplianceAlertSection({
  alert,
  activeReviewId,
  onOpenReview,
  onDismiss,
}: {
  alert: ComplianceAlert;
  activeReviewId?: string;
  onOpenReview: () => void;
  onDismiss: () => void;
}) {
  const isActive = Boolean(alert.reviewId && activeReviewId === alert.reviewId);
  const canOpen = Boolean(alert.reviewId);
  const canDismiss = Boolean(alert.reviewId);

  return (
    <section className="rounded-[16px] border border-[#e6ebf4] bg-white p-4 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="h-14 w-1 rounded-full bg-gradient-to-b from-[#ff6a3d] to-[#ff3d19]" />
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef8ff] text-[20px] text-[#4b8fe8]">
          <UsergroupAddOutlined />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[19px] font-semibold tracking-[-0.02em] text-[#252a34]">
            {alert.title}
          </div>
          <div className="mt-1 text-[14px] text-[#7f8796]">
            {alert.detail}
          </div>
          {alert.meta ? (
            <div className="mt-1.5 text-[12px] text-[#a0a6b3]">
              {alert.meta}
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {canDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex h-12 items-center justify-center rounded-[14px] px-4 text-[14px] font-medium text-[#8a92a1] transition-colors hover:bg-[#f9fafc] hover:text-[#404655]"
            >
              Cancel
            </button>
          ) : null}
          <button
            type="button"
            onClick={onOpenReview}
            disabled={!canOpen}
            aria-pressed={isActive}
            className="inline-flex h-12 items-center justify-center rounded-[14px] border border-[#dfe3eb] bg-white px-5 text-[15px] font-medium text-[#404655] shadow-sm transition-colors hover:bg-[#f9fafc] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {alert.actionLabel}
          </button>
        </div>
      </div>
    </section>
  );
}

export function ComplianceMetricsSection({ metrics }: { metrics: DashboardMetric[] }) {
  const metricIcons = [
    {
      icon: <UsergroupAddOutlined />,
      tone: "blue" as const,
    },
    {
      icon: <ClockCircleOutlined />,
      tone: "orange" as const,
    },
    {
      icon: <CheckCircleOutlined />,
      tone: "mint" as const,
    },
    {
      icon: <UserOutlined />,
      tone: "rose" as const,
    },
  ];

  return (
    <section className="rounded-[16px] border border-[#e8ecf4] bg-white/75 p-4 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
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
              note={metric.note}
              progress={metric.progress}
              showAction={metric.title !== "Quality score"}
              footer={
                metric.title === "Avg. review time" ? (
                  <SpeedRing label="FAST" />
                ) : undefined
              }
            />
          );
        })}
      </div>
    </section>
  );
}

export function ComplianceQueueSection({
  rows,
  activeReviewId,
  onOpenReview,
  showViewFullQueue,
}: {
  rows: ComplianceQueueRow[];
  activeReviewId?: string;
  onOpenReview: (reviewId: string) => void;
  showViewFullQueue: boolean;
}) {
  return (
    <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)] sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[24px] font-semibold tracking-[-0.04em] text-[#2c313c]">
            Open Queue
          </h2>
          <p className="mt-1 text-[14px] text-[#7f8796]">
            Prioritize high-wait claims and pick up the next best review candidate quickly.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-[#d7dce6] bg-white px-4 py-2 text-[13px] font-medium text-[#7c8495] shadow-sm"
        >
          Sort by time
        </button>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#d7dce6] bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-[#fbfcfe] text-[15px] font-medium text-[#353b47]">
                <th className="border-b border-[#dfe4ec] px-5 py-5">Miner ID</th>
                <th className="border-b border-[#dfe4ec] px-5 py-5">Name / Company</th>
                <th className="border-b border-[#dfe4ec] px-5 py-5">State / LGA</th>
                <th className="border-b border-[#dfe4ec] px-5 py-5">Status</th>
                <th className="border-b border-[#dfe4ec] px-5 py-5">Wait time</th>
                <th className="border-b border-[#dfe4ec] px-5 py-5">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="relative text-[15px] text-[#4b5260]"
                >
                  <td
                    className={classNames(
                      "border-b border-[#edf1f7] px-5 py-6 font-medium text-[#4c5565]",
                      row.highlighted && "border-l-[3px] border-l-[#f1c232]",
                    )}
                  >
                    {row.minerId}
                  </td>
                  <td className="border-b border-[#edf1f7] px-5 py-6">
                    <div className="max-w-[220px] truncate">{row.company}</div>
                  </td>
                  <td className="border-b border-[#edf1f7] px-5 py-6">{row.location}</td>
                  <td className="border-b border-[#edf1f7] px-5 py-6">
                    <StatusBadgePill badge={row.statusBadge} />
                  </td>
                  <td
                    className={classNames(
                      "border-b border-[#edf1f7] px-5 py-6 font-medium",
                      row.waitTone === "warning"
                        ? "text-[#df8500]"
                        : "text-[#5d6370]",
                    )}
                  >
                    {row.waitTime}
                  </td>
                  <td className="border-b border-[#edf1f7] px-5 py-6">
                    <button
                      type="button"
                      onClick={() => onOpenReview(row.id)}
                      disabled={activeReviewId === row.id}
                      className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#101e3d] px-4 text-[14px] font-semibold !text-white shadow-[0_14px_24px_-18px_rgba(16,30,61,0.8)] transition-colors hover:bg-[#16284f] disabled:cursor-not-allowed disabled:opacity-70"
                      aria-pressed={activeReviewId === row.id}
                      style={primaryActionStyle}
                    >
                      <UserOutlined />
                      {activeReviewId === row.id ? "Selected" : "Claim"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showViewFullQueue ? (
          <div className="flex justify-center border-t border-[#edf1f7] px-4 py-4">
            <Link
              href="/compliancedashboard?persona=compliance&view=reviews"
              className="inline-flex items-center gap-3 rounded-[12px] border border-[#e1e5ee] bg-[#f7f8fb] px-4 py-3 text-[14px] font-medium text-[#5f6675] transition-colors hover:bg-white"
            >
              View full queue
              <ArrowRightOutlined />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function ComplianceReviewsSection({
  rows = [],
  onOpenReview,
}: {
  rows?: AdminReviewRow[];
  onOpenReview?: (reviewId: string) => void;
}) {
  return (
    <section className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)] sm:p-6">
      <div className="mb-6">
        <h2 className="text-[24px] font-semibold tracking-[-0.04em] text-[#2c313c]">
          Review List
        </h2>
        <p className="mt-1 text-[14px] text-[#7f8796]">
          Full review inventory from <span className="font-medium text-[#3a4252]">/compliance/reviews/</span>.
        </p>
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
                  onClick={() => onOpenReview?.(row.id)}
                  className={classNames(
                    "text-[15px] text-[#4b5260]",
                    onOpenReview ? "cursor-pointer hover:bg-[#f4f7fc]" : undefined,
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


export function ComplianceActiveCasesSection({
  cards,
  onOpenTask,
}: {
  cards: ComplianceActiveTaskCard[];
  onOpenTask: (reviewId: string) => void;
}) {
  if (cards.length === 0) {
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-[24px] font-semibold tracking-[-0.04em] text-[#2c313c]">
            My Active Queue
          </h2>
          <p className="mt-1 text-[14px] text-[#7f8796]">
            Resume in-flight reviews and keep critical claims moving.
          </p>
        </div>

        <div className="rounded-[24px] border border-[#d7dce6] bg-white p-6 text-[15px] text-[#7f8796] shadow-[0_24px_44px_-36px_rgba(16,30,61,0.5)]">
          You have no active review tasks yet.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-[24px] font-semibold tracking-[-0.04em] text-[#2c313c]">
          My Active Queue
        </h2>
        <p className="mt-1 text-[14px] text-[#7f8796]">
          Resume in-flight reviews and keep critical claims moving.
        </p>
      </div>

      {cards.map((card) => (
        <div
          key={card.id}
          className="rounded-[24px] border border-[#d7dce6] bg-white p-6 shadow-[0_24px_44px_-36px_rgba(16,30,61,0.5)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[16px] text-[#454c5d]">
                Miner ID{" "}
                <span className="font-semibold text-[#1368db]">{card.minerId}</span>
              </div>
              <div className="mt-2 text-[15px] text-[#8a92a1]">
                {card.company}
                <span className="mx-1">•</span>
                {card.location}
              </div>
            </div>

            <StatusBadgePill badge={card.priority} />
          </div>

          <div className="mt-6 flex items-center justify-between text-[13px] font-medium uppercase tracking-[0.06em] text-[#666d7b]">
            <span>Verification Progress</span>
            <span>{card.progress}%</span>
          </div>

          <div className="mt-2">
            <LinearProgress
              value={card.progress}
              tone={card.progress >= 80 ? "green" : card.progress >= 50 ? "amber" : "red"}
            />
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={() => onOpenTask(card.id)}
              className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-[14px] bg-[#101e3d] px-5 text-[16px] font-semibold !text-white shadow-[0_18px_30px_-22px_rgba(16,30,61,0.85)] transition-colors hover:bg-[#16284f]"
              style={primaryActionStyle}
            >
              {card.cta}
              <ArrowRightOutlined />
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}


export default function ComplianceDashboardView({
  alert,
  alertDismissed,
  metrics,
  queueRows,
  activeTaskCards,
  showViewFullQueue,
  activeReviewId,
  onOpenQueueReview,
  onOpenAlertReview,
  onDismissAlert,
  onOpenActiveTask,
}: {
  alert: ComplianceAlert;
  alertDismissed: boolean;
  metrics: DashboardMetric[];
  queueRows: ComplianceQueueRow[];
  activeTaskCards: ComplianceActiveTaskCard[];
  showViewFullQueue: boolean;
  activeReviewId?: string;
  onOpenQueueReview: (reviewId: string) => void;
  onOpenAlertReview: () => void;
  onDismissAlert: () => void;
  onOpenActiveTask: (reviewId: string) => void;
}) {
  return (
    <div className="space-y-6">
      {alertDismissed ? null : (
        <ComplianceAlertSection
          alert={alert}
          activeReviewId={activeReviewId}
          onOpenReview={onOpenAlertReview}
          onDismiss={onDismissAlert}
        />
      )}
      <ComplianceMetricsSection metrics={metrics} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.92fr)]">
        <ComplianceQueueSection
          rows={queueRows}
          showViewFullQueue={showViewFullQueue}
          activeReviewId={activeReviewId}
          onOpenReview={onOpenQueueReview}
        />
        <ComplianceActiveCasesSection
          cards={activeTaskCards}
          onOpenTask={onOpenActiveTask}
        />
      </div>
    </div>
  );
}

