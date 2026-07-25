import {
  formatComplianceAlertExpiry,
  splitComplianceAlertMessage,
  buildComplianceAlertDetail,
  formatSummaryMetricValue,
  formatSummaryTrendText,
  formatQueueLoadNote,
  formatWholeNumber,
  formatTrendText,
  formatReviewStatusBadge,
  formatRiskLevelBadge,
  formatAdminReviewer,
  formatAdminReviewDate,
  formatWaitTime,
  inferComplianceTaskProgress,
  formatComplianceTaskCta,
  COMPLIANCE_ALERT_SLA_HOURS,
} from "@/src/features/compliance/dashboard/lib/format";
import type {
  AdminReviewRow,
  ComplianceQueueRow,
  ComplianceActiveTaskCard,
  ComplianceReviewSelection,
} from "@/src/features/compliance/dashboard/types";
import type {
  ComplianceAlert,
  DashboardMetric,
} from "@/src/features/compliance/dashboard/mock";
import type {
  ComplianceDashboardSummaryResponse,
  ComplianceMinerDetailResponse,
  ComplianceReviewItem,
  ComplianceWorkflowResponse,
  DEFAULT_COMPLIANCE_MY_TASKS,
  DEFAULT_COMPLIANCE_REVIEW_DASHBOARD_CARDS,
  DEFAULT_COMPLIANCE_REVIEW_QUEUE,
  DEFAULT_COMPLIANCE_REVIEWS,
} from "@/src/features/compliance/dashboard/api";

export function filterBySearchTerm<T extends Record<string, unknown>>(
  rows: T[],
  searchTerm: string,
  fields: Array<keyof T>,
): T[] {
  const term = searchTerm.trim().toLowerCase();

  if (!term) {
    return rows;
  }

  return rows.filter((row) =>
    fields.some((field) => {
      const value = row[field];
      return typeof value === "string" && value.toLowerCase().includes(term);
    }),
  );
}

export function mapComplianceAlert(
  latestAlert: ComplianceDashboardSummaryResponse["data"]["latest_alert"],
): ComplianceAlert {
  if (!latestAlert) {
    return {
      title: "No active alerts",
      detail: "Your queue is clear for now",
      meta: "New alerts will appear here as soon as they are generated.",
      actionLabel: "Claim Task",
      createdAt: undefined,
      expiresAt: undefined,
    };
  }

  const alertCopy = splitComplianceAlertMessage(latestAlert.message);
  const expiresAt = new Date(
    new Date(latestAlert.created_at).getTime() +
      COMPLIANCE_ALERT_SLA_HOURS * 60 * 60 * 1000,
  ).toISOString();

  return {
    title: alertCopy.title,
    detail: buildComplianceAlertDetail(latestAlert),
    meta: formatComplianceAlertExpiry(expiresAt),
    actionLabel: "Claim Task",
    reviewId: latestAlert.review_id || undefined,
    minerId: latestAlert.miner_id,
    minerName: latestAlert.miner_name,
    createdAt: latestAlert.created_at,
    expiresAt,
  };
}

export function mapComplianceMetrics(
  data: ComplianceDashboardSummaryResponse["data"],
): DashboardMetric[] {
  return [
    {
      title: "Active tasks",
      value: formatSummaryMetricValue(data.active_tasks),
      trendText: formatSummaryTrendText(data.active_tasks),
      trendDirection: data.active_tasks.change_direction,
    },
    {
      title: "Avg. review time",
      value: formatSummaryMetricValue(data.avg_review_time),
      trendText: formatSummaryTrendText(data.avg_review_time),
      trendDirection: data.avg_review_time.change_direction,
    },
    {
      title: "Quality score",
      value: formatSummaryMetricValue(data.quality_score),
      progress: Math.max(0, Math.min(100, data.quality_score.value)),
    },
    {
      title: "Queue load",
      value: formatSummaryMetricValue(data.queue_load),
      note: formatQueueLoadNote(data.queue_load.value),
    },
  ];
}

export function mapAdminCardMetrics(
  data: typeof DEFAULT_COMPLIANCE_REVIEW_DASHBOARD_CARDS.data,
): DashboardMetric[] {
  return [
    {
      title: "Total Miners Onboarded",
      value: formatWholeNumber(data.total_miners_onboarded.count),
      trendText: formatTrendText(
        data.total_miners_onboarded.percentage_change.percentage,
        data.total_miners_onboarded.percentage_change.trend,
      ),
      trendDirection: data.total_miners_onboarded.percentage_change.trend,
      featured: true,
    },
    {
      title: "Under review",
      value: formatWholeNumber(data.under_review.count),
      trendText: formatTrendText(
        data.under_review.percentage_change.percentage,
        data.under_review.percentage_change.trend,
      ),
      trendDirection: data.under_review.percentage_change.trend,
    },
    {
      title: "Compliance-ready",
      value: formatWholeNumber(data.compliance_ready.count),
      trendText: formatTrendText(
        data.compliance_ready.percentage_change.percentage,
        data.compliance_ready.percentage_change.trend,
      ),
      trendDirection: data.compliance_ready.percentage_change.trend,
    },
    {
      title: "Action required",
      value: formatWholeNumber(data.action_required.count),
      trendText: formatTrendText(
        data.action_required.percentage_change.percentage,
        data.action_required.percentage_change.trend,
      ),
      trendDirection: data.action_required.percentage_change.trend,
    },
  ];
}

