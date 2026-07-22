"use client";

import {
  CloseOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  MailOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  SolutionOutlined,
  FolderOpenOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import type { ComplianceReviewDetail } from "@/src/features/compliance/dashboard/api";
import type {
  ComplianceReviewSelection,
  ReviewActionType,
} from "@/src/features/compliance/dashboard/types";
import { primaryActionStyle } from "@/src/features/compliance/dashboard/lib/style";
import {
  formatReviewActionLabel,
  formatWaitTime,
  formatReviewStatusBadge,
  formatReviewStatusText,
  formatRiskLevelBadge,
  formatReviewScore,
  formatReviewDateTime,
} from "@/src/features/compliance/dashboard/lib/format";
import { StatusBadgePill } from "@/src/features/compliance/dashboard/components/shared/DashboardMetricCard";
import {
  ReviewInfoTile,
  ReviewDocumentRow,
} from "@/src/features/compliance/dashboard/components/shared/ReviewTiles";

export default function ComplianceReviewDrawer({
  selection,
  detail,
  isLoading,
  now,
  activeAction,
  onClose,
  onAction,
}: {
  selection: ComplianceReviewSelection;
  detail?: ComplianceReviewDetail;
  isLoading: boolean;
  now: number;
  activeAction?: ReviewActionType;
  onClose: () => void;
  onAction: (action: ReviewActionType) => void;
}) {
  const status = detail?.status ?? "pending";
  const requiresClaim = Boolean(selection.claimRequired);
  const primaryAction: ReviewActionType =
    requiresClaim
      ? "claim"
      : status === "pending"
        ? "approve"
        : status === "under_review"
          ? "open_detail"
          : "start_review";
  const primaryLabel = formatReviewActionLabel(status, requiresClaim);
  const showReject = status === "pending" && !requiresClaim;
  const waitLabel = selection.createdAt
    ? formatWaitTime(selection.createdAt, now).label
    : null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Close review panel"
        className="absolute inset-0 bg-[rgba(8,13,28,0.18)] backdrop-blur-[3px]"
        onClick={onClose}
      />

      <aside className="relative flex h-full w-full max-w-[540px] flex-col overflow-hidden border-l border-[#e8ecf4] bg-white shadow-[-20px_0_50px_-30px_rgba(16,30,61,0.5)]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#edf1f7] bg-white px-5 py-4">
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">
              Compliance Review
            </div>
            <div className="mt-1 text-[18px] font-semibold text-[#202534]">
              {selection.company ?? selection.minerName ?? "Review task"}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e9f1] bg-[#fafbfd] text-[18px] text-[#4f5664] transition-colors hover:bg-white"
          >
            <CloseOutlined />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4 p-6">
            <div className="h-24 animate-pulse rounded-[22px] bg-[#f3f6fb]" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-24 animate-pulse rounded-[18px] bg-[#f3f6fb]" />
              <div className="h-24 animate-pulse rounded-[18px] bg-[#f3f6fb]" />
              <div className="h-24 animate-pulse rounded-[18px] bg-[#f3f6fb]" />
              <div className="h-24 animate-pulse rounded-[18px] bg-[#f3f6fb]" />
            </div>
            <div className="h-44 animate-pulse rounded-[22px] bg-[#f3f6fb]" />
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <section className="rounded-[26px] border border-[#e8ecf4] bg-[#fbfcfe] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">
                      Miner ID{" "}
                      <span className="ml-2 text-[#2661d8]">
                        #{selection.minerCode ?? selection.reviewId.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-[#2a2f39]">
                      {selection.location || selection.company || selection.minerName || "Review task"}
                    </div>
                    <div className="mt-2 text-[15px] text-[#7b8392]">
                      {selection.company ?? selection.minerName ?? "Compliance queue task"}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <StatusBadgePill badge={formatReviewStatusBadge(status)} />
                    {status === "pending" ? (
                      <span className="inline-flex rounded-full bg-[#1d5de2] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white">
                        New
                      </span>
                    ) : null}
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">
                  <InfoCircleOutlined />
                  Review Snapshot
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ReviewInfoTile
                    icon={<CheckCircleOutlined />}
                    label="Status"
                    value={formatReviewStatusText(status)}
                  />
                  <ReviewInfoTile
                    icon={<MailOutlined />}
                    label="Assigned to"
                    value={detail?.assigned_to || "Unassigned"}
                  />
                  <ReviewInfoTile
                    icon={<CalendarOutlined />}
                    label="Claimed at"
                    value={formatReviewDateTime(detail?.claimed_at)}
                  />
                  <ReviewInfoTile
                    icon={<ClockCircleOutlined />}
                    label="Reviewed at"
                    value={formatReviewDateTime(detail?.reviewed_at)}
                  />
                </div>
              </section>

              <section className="rounded-[24px] border border-[#e8ecf4] bg-white p-5">
                <div className="mb-4 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">
                  <SolutionOutlined />
                  Assessment
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[18px] bg-[#f7f9fc] p-4">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">
                      Risk level
                    </div>
                    <div className="mt-3">
                      <StatusBadgePill badge={formatRiskLevelBadge(detail?.risk_level ?? null)} />
                    </div>
                  </div>
                  <div className="rounded-[18px] bg-[#f7f9fc] p-4">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">
                      Compliance score
                    </div>
                    <div className="mt-3 text-[20px] font-semibold text-[#2b3140]">
                      {formatReviewScore(detail?.compliance_score)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[18px] bg-[#f7f9fc] p-4">
                  <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">
                    Notes
                  </div>
                  <div className="mt-3 text-[14px] leading-6 text-[#5d6675]">
                    {detail?.notes?.trim() || "No notes captured for this review yet."}
                  </div>
                </div>
              </section>

              <section className="rounded-[24px] border border-[#e8ecf4] bg-white p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">
                    <FolderOpenOutlined />
                    Document Checklist
                  </div>
                  <span className="rounded-full bg-[#f4f7fb] px-3 py-1 text-[12px] font-medium text-[#7b8392]">
                    3 Files
                  </span>
                </div>
                <div className="space-y-3">
                  <ReviewDocumentRow
                    name="Environmental_Impact.pdf"
                    type="pdf"
                    locked={status === "pending"}
                  />
                  <ReviewDocumentRow
                    name="Mining_License.png"
                    type="image"
                    locked={status === "pending"}
                  />
                  <ReviewDocumentRow
                    name="Community_Engagement.pdf"
                    type="pdf"
                    locked={status === "pending"}
                  />
                </div>
              </section>
            </div>

            <div className="border-t border-[#edf1f7] flex flex-col gap-4 bg-white p-6">
              <button
                type="button"
                onClick={() => onAction(primaryAction)}
                disabled={activeAction != null}
                className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-[16px] bg-[#14244a] px-5 text-[16px] font-semibold text-white shadow-[0_18px_36px_-24px_rgba(20,36,74,0.8)] transition-colors hover:bg-[#182c57] disabled:cursor-not-allowed disabled:opacity-70"
                style={primaryActionStyle}
              >
                {activeAction === primaryAction ? "Working..." : primaryLabel}
                <ArrowRightOutlined />
              </button>

              {showReject ? (
                <button
                  type="button"
                  onClick={() => onAction("reject")}
                  disabled={activeAction != null}
                  className="mt-3 inline-flex h-14 w-full items-center justify-center gap-3 rounded-[16px] border border-[#dfe5ef] bg-white px-5 text-[16px] font-semibold text-[#2b3140] transition-colors hover:bg-[#fafbfd] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {activeAction === "reject" ? "Working..." : "Pass/Ignore"}
                </button>
              ) : null}

              <div className="mt-4 text-center text-[12px] text-[#8a92a1]">
                {waitLabel
                  ? `Task has waited in queue for ${waitLabel}.`
                  : "Review status will update here after each action."}
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

