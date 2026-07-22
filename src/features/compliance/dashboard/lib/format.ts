import type { StatusBadge, TrendDirection } from "@/src/features/compliance/dashboard/mock";
import type { ComplianceMetricDirection, ComplianceReviewItem } from "@/src/features/compliance/dashboard/api";

export function getTrendMeta(direction: TrendDirection = "neutral") {
  switch (direction) {
    case "up":
      return {
        icon: "↗",
        className: "text-[#1ea43b]",
      };
    case "down":
      return {
        icon: "↘",
        className: "text-[#ef4444]",
      };
    case "neutral":
    default:
      return {
        icon: "•",
        className: "text-[#7f8796]",
      };
  }
}

export function formatWholeNumber(value: number) {
  return value.toLocaleString("en-US");
}

export function formatTrendText(
  percentage: number,
  direction: ComplianceMetricDirection,
) {
  const rounded = Number.isInteger(percentage)
    ? percentage.toFixed(0)
    : percentage.toFixed(1);
  const prefix = direction === "down" ? "-" : direction === "neutral" ? "" : "+";
  return `${prefix}${rounded}% last month`;
}

export function formatSummaryMetricValue(
  metric: {
    value: number;
    unit?: string;
  },
) {
  if (metric.unit === "minutes") {
    return `${formatWholeNumber(metric.value)}m`;
  }

  if (metric.unit === "percent") {
    return `${formatWholeNumber(metric.value)}%`;
  }

  return formatWholeNumber(metric.value);
}

export function formatSummaryTrendText(
  metric: {
    change_percent?: number;
    change_direction?: ComplianceMetricDirection;
  },
) {
  if (metric.change_percent == null || metric.change_direction == null) {
    return undefined;
  }

  if (metric.change_direction === "neutral" && metric.change_percent === 0) {
    return "No change last month";
  }

  return formatTrendText(metric.change_percent, metric.change_direction);
}

export function formatQueueLoadNote(value: number) {
  return `${formatWholeNumber(value)} pending global claim${value === 1 ? "" : "s"}`;
}

export const complianceAlertDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Africa/Lagos",
});

export const COMPLIANCE_ALERT_SLA_HOURS = 48;

export function formatComplianceAlertExpiry(expiresAt: string) {
  return `Expires ${complianceAlertDateFormatter.format(new Date(expiresAt))}`;
}

export function splitComplianceAlertMessage(message: string) {
  const [title, detail] = message.split(/\s+-\s+/, 2);

  return {
    title: title?.trim() || "New Miner Onboarded",
    detail: detail?.trim() || "Ready for Review",
  };
}

export function buildComplianceAlertDetail(latestAlert: {
  miner_id: string | null;
  message: string;
}) {
  if (latestAlert.miner_id) {
    const shortMinerRef = latestAlert.miner_id.slice(0, 8);
    return `[Miner ID: ${shortMinerRef}] - Ready for Review.`;
  }

  return splitComplianceAlertMessage(latestAlert.message).detail;
}

export const adminDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatReviewStatusBadge(status: string): StatusBadge {
  switch (status) {
    case "claimed":
      return {
        label: "Claimed",
        tone: "cyan",
      };
    case "under_review":
      return {
        label: "Under review",
        tone: "amber",
      };
    case "compliance_ready":
      return {
        label: "Compliance-ready",
        tone: "green",
      };
    case "action_required":
      return {
        label: "Action required",
        tone: "red",
      };
    case "reviewed":
    case "completed":
      return {
        label: "Reviewed",
        tone: "mint",
      };
    case "pending":
    default:
      return {
        label: "Pending",
        tone: "slate",
      };
  }
}

export function formatRiskLevelBadge(riskLevel: string | null): StatusBadge {
  switch (riskLevel?.toLowerCase()) {
    case "low":
      return {
        label: "Low",
        tone: "green",
      };
    case "medium":
      return {
        label: "Medium",
        tone: "amber",
      };
    case "high":
    case "critical":
      return {
        label: "High",
        tone: "red",
      };
    default:
      return {
        label: "Unrated",
        tone: "slate",
      };
  }
}

export function formatAdminReviewDate(item: ComplianceReviewItem) {
  const source =
    item.reviewed_at ?? item.claimed_at ?? item.updated_at ?? item.created_at;
  return adminDateFormatter.format(new Date(source));
}

export function formatAdminReviewer(item: ComplianceReviewItem) {
  return item.assigned_to_email ?? "Unassigned";
}

export function formatWaitTime(createdAt: string, now: number) {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((now - new Date(createdAt).getTime()) / 60000),
  );

  if (elapsedMinutes < 60) {
    return {
      label: `${elapsedMinutes}m`,
      minutes: elapsedMinutes,
    };
  }

  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = elapsedMinutes % 60;

  if (hours < 24) {
    return {
      label: minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`,
      minutes: elapsedMinutes,
    };
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  return {
    label: remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`,
    minutes: elapsedMinutes,
  };
}

export function inferComplianceTaskProgress(item: ComplianceReviewItem) {
  if (item.compliance_score != null) {
    return Math.max(0, Math.min(100, Math.round(item.compliance_score)));
  }

  switch (item.status) {
    case "under_review":
      return 65;
    case "claimed":
      return 35;
    case "reviewed":
    case "completed":
    case "compliance_ready":
      return 100;
    case "action_required":
      return 80;
    default:
      return 15;
  }
}

export function formatComplianceTaskCta(status: string) {
  switch (status) {
    case "under_review":
      return "Continue review";
    case "claimed":
      return "Resume verification";
    default:
      return "Open review";
  }
}

export function formatReviewActionLabel(status: string, claimRequired = false) {
  if (claimRequired) {
    return "Claim Task";
  }

  switch (status) {
    case "pending":
      return "Accept Review Task";
    case "claimed":
      return "Start Review Now";
    case "under_review":
      return "Continue Review Now";
    default:
      return "Open Review";
  }
}

export function formatReviewStatusText(status: string) {
  return formatReviewStatusBadge(status).label;
}

export const reviewDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Africa/Lagos",
});

export const reviewTimeOnlyFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Africa/Lagos",
});

export function formatReviewDateTime(value?: string | null) {
  if (!value) {
    return "Not yet";
  }

  return reviewDateTimeFormatter.format(new Date(value));
}

export function formatReviewAttemptTime(value: Date) {
  return reviewTimeOnlyFormatter.format(value);
}

export function formatReviewScore(score: number | null | undefined) {
  if (score == null) {
    return "Pending";
  }

  return `${Math.max(0, Math.min(100, Math.round(score)))}%`;
}