export function mapAdminReviewRows(
  results: typeof DEFAULT_COMPLIANCE_REVIEWS.data.results,
): AdminReviewRow[] {
  return results.map((item) => ({
    id: item.id,
    minerUuid: item.miner,
    minerId: item.miner_code,
    company: item.miner_company_name,
    location: [item.state_of_operation, item.local_government_area]
      .filter(Boolean)
      .join(" / "),
    reviewStatus: formatReviewStatusBadge(item.status),
    riskLevel: formatRiskLevelBadge(item.risk_level),
    complianceScore: Math.max(
      0,
      Math.min(100, Math.round(item.compliance_score ?? 0)),
    ),
    reviewer: formatAdminReviewer(item),
    lastActionDate: formatAdminReviewDate(item),
  }));
}

export function mapComplianceQueueRows(
  results: typeof DEFAULT_COMPLIANCE_REVIEW_QUEUE.data.results,
  now: number,
): ComplianceQueueRow[] {
  return results.map((item) => {
    const wait = formatWaitTime(item.created_at, now);

    return {
      id: item.id,
      minerUuid: item.miner,
      minerId: item.miner_code,
      company: item.miner_company_name,
      location: [item.state_of_operation, item.local_government_area]
        .filter(Boolean)
        .join(" / "),
      rawStatus: item.status,
      statusBadge: formatReviewStatusBadge(item.status),
      createdAt: item.created_at,
      waitTime: wait.label,
      waitMinutes: wait.minutes,
      waitTone: wait.minutes >= 60 ? "warning" : "default",
      highlighted: wait.minutes >= 60,
    };
  });
}

export function mapComplianceActiveTaskCards(
  results: typeof DEFAULT_COMPLIANCE_MY_TASKS.data.results,
): ComplianceActiveTaskCard[] {
  return results.map((item) => ({
    id: item.id,
    minerUuid: item.miner,
    minerId: item.miner_code,
    company: item.miner_company_name,
    location: [item.state_of_operation, item.local_government_area]
      .filter(Boolean)
      .join(" / "),
    rawStatus: item.status,
    priority: formatReviewStatusBadge(item.status),
    progress: inferComplianceTaskProgress(item),
    cta: formatComplianceTaskCta(item.status),
  }));
}

export function buildSelectionFromItem(item: ComplianceReviewItem): ComplianceReviewSelection {
  return {
    reviewId: item.id,
    minerId: item.miner,
    minerCode: item.miner_code,
    company: item.miner_company_name,
    location: [item.state_of_operation, item.local_government_area]
      .filter(Boolean)
      .join(" / "),
    minerName: item.miner_company_name,
    createdAt: item.created_at,
  };
}

export function buildSelectionFromAlert(
  alert: ComplianceAlert,
  matchingItem?: ComplianceReviewItem,
): ComplianceReviewSelection | null {
  if (!alert.reviewId) {
    return null;
  }

  if (matchingItem) {
    return buildSelectionFromItem(matchingItem);
  }

  return {
    reviewId: alert.reviewId,
    minerId: alert.minerId,
    minerCode: alert.reviewId.slice(0, 8).toUpperCase(),
    company: alert.minerName ?? undefined,
    location: undefined,
    minerName: alert.minerName,
    createdAt: alert.createdAt,
  };
}

export function getWorkflowStatus(response: ComplianceWorkflowResponse | null | undefined) {
  return typeof response?.status === "string" ? response.status : undefined;
}

export function getWorkflowMessage(
  response: ComplianceWorkflowResponse | null | undefined,
  fallback: string,
) {
  return typeof response?.message === "string" && response.message.trim()
    ? response.message
    : fallback;
}

export function getMinerDetailSummary(
  response: ComplianceMinerDetailResponse | undefined,
) {
  const data = response?.data;

  if (!data || typeof data !== "object") {
    return null;
  }

  return {
    activeTasks:
      typeof data.active_tasks?.value === "number" ? data.active_tasks.value : null,
    avgReviewTime:
      typeof data.avg_review_time?.value === "number"
        ? data.avg_review_time.value
        : null,
    qualityScore:
      typeof data.quality_score?.value === "number" ? data.quality_score.value : null,
    queueLoad:
      typeof data.queue_load?.value === "number" ? data.queue_load.value : null,
    latestAlert: data.latest_alert ?? null,
  };
}

