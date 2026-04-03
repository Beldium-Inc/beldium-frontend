"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeftOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
  ArrowRightOutlined,
  BellOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FileSearchOutlined,
  FolderOpenOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  SettingOutlined,
  SolutionOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  WarningFilled,
} from "@ant-design/icons";
import {
  type ComplianceAlert,
  type DashboardMetric,
  type StatusBadge,
  type TrendDirection,
} from "@/src/features/compliance/dashboard/mock";
import {
  DEFAULT_COMPLIANCE_DASHBOARD_SUMMARY,
  DEFAULT_COMPLIANCE_MY_TASKS,
  DEFAULT_COMPLIANCE_REVIEW_QUEUE,
  DEFAULT_COMPLIANCE_REVIEWS,
  DEFAULT_COMPLIANCE_REVIEW_DASHBOARD_CARDS,
  claimComplianceReview,
  getComplianceDashboardSummary,
  getComplianceMinerDetail,
  getComplianceMyTasks,
  getComplianceReviewDetail,
  getComplianceReviewQueue,
  getComplianceReviews,
  getComplianceReviewDashboardCards,
  submitComplianceReviewWorkflow,
  type ComplianceDashboardSummaryResponse,
  type ComplianceMinerDetailResponse,
  type ComplianceReviewDetail,
  type ComplianceReviewItem,
  type ComplianceMetricDirection,
  type ComplianceWorkflowResponse,
} from "@/src/features/compliance/dashboard/api";
import { showToast } from "@/src/store/toast.store";

type DashboardPersona = "admin" | "compliance";
type ComplianceView = "dashboard" | "reviews";

type NavItem = {
  label: string;
  icon: ReactNode;
  active?: boolean;
  showDot?: boolean;
};

type MetricCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
  iconTone: "blue" | "orange" | "mint" | "rose";
  trendText?: string;
  trendDirection?: TrendDirection;
  note?: string;
  featured?: boolean;
  progress?: number;
  showAction?: boolean;
  footer?: ReactNode;
};

const adminNavItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: <AppstoreOutlined />,
    active: true,
  },
  {
    label: "Miner Pipeline",
    icon: <UsergroupAddOutlined />,
  },
  {
    label: "Partner directory",
    icon: <ApartmentOutlined />,
  },
  {
    label: "Regulatory readiness",
    icon: <SafetyCertificateOutlined />,
  },
  {
    label: "Notifications",
    icon: <BellOutlined />,
  },
];

function getComplianceNavItems(view: ComplianceView): NavItem[] {
  return [
    {
      label: "Dashboard",
      icon: <AppstoreOutlined />,
      active: view === "dashboard",
    },
    {
      label: "Open Task Pool",
      icon: <FolderOpenOutlined />,
    },
    {
      label: "Reviews",
      icon: <FileSearchOutlined />,
      active: view === "reviews",
    },
    {
      label: "Regulatory Alerts",
      icon: <BellOutlined />,
      showDot: true,
    },
  ];
}

const iconToneStyles = {
  blue: "bg-[#e9f0ff] text-[#4a80ff]",
  orange: "bg-[#fff0e5] text-[#ff8739]",
  mint: "bg-[#e8fbf6] text-[#1bc4a3]",
  rose: "bg-[#ffeaf4] text-[#ff5e98]",
};

const statusStyles: Record<
  StatusBadge["tone"],
  { container: string; dot: string }
> = {
  green: {
    container: "border border-[#caebd1] bg-[#ecfaf0] text-[#1ea43b]",
    dot: "bg-[#1fb538]",
  },
  amber: {
    container: "border border-[#f6e3bf] bg-[#fff4df] text-[#e09408]",
    dot: "bg-[#f3a000]",
  },
  red: {
    container: "border border-[#f7d6d7] bg-[#ffeff0] text-[#ef2f32]",
    dot: "bg-[#ef2f32]",
  },
  slate: {
    container: "border border-[#e5e8ef] bg-[#f4f6f9] text-[#6b7280]",
    dot: "bg-[#6b7280]",
  },
  mint: {
    container: "border border-[#c9efe5] bg-[#ebfbf5] text-[#119c78]",
    dot: "bg-[#18b78c]",
  },
  cyan: {
    container: "border border-[#d6edf4] bg-[#edf8fb] text-[#2387a3]",
    dot: "bg-[#2387a3]",
  },
  rose: {
    container: "border border-[#f8d7e6] bg-[#fff0f7] text-[#db2777]",
    dot: "bg-[#db2777]",
  },
};

const primaryActionStyle = {
  color: "#ffffff",
  textShadow: "0 1px 0 rgba(0, 0, 0, 0.18)",
};

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getTrendMeta(direction: TrendDirection = "neutral") {
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

function formatWholeNumber(value: number) {
  return value.toLocaleString("en-US");
}

function formatTrendText(
  percentage: number,
  direction: ComplianceMetricDirection,
) {
  const rounded = Number.isInteger(percentage)
    ? percentage.toFixed(0)
    : percentage.toFixed(1);
  const prefix = direction === "down" ? "-" : direction === "neutral" ? "" : "+";
  return `${prefix}${rounded}% last month`;
}

function formatSummaryMetricValue(
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

function formatSummaryTrendText(
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

function formatQueueLoadNote(value: number) {
  return `${formatWholeNumber(value)} pending global claim${value === 1 ? "" : "s"}`;
}

const complianceAlertDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Africa/Lagos",
});

function formatComplianceAlertMeta(latestAlert: {
  review_id: string;
  created_at: string;
}) {
  const reviewRef = latestAlert.review_id.slice(0, 8);
  const createdAt = complianceAlertDateFormatter.format(
    new Date(latestAlert.created_at),
  );

  return `Review ID: ${reviewRef} • ${createdAt}`;
}

function splitComplianceAlertMessage(message: string) {
  const [title, detail] = message.split(/\s+-\s+/, 2);

  return {
    title: title?.trim() || "New Miner Onboarded",
    detail: detail?.trim() || "Ready for Review",
  };
}

function mapComplianceAlert(
  latestAlert: ComplianceDashboardSummaryResponse["data"]["latest_alert"],
): ComplianceAlert {
  if (!latestAlert) {
    return {
      title: "No active alerts",
      detail: "Your queue is clear for now",
      meta: "New alerts will appear here as soon as they are generated.",
      actionLabel: "Claim Task",
      createdAt: undefined,
    };
  }

  const alertCopy = splitComplianceAlertMessage(latestAlert.message);

  return {
    title: alertCopy.title,
    detail: alertCopy.detail,
    meta: formatComplianceAlertMeta(latestAlert),
    actionLabel: "Claim Task",
    reviewId: latestAlert.review_id || undefined,
    minerId: latestAlert.miner_id,
    minerName: latestAlert.miner_name,
    createdAt: latestAlert.created_at,
  };
}

function mapComplianceMetrics(
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

function mapAdminCardMetrics(
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

type AdminReviewRow = {
  id: string;
  minerId: string;
  company: string;
  location: string;
  reviewStatus: StatusBadge;
  riskLevel: StatusBadge;
  complianceScore: number;
  reviewer: string;
  lastActionDate: string;
};

type ComplianceQueueRow = {
  id: string;
  minerUuid: string;
  minerId: string;
  company: string;
  location: string;
  rawStatus: string;
  statusBadge: StatusBadge;
  createdAt: string;
  waitTime: string;
  waitMinutes: number;
  waitTone?: "default" | "warning";
  highlighted?: boolean;
};

type ComplianceActiveTaskCard = {
  id: string;
  minerUuid: string;
  minerId: string;
  company: string;
  location: string;
  rawStatus: string;
  priority: StatusBadge;
  progress: number;
  cta: string;
};

type ComplianceReviewSelection = {
  reviewId: string;
  minerId?: string | null;
  minerCode?: string;
  company?: string;
  location?: string;
  minerName?: string | null;
  createdAt?: string;
  claimRequired?: boolean;
};

type ReviewActionType =
  | "approve"
  | "reject"
  | "start_review"
  | "claim"
  | "open_detail";

type ComplianceMinerDetailState = {
  selection: ComplianceReviewSelection;
  reviewDetail?: ComplianceReviewDetail | null;
};

type ReviewDocumentKind = "pdf" | "image" | "file";

type ReviewDocumentFile = {
  id: string;
  name: string;
  type: ReviewDocumentKind;
  viewUrl: string;
  downloadUrl: string;
};

const adminDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatReviewStatusBadge(status: string): StatusBadge {
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

function formatRiskLevelBadge(riskLevel: string | null): StatusBadge {
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

function formatAdminReviewDate(item: ComplianceReviewItem) {
  const source =
    item.reviewed_at ?? item.claimed_at ?? item.updated_at ?? item.created_at;
  return adminDateFormatter.format(new Date(source));
}

function formatAdminReviewer(item: ComplianceReviewItem) {
  return item.assigned_to_email ?? "Unassigned";
}

function mapAdminReviewRows(
  results: typeof DEFAULT_COMPLIANCE_REVIEWS.data.results,
): AdminReviewRow[] {
  return results.map((item) => ({
    id: item.id,
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

function formatWaitTime(createdAt: string, now: number) {
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

function mapComplianceQueueRows(
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

function inferComplianceTaskProgress(item: ComplianceReviewItem) {
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

function formatComplianceTaskCta(status: string) {
  switch (status) {
    case "under_review":
      return "Continue review";
    case "claimed":
      return "Resume verification";
    default:
      return "Open review";
  }
}

function mapComplianceActiveTaskCards(
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

function formatReviewActionLabel(status: string, claimRequired = false) {
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

function formatReviewStatusText(status: string) {
  return formatReviewStatusBadge(status).label;
}

const reviewDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Africa/Lagos",
});

const reviewTimeOnlyFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Africa/Lagos",
});

function formatReviewDateTime(value?: string | null) {
  if (!value) {
    return "Not yet";
  }

  return reviewDateTimeFormatter.format(new Date(value));
}

function formatReviewAttemptTime(value: Date) {
  return reviewTimeOnlyFormatter.format(value);
}

function formatReviewScore(score: number | null | undefined) {
  if (score == null) {
    return "Pending";
  }

  return `${Math.max(0, Math.min(100, Math.round(score)))}%`;
}

function buildSelectionFromItem(item: ComplianceReviewItem): ComplianceReviewSelection {
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

function buildSelectionFromAlert(
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

function getWorkflowStatus(response: ComplianceWorkflowResponse | null | undefined) {
  return typeof response?.status === "string" ? response.status : undefined;
}

function getWorkflowMessage(
  response: ComplianceWorkflowResponse | null | undefined,
  fallback: string,
) {
  return typeof response?.message === "string" && response.message.trim()
    ? response.message
    : fallback;
}

function getMinerDetailSummary(
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

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getComplianceApiOrigin() {
  const configuredOrigin = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/+$/, "");
  }

  switch (process.env.NEXT_PUBLIC_APP_ENV?.toLowerCase()) {
    case "production":
    case "prod":
      return "https://api.beldium.com";
    case "staging":
    case "stage":
    default:
      return "https://stg-api.beldium.com";
  }
}

function normalizeMinerDocumentUrl(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed, `${getComplianceApiOrigin()}/`).toString();
  } catch {
    return null;
  }
}

function getFirstStringField(
  record: Record<string, unknown>,
  keys: readonly string[],
) {
  for (const key of keys) {
    const candidate = record[key];

    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return null;
}

function getDocumentNameFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const segment = pathname.split("/").filter(Boolean).at(-1);

    return segment ? decodeURIComponent(segment) : null;
  } catch {
    return null;
  }
}

function inferReviewDocumentKind(
  name: string,
  url: string,
  mimeType?: string | null,
): ReviewDocumentKind {
  const lowerName = name.toLowerCase();
  const lowerUrl = url.toLowerCase();
  const lowerMime = mimeType?.toLowerCase() ?? "";

  if (
    lowerMime.includes("pdf") ||
    lowerName.endsWith(".pdf") ||
    lowerUrl.endsWith(".pdf")
  ) {
    return "pdf";
  }

  if (
    lowerMime.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|svg|bmp|tiff?)($|\?)/i.test(lowerName) ||
    /\.(png|jpe?g|gif|webp|svg|bmp|tiff?)($|\?)/i.test(lowerUrl)
  ) {
    return "image";
  }

  return "file";
}

function parseMinerDocumentRecord(record: Record<string, unknown>) {
  const viewUrl =
    normalizeMinerDocumentUrl(
      getFirstStringField(record, [
        "view_url",
        "file_url",
        "document_url",
        "url",
        "preview_url",
        "signed_url",
        "link",
        "href",
        "file",
        "document",
        "path",
      ]),
    ) ??
    normalizeMinerDocumentUrl(record.url) ??
    normalizeMinerDocumentUrl(record.file);

  const downloadUrl =
    normalizeMinerDocumentUrl(
      getFirstStringField(record, [
        "download_url",
        "signed_download_url",
        "download_link",
        "download",
      ]),
    ) ?? viewUrl;

  if (!viewUrl && !downloadUrl) {
    return null;
  }

  const mimeType = getFirstStringField(record, [
    "mime_type",
    "content_type",
    "file_type",
    "type",
  ]);
  const documentUrlForName = downloadUrl ?? viewUrl;
  const name =
    getFirstStringField(record, [
      "name",
      "file_name",
      "filename",
      "original_name",
      "document_name",
      "title",
      "label",
    ]) ??
    (documentUrlForName ? getDocumentNameFromUrl(documentUrlForName) : null);
  const hasDocumentShape =
    Object.keys(record).some((key) =>
      /(document|file|upload|attachment|certificate|license|report|image)/i.test(
        key,
      ),
    ) ||
    Boolean(name) ||
    Boolean(mimeType);

  if (!hasDocumentShape || !name) {
    return null;
  }

  const normalizedViewUrl = viewUrl ?? downloadUrl;
  const normalizedDownloadUrl = downloadUrl ?? viewUrl;

  if (!normalizedViewUrl || !normalizedDownloadUrl) {
    return null;
  }

  return {
    id:
      getFirstStringField(record, ["id", "uuid"]) ??
      `${name}-${normalizedDownloadUrl}`,
    name,
    type: inferReviewDocumentKind(name, normalizedDownloadUrl, mimeType),
    viewUrl: normalizedViewUrl,
    downloadUrl: normalizedDownloadUrl,
  } satisfies ReviewDocumentFile;
}

function getMinerDetailDocuments(
  response: ComplianceMinerDetailResponse | undefined,
): ReviewDocumentFile[] {
  const documents = new Map<string, ReviewDocumentFile>();

  function visit(value: unknown) {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (!isObjectRecord(value)) {
      return;
    }

    const parsedDocument = parseMinerDocumentRecord(value);

    if (parsedDocument) {
      documents.set(
        `${parsedDocument.name}::${parsedDocument.downloadUrl}`,
        parsedDocument,
      );
    }

    Object.values(value).forEach(visit);
  }

  visit(response?.data);

  return [...documents.values()];
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error && "response" in error) {
    const candidate = error as {
      response?: {
        data?: {
          message?: string | string[];
        };
      };
    };
    const message = candidate.response?.data?.message;

    if (Array.isArray(message) && message.length > 0) {
      return message.join(", ");
    }

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function StatusBadgePill({ badge }: { badge: StatusBadge }) {
  const style = statusStyles[badge.tone];

  return (
    <span
      className={classNames(
        "inline-flex items-center gap-2 rounded-[10px] px-3 py-2 text-[14px] font-medium",
        style.container,
      )}
    >
      <span className={classNames("h-2.5 w-2.5 rounded-full", style.dot)} />
      {badge.label}
    </span>
  );
}

function TrendMeta({
  direction,
  text,
  featured = false,
}: {
  direction?: TrendDirection;
  text?: string;
  featured?: boolean;
}) {
  if (!text) {
    return null;
  }

  const trend = getTrendMeta(direction);

  return (
    <div
      className={classNames(
        "mt-4 inline-flex items-center gap-1 text-[13px] font-medium",
        featured ? "text-[#89e79f]" : trend.className,
      )}
    >
      <span>{featured ? "↗" : trend.icon}</span>
      <span>{text}</span>
    </div>
  );
}

function ArrowActionButton({ featured = false }: { featured?: boolean }) {
  return (
    <button
      type="button"
      className={classNames(
        "mt-auto flex h-14 w-14 items-center justify-center rounded-full text-[20px] transition-transform hover:-translate-y-0.5",
        featured
          ? "bg-white/14 text-white"
          : "bg-[#eef1f6] text-[#687081] hover:bg-[#e7ebf2]",
      )}
    >
      <ArrowRightOutlined className="-rotate-45" />
    </button>
  );
}

function LinearProgress({
  value,
  tone = "green",
}: {
  value: number;
  tone?: "green" | "amber" | "red";
}) {
  const toneClass =
    tone === "green"
      ? "bg-[#18b829]"
      : tone === "amber"
        ? "bg-[#f3a000]"
        : "bg-[#ef2f32]";

  return (
    <div className="mt-5 h-3.5 w-full overflow-hidden rounded-full bg-[#e8ecf2]">
      <div
        className={classNames("h-full rounded-full", toneClass)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function ScoreMeter({ score }: { score: number }) {
  const tone: "green" | "amber" | "red" =
    score >= 80 ? "green" : score >= 50 ? "amber" : "red";

  return (
    <div className="min-w-[160px]">
      <LinearProgress value={score} tone={tone} />
    </div>
  );
}

function SpeedRing({ label }: { label: string }) {
  return (
    <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full border-[8px] border-[#19b649] border-l-[#e4edf2] border-b-[#e4edf2] text-[11px] font-semibold tracking-[0.14em] text-[#677080]">
      {label}
    </div>
  );
}

function DashboardMetricCard({
  title,
  value,
  icon,
  iconTone,
  trendText,
  trendDirection,
  note,
  featured = false,
  progress,
  showAction = true,
  footer,
}: MetricCardProps) {
  return (
    <div
      className={classNames(
        "rounded-[28px] border p-5 shadow-[0_24px_44px_-34px_rgba(16,30,61,0.4)]",
        featured
          ? "border-[#4c4f56] bg-[#45474b] text-white"
          : "border-[#e7ebf2] bg-white text-[#202534]",
      )}
    >
      <div className="flex items-center gap-4">
        <span
          className={classNames(
            "flex h-12 w-12 items-center justify-center rounded-full text-[20px]",
            featured ? "bg-white/10 text-[#74a3ff]" : iconToneStyles[iconTone],
          )}
        >
          {icon}
        </span>
        <span
          className={classNames(
            "text-[15px] font-medium",
            featured ? "text-white/90" : "text-[#3a3e48]",
          )}
        >
          {title}
        </span>
      </div>

      <div className="mt-10 flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div
            className={classNames(
              "text-[52px] font-semibold leading-none tracking-[-0.05em]",
              featured ? "text-white" : "text-[#272b33]",
            )}
          >
            {value}
          </div>
          {progress != null ? <LinearProgress value={progress} /> : null}
          <TrendMeta
            direction={trendDirection}
            text={trendText}
            featured={featured}
          />
          {note ? (
            <div
              className={classNames(
                "mt-4 text-[13px]",
                featured ? "text-white/60" : "text-[#9aa1af]",
              )}
            >
              {note}
            </div>
          ) : null}
        </div>

        {footer ?? (showAction ? <ArrowActionButton featured={featured} /> : null)}
      </div>
    </div>
  );
}

function SidebarNavItem({ item }: { item: NavItem }) {
  return (
    <button
      type="button"
      className={classNames(
        "flex w-full items-center gap-3 rounded-r-[18px] border-r-4 px-5 py-4 text-left text-[16px] font-medium transition-colors",
        item.active
          ? "border-r-[#101e3d] bg-[#d9e8ff] text-[#101e3d]"
          : "border-r-transparent text-[#3b4253] hover:bg-white hover:text-[#101e3d]",
      )}
    >
      <span
        className={classNames(
          "text-[20px]",
          item.active ? "text-[#123f8f]" : "text-[#202534]",
        )}
      >
        {item.icon}
      </span>
      <span>{item.label}</span>
      {item.showDot ? (
        <span className="ml-auto h-2.5 w-2.5 rounded-full bg-[#ff4726]" />
      ) : null}
    </button>
  );
}

function DashboardSidebar({
  persona,
  complianceView = "dashboard",
}: {
  persona: DashboardPersona;
  complianceView?: ComplianceView;
}) {
  const navItems =
    persona === "admin" ? adminNavItems : getComplianceNavItems(complianceView);

  return (
    <aside className="hidden w-[280px] flex-col border-r border-[#e9edf5] bg-white xl:flex">
      <div className="flex h-[96px] items-center gap-3 px-6">
        <Image
          src="/assets/images/logo.png"
          alt="Beldium"
          width={34}
          height={34}
        />
        <span className="text-[18px] font-semibold text-[#172554]">Beldium</span>
      </div>

      <nav className="mt-12 flex flex-1 flex-col gap-6 pr-3">
        {navItems.map((item) => (
          <SidebarNavItem key={item.label} item={item} />
        ))}
      </nav>

      <div className="px-6 pb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-[16px] font-medium text-[#ef2f32] transition-colors hover:text-[#d72225]"
        >
          <LogoutOutlined className="text-[18px]" />
          Logout
        </Link>
      </div>
    </aside>
  );
}

function OnlineToggle() {
  return (
    <div className="flex items-center gap-3">
      <span className="relative flex h-8 w-[88px] rounded-full bg-[#18bf54] p-1 shadow-inner">
        <span className="ml-auto h-6 w-6 rounded-full bg-white shadow-sm" />
      </span>
      <span className="text-[14px] font-semibold tracking-[0.12em] text-[#15a93d]">
        ONLINE
      </span>
    </div>
  );
}

function DashboardTopBar({ persona }: { persona: DashboardPersona }) {
  return (
    <header className="border-b border-[#e9edf5] bg-white/95 backdrop-blur">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 xl:flex-row xl:items-center xl:justify-between xl:px-8">
        <div className="flex items-center gap-3 xl:hidden">
          <Image
            src="/assets/images/logo.png"
            alt="Beldium"
            width={28}
            height={28}
          />
          <span className="text-xl font-semibold text-[#172554]">Beldium</span>
        </div>

        <div className="relative w-full max-w-[410px]">
          <input
            type="text"
            placeholder="Search miner"
            className="h-14 w-full rounded-full border border-[#dbe0ea] bg-white pl-6 pr-14 text-[17px] text-[#293041] outline-none transition-shadow placeholder:text-[#8b93a1] focus:shadow-[0_0_0_4px_rgba(16,30,61,0.06)]"
          />
          <SearchOutlined className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-[22px] text-[#687081]" />
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6">
          <div className="flex items-center gap-4 rounded-full bg-white px-2 py-1">
            <span className="text-[15px] text-[#707785]">Status</span>
            <OnlineToggle />
          </div>

          <span className="inline-flex h-12 items-center rounded-[16px] border border-[#b8e3bf] bg-[#f1fff3] px-5 text-[15px] font-medium text-[#13a236]">
            Pilot Phase
          </span>

          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[#eceef4] bg-[#f9fafc] text-[20px] text-[#2a3142] transition-colors hover:bg-white"
          >
            <SettingOutlined />
          </button>

          <button
            type="button"
            className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[#eceef4] bg-[#f9fafc] text-[20px] text-[#2a3142] transition-colors hover:bg-white"
          >
            <BellOutlined />
            <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#ff4726]" />
          </button>

          <div className="hidden h-12 w-px bg-[#e4e7ee] lg:block" />

          <div className="flex items-center gap-3 rounded-full bg-[#f5f7fb] px-3 py-2">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-sm">
              <Image
                src="/assets/images/get-started.jpg"
                alt="David Obi"
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="leading-tight">
              <div className="text-[16px] font-semibold text-[#1f2635]">
                David Obi
              </div>
              <div className="mt-1 text-[14px] text-[#7a8291]">
                {persona === "admin" ? "Admin" : "Compliance"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function WorkspaceSwitch({ persona }: { persona: DashboardPersona }) {
  const options: Array<{ value: DashboardPersona; label: string }> = [
    { value: "admin", label: "Admin workspace" },
    { value: "compliance", label: "Compliance workspace" },
  ];

  return (
    <div className="inline-flex rounded-full border border-[#dfe5ef] bg-white p-1 shadow-[0_16px_30px_-24px_rgba(16,30,61,0.35)]">
      {options.map((option) => {
        const active = persona === option.value;

        return (
          <Link
            key={option.value}
            href={`/compliancedashboard?persona=${option.value}`}
            className={classNames(
              "rounded-full px-4 py-2 text-[14px] font-semibold transition-colors",
              active
                ? "bg-[#101e3d] text-white"
                : "text-[#5b6472] hover:text-[#101e3d]",
            )}
            style={active ? primaryActionStyle : undefined}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}

function PageHero({
  persona,
  complianceView = "dashboard",
}: {
  persona: DashboardPersona;
  complianceView?: ComplianceView;
}) {
  const isComplianceReviewsView =
    persona === "compliance" && complianceView === "reviews";

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-4">
        <WorkspaceSwitch persona={persona} />
        <div>
          <h1 className="text-[42px] font-semibold tracking-[-0.06em] text-[#2a2f39]">
            {isComplianceReviewsView ? "Reviews" : "Dashboard"}
          </h1>
          <p className="mt-2 max-w-[720px] text-[15px] text-[#7a8291]">
            {isComplianceReviewsView
              ? "Review every compliance task from the full list without losing the workspace context."
              : persona === "admin"
              ? "Track miner onboarding, reviewer assignments, and regulatory readiness from a single command center."
              : "Stay on top of open claims, active reviews, and compliance quality without leaving the queue."}
          </p>
        </div>
      </div>

      <Link
        href={
          isComplianceReviewsView
            ? "/compliancedashboard?persona=compliance"
            : "#"
        }
        className="relative inline-flex h-[60px] items-center justify-center gap-3 rounded-[18px] bg-[#14244a] px-8 text-[16px] font-semibold text-white shadow-[0_18px_36px_-24px_rgba(20,36,74,0.8)] transition-transform hover:-translate-y-0.5"
        style={primaryActionStyle}
      >
        {isComplianceReviewsView ? (
          <>
            <ArrowLeftOutlined />
            Back to workspace
          </>
        ) : (
          <>
            Open Queue
            <ArrowRightOutlined />
            <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#ff4726]" />
          </>
        )}
      </Link>
    </div>
  );
}

function AdminMetricsSection({ metrics }: { metrics: DashboardMetric[] }) {
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

function AdminPipelineSection({
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

function ComplianceAlertSection({
  alert,
  activeReviewId,
  onOpenReview,
}: {
  alert: ComplianceAlert;
  activeReviewId?: string;
  onOpenReview: () => void;
}) {
  const isActive = Boolean(alert.reviewId && activeReviewId === alert.reviewId);
  const canOpen = Boolean(alert.reviewId);

  return (
    <section className="rounded-[28px] border border-[#e6ebf4] bg-white p-4 shadow-[0_28px_60px_-48px_rgba(16,30,61,0.35)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="h-14 w-1 rounded-full bg-gradient-to-b from-[#ff6a3d] to-[#ff3d19]" />
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef8ff] text-[20px] text-[#4b8fe8]">
          <UsergroupAddOutlined />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[24px] font-semibold tracking-[-0.03em] text-[#252a34]">
            {alert.title}
          </div>
          <div className="mt-1 text-[15px] text-[#7f8796]">
            {alert.detail}
          </div>
          <div className="mt-2 text-[13px] text-[#a0a6b3]">
            {alert.meta}
          </div>
        </div>
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
    </section>
  );
}

function ComplianceMetricsSection({ metrics }: { metrics: DashboardMetric[] }) {
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

function ComplianceQueueSection({
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
    <section className="rounded-[32px] border border-[#e8ecf4] bg-white p-5 shadow-[0_28px_60px_-48px_rgba(16,30,61,0.35)] sm:p-6">
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
                      className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#101e3d] px-4 text-[14px] font-semibold text-white shadow-[0_14px_24px_-18px_rgba(16,30,61,0.8)] transition-colors hover:bg-[#16284f] disabled:cursor-not-allowed disabled:opacity-70"
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

function ComplianceReviewsSection({
  rows = [],
}: {
  rows?: AdminReviewRow[];
}) {
  return (
    <section className="rounded-[32px] border border-[#e8ecf4] bg-white p-5 shadow-[0_28px_60px_-48px_rgba(16,30,61,0.35)] sm:p-6">
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

function ComplianceActiveCasesSection({
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
              className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-[14px] bg-[#101e3d] px-5 text-[16px] font-semibold text-white shadow-[0_18px_30px_-22px_rgba(16,30,61,0.85)] transition-colors hover:bg-[#16284f]"
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

function AdminDashboardView({
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

function ComplianceDashboardView({
  alert,
  metrics,
  queueRows,
  activeTaskCards,
  showViewFullQueue,
  activeReviewId,
  onOpenQueueReview,
  onOpenAlertReview,
  onOpenActiveTask,
}: {
  alert: ComplianceAlert;
  metrics: DashboardMetric[];
  queueRows: ComplianceQueueRow[];
  activeTaskCards: ComplianceActiveTaskCard[];
  showViewFullQueue: boolean;
  activeReviewId?: string;
  onOpenQueueReview: (reviewId: string) => void;
  onOpenAlertReview: () => void;
  onOpenActiveTask: (reviewId: string) => void;
}) {
  return (
    <div className="space-y-6">
      <ComplianceAlertSection
        alert={alert}
        activeReviewId={activeReviewId}
        onOpenReview={onOpenAlertReview}
      />
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

function ComplianceReviewsView({
  rows,
}: {
  rows: AdminReviewRow[];
}) {
  return <ComplianceReviewsSection rows={rows} />;
}

function ReviewInfoTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#e7ebf2] bg-[#fafbfd] p-4">
      <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">
        <span className="text-[14px] text-[#7b8392]">{icon}</span>
        {label}
      </div>
      <div className="mt-3 text-[15px] font-medium text-[#2d3441]">{value}</div>
    </div>
  );
}

function ReviewDocumentRow({
  name,
  type,
  locked,
  viewUrl,
  downloadUrl,
}: {
  name: string;
  type: ReviewDocumentKind;
  locked: boolean;
  viewUrl?: string;
  downloadUrl?: string;
}) {
  const Icon =
    type === "pdf"
      ? FilePdfOutlined
      : type === "image"
        ? FileImageOutlined
        : FileSearchOutlined;
  const canOpen = !locked && Boolean(viewUrl);
  const canDownload = !locked && Boolean(downloadUrl);

  return (
    <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[#e8ecf4] bg-white px-4 py-4">
      <div className="flex items-center gap-3">
        <span
          className={classNames(
            "flex h-10 w-10 items-center justify-center rounded-[14px] text-[18px]",
            type === "pdf"
              ? "bg-[#ecfff3] text-[#14b85f]"
              : type === "image"
                ? "bg-[#eef4ff] text-[#2661d8]"
                : "bg-[#f4f7fb] text-[#5e6777]",
          )}
        >
          <Icon />
        </span>
        <div>
          <div className="text-[15px] font-medium text-[#293041]">{name}</div>
          <div className="mt-1 text-[13px] text-[#8a92a1]">
            {locked ? "Accept task to unlock sensitive data" : "Ready for review"}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={classNames(
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-medium",
            locked
              ? "border border-[#e8ecf4] bg-[#f7f9fc] text-[#7f8796]"
              : "border border-[#caebd1] bg-[#ecfaf0] text-[#1ea43b]",
          )}
        >
          {locked ? (
            <>
              <InfoCircleOutlined />
              Locked
            </>
          ) : (
            <>
              <CheckCircleOutlined />
              Uploaded
            </>
          )}
        </span>

        <a
          href={canOpen ? viewUrl : undefined}
          target={canOpen ? "_blank" : undefined}
          rel={canOpen ? "noreferrer" : undefined}
          aria-disabled={!canOpen}
          className={classNames(
            "inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border px-4 text-[13px] font-medium transition-colors",
            canOpen
              ? "border-[#dce3ef] bg-white text-[#2b3140] hover:bg-[#f8fbff]"
              : "pointer-events-none border-[#eef2f7] bg-[#f7f9fc] text-[#a0a7b5]",
          )}
        >
          <EyeOutlined />
          View
        </a>

        <a
          href={canDownload ? downloadUrl : undefined}
          target={canDownload ? "_blank" : undefined}
          rel={canDownload ? "noreferrer" : undefined}
          download={canDownload ? name : undefined}
          aria-disabled={!canDownload}
          className={classNames(
            "inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border px-4 text-[13px] font-medium transition-colors",
            canDownload
              ? "border-[#dce3ef] bg-white text-[#2b3140] hover:bg-[#f8fbff]"
              : "pointer-events-none border-[#eef2f7] bg-[#f7f9fc] text-[#a0a7b5]",
          )}
        >
          <DownloadOutlined />
          Download
        </a>
      </div>
    </div>
  );
}

function ComplianceReviewDrawer({
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

            <div className="border-t border-[#edf1f7] bg-white p-6">
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

function ComplianceClaimConflictModal({
  minerCode,
  loggedAt,
  onBack,
}: {
  minerCode?: string;
  loggedAt: Date;
  onBack: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(8,13,28,0.28)] backdrop-blur-[4px] px-4">
      <div className="w-full max-w-[720px] rounded-[28px] bg-white p-6 shadow-[0_40px_90px_-40px_rgba(16,30,61,0.55)]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#ffe9ea] text-[40px] text-[#ef2f32]">
          <WarningFilled />
        </div>

        <div className="mt-6 text-center">
          <div className="text-[32px] font-semibold tracking-[-0.04em] text-[#2a2f39]">
            Task Already Claimed
          </div>
          <p className="mx-auto mt-4 max-w-[520px] text-[17px] leading-8 text-[#6a7282]">
            Another regulator has claimed{" "}
            <span className="font-semibold text-[#2a2f39]">
              Miner ID: #{minerCode ?? "Unavailable"}
            </span>
            . Please select a different task from the queue.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="mt-8 inline-flex h-16 w-full items-center justify-center gap-3 rounded-[16px] bg-[#14244a] px-6 text-[18px] font-semibold text-white shadow-[0_18px_36px_-24px_rgba(20,36,74,0.8)] transition-colors hover:bg-[#182c57]"
          style={primaryActionStyle}
        >
          <ArrowLeftOutlined />
          Back to Queue
        </button>

        <div className="mt-6 border-t border-[#edf1f7] pt-5 text-center text-[14px] text-[#8a92a1]">
          Failed attempt logged at {formatReviewAttemptTime(loggedAt)} WAT
        </div>
      </div>
    </div>
  );
}

function ComplianceMinerDetailView({
  selection,
  reviewDetail,
  minerDetail,
  isLoading,
  onBack,
}: {
  selection: ComplianceReviewSelection;
  reviewDetail?: ComplianceReviewDetail | null;
  minerDetail?: ComplianceMinerDetailResponse;
  isLoading: boolean;
  onBack: () => void;
}) {
  const minerSummary = getMinerDetailSummary(minerDetail);
  const documents = getMinerDetailDocuments(minerDetail);
  const reviewStatus = reviewDetail?.status ?? "under_review";
  const minerStatus = formatReviewStatusText(reviewStatus);
  const activityItems = [
    reviewDetail?.reviewed_at
      ? {
          label: "Review completed",
          meta: `Completed on ${formatReviewDateTime(reviewDetail.reviewed_at)}`,
        }
      : null,
    reviewDetail?.claimed_at
      ? {
          label: "Task claimed",
          meta: `Claimed on ${formatReviewDateTime(reviewDetail.claimed_at)}`,
        }
      : null,
    minerSummary?.latestAlert?.created_at
      ? {
          label: minerSummary.latestAlert.message,
          meta: `Alert created on ${formatReviewDateTime(
            minerSummary.latestAlert.created_at,
          )}`,
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; meta: string }>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-[14px] text-[#7b8392]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-[#dce3ef] bg-white px-4 py-2 text-[14px] font-medium text-[#4e5665] shadow-sm"
        >
          <ArrowLeftOutlined />
          Back to dashboard
        </button>
        <span>Dashboard</span>
        <ArrowRightOutlined className="text-[12px]" />
        <span className="font-semibold text-[#2a2f39]">Miner Detail</span>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[340px_minmax(0,1fr)_280px]">
        <section className="rounded-[28px] border border-[#e8ecf4] bg-white p-6 shadow-[0_28px_60px_-48px_rgba(16,30,61,0.35)]">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#ff4678] text-[54px] font-semibold italic text-white">
              {selection.company?.slice(0, 2).toLowerCase() || "in"}
            </div>
            <div className="mt-6 text-[34px] font-semibold tracking-[-0.05em] text-[#2a2f39]">
              {selection.company ?? selection.minerName ?? "Miner Profile"}
            </div>
            <div className="mt-2 text-[18px] text-[#6f7786]">
              Miner&apos;s ID: {selection.minerCode ?? selection.reviewId.slice(0, 8).toUpperCase()}
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between gap-3 text-[15px] text-[#4f5664]">
              <span className="inline-flex items-center gap-2 text-[#7b8392]">
                <EnvironmentOutlined />
                Location
              </span>
              <span className="font-medium text-[#2a2f39]">
                {selection.location ?? "Pending location data"}
              </span>
            </div>

            <div className="h-[138px] overflow-hidden rounded-[18px] border border-[#e6ebf4] bg-[radial-gradient(circle_at_top,#8cb9ff,transparent_32%),linear-gradient(135deg,#202d42,#4f6b95)] p-4 text-white">
              <div className="text-[13px] font-medium text-white/85">
                Site overview
              </div>
              <div className="mt-10 grid grid-cols-3 gap-3 text-[11px] uppercase tracking-[0.08em] text-white/75">
                <span className="rounded-full bg-white/10 px-3 py-2">North ridge</span>
                <span className="rounded-full bg-white/10 px-3 py-2">Processing</span>
                <span className="rounded-full bg-white/10 px-3 py-2">Field camp</span>
              </div>
            </div>

            <div className="space-y-4 text-[15px] text-[#4f5664]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#7b8392]">Monthly output range</span>
                <span className="font-medium text-[#2a2f39]">
                  {minerSummary?.activeTasks != null
                    ? `${minerSummary.activeTasks * 50} - ${minerSummary.activeTasks * 100} tons`
                    : "Pending review"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#7b8392]">Operation type</span>
                <span className="font-medium text-[#2a2f39]">
                  {reviewStatus === "under_review" ? "Open Pit" : "Artisanal"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#7b8392]">Miner status</span>
                <span className="rounded-[12px] border border-[#dce3ef] bg-[#f7f9fc] px-4 py-2 font-medium text-[#2a2f39]">
                  {minerStatus}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-[#e8ecf4] bg-white p-6 shadow-[0_28px_60px_-48px_rgba(16,30,61,0.35)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe0ff] bg-[#f5f9ff] px-4 py-2 text-[16px] font-medium text-[#2661d8]">
              <InfoCircleOutlined />
              Licensing & Regulatory Status
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <ReviewInfoTile
                icon={<CheckCircleOutlined />}
                label="Review status"
                value={minerStatus}
              />
              <ReviewInfoTile
                icon={<MailOutlined />}
                label="Assigned to"
                value={reviewDetail?.assigned_to || "Unassigned"}
              />
              <ReviewInfoTile
                icon={<CalendarOutlined />}
                label="Claimed at"
                value={formatReviewDateTime(reviewDetail?.claimed_at)}
              />
              <ReviewInfoTile
                icon={<ClockCircleOutlined />}
                label="Reviewed at"
                value={formatReviewDateTime(reviewDetail?.reviewed_at)}
              />
            </div>
          </section>

          <section className="rounded-[28px] border border-[#e8ecf4] bg-white p-6 shadow-[0_28px_60px_-48px_rgba(16,30,61,0.35)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dbe4f2] bg-[#f8fbff] px-4 py-2 text-[16px] font-medium text-[#2a3447]">
              <FolderOpenOutlined />
              Uploaded Documents
            </div>
            <div className="mt-6 space-y-4">
              {documents.length > 0 ? (
                documents.map((document) => (
                  <ReviewDocumentRow
                    key={document.id}
                    name={document.name}
                    type={document.type}
                    locked={false}
                    viewUrl={document.viewUrl}
                    downloadUrl={document.downloadUrl}
                  />
                ))
              ) : (
                <div className="rounded-[18px] border border-dashed border-[#dce3ef] bg-[#fafbfd] px-5 py-6 text-[14px] leading-6 text-[#7b8392]">
                  No document links were returned by the miner detail endpoint for
                  this miner yet.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#e8ecf4] bg-white p-6 shadow-[0_28px_60px_-48px_rgba(16,30,61,0.35)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d8efcf] bg-[#f2fff0] px-4 py-2 text-[16px] font-medium text-[#2e9d25]">
              <CheckCircleOutlined />
              Environmental & ESG Review
            </div>
            <div className="mt-6 space-y-6">
              {[
                "EIA Status",
                "Environmental Consultant",
                "Safety Measures",
                "Community Engagement",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#fafbfd] p-4">
                  <div className="text-[18px] font-medium text-[#2a2f39]">{item}</div>
                  <div className="mt-4 flex flex-wrap gap-3 text-[14px] text-[#5d6675]">
                    <span className="rounded-full border border-[#dce3ef] bg-white px-3 py-2">
                      Approved
                    </span>
                    <span className="rounded-full border border-[#dce3ef] bg-white px-3 py-2">
                      In progress
                    </span>
                    <span className="rounded-full border border-[#dce3ef] bg-white px-3 py-2">
                      Not initiated
                    </span>
                  </div>
                  <textarea
                    readOnly
                    value={reviewDetail?.notes?.trim() || "Type your message here"}
                    className="mt-4 h-24 w-full resize-none rounded-[16px] border border-[#dce3ef] bg-white px-4 py-3 text-[14px] text-[#5d6675] outline-none"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="space-y-3">
            <button
              type="button"
              className="inline-flex h-14 w-full items-center justify-center rounded-[16px] border border-[#dce3ef] bg-white px-5 text-[15px] font-medium text-[#2a3142]"
            >
              Request Additional Documents
            </button>
            <button
              type="button"
              className="inline-flex h-14 w-full items-center justify-center rounded-[16px] border border-[#dce3ef] bg-white px-5 text-[15px] font-medium text-[#2a3142]"
            >
              Schedule Verification Call
            </button>
            <button
              type="button"
              className="inline-flex h-14 w-full items-center justify-center rounded-[16px] border border-[#f3c2c4] bg-white px-5 text-[15px] font-medium text-[#ef2f32]"
            >
              Escalate (Red flag)
            </button>
          </div>

          <section className="rounded-[24px] border border-[#dff0f6] bg-[#eefbff] p-5">
            <div className="flex items-center gap-2 text-[16px] font-medium text-[#1c7b95]">
              <InfoCircleOutlined />
              Review Snapshot
            </div>

            <div className="mt-5 space-y-4 text-[15px] text-[#516070]">
              <div className="flex items-center justify-between gap-3">
                <span>Active tasks</span>
                <span className="font-semibold text-[#2a2f39]">
                  {isLoading ? "..." : formatWholeNumber(minerSummary?.activeTasks ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Average review time</span>
                <span className="font-semibold text-[#2a2f39]">
                  {isLoading ? "..." : `${minerSummary?.avgReviewTime ?? 0}m`}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Quality score</span>
                <span className="font-semibold text-[#2a2f39]">
                  {isLoading ? "..." : `${minerSummary?.qualityScore ?? 0}%`}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Queue load</span>
                <span className="font-semibold text-[#2a2f39]">
                  {isLoading ? "..." : formatWholeNumber(minerSummary?.queueLoad ?? 0)}
                </span>
              </div>
            </div>

            <div className="mt-5">
              <LinearProgress value={minerSummary?.qualityScore ?? 0} tone="green" />
            </div>
          </section>

          <section className="rounded-[24px] border border-[#e8ecf4] bg-white p-5">
            <div className="text-[16px] font-medium text-[#2a2f39]">Activity Log</div>
            <div className="mt-5 space-y-4">
              {activityItems.length > 0 ? (
                activityItems.map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f6fb] text-[#52607a]">
                      <CalendarOutlined />
                    </span>
                    <div>
                      <div className="text-[15px] font-medium text-[#2a2f39]">{item.label}</div>
                      <div className="mt-1 text-[13px] text-[#8a92a1]">{item.meta}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[14px] text-[#8a92a1]">
                  Activity will appear here once the review progresses.
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default function ComplianceDashboardPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const personaParam = searchParams.get("persona");
  const complianceViewParam = searchParams.get("view");
  const persona: DashboardPersona =
    personaParam === "compliance" ? "compliance" : "admin";
  const complianceView: ComplianceView =
    persona === "compliance" && complianceViewParam === "reviews"
      ? "reviews"
      : "dashboard";
  const [now, setNow] = useState(() => Date.now());
  const [selectedReview, setSelectedReview] =
    useState<ComplianceReviewSelection | null>(null);
  const [openedMinerDetail, setOpenedMinerDetail] =
    useState<ComplianceMinerDetailState | null>(null);
  const [claimConflictTask, setClaimConflictTask] =
    useState<ComplianceReviewSelection | null>(null);
  const [claimConflictLoggedAt, setClaimConflictLoggedAt] = useState<Date | null>(
    null,
  );
  const hasAccessToken =
    typeof window !== "undefined" &&
    Boolean(window.sessionStorage.getItem("accessToken"));

  useEffect(() => {
    if (persona !== "compliance") {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => window.clearInterval(timer);
  }, [persona]);

  const adminCardsQ = useQuery({
    queryKey: ["complianceReviewDashboardCards"],
    queryFn: getComplianceReviewDashboardCards,
    initialData: DEFAULT_COMPLIANCE_REVIEW_DASHBOARD_CARDS,
    enabled: persona === "admin" && hasAccessToken,
    retry: false,
  });
  const adminReviewsQ = useQuery({
    queryKey: ["complianceReviews", { page: 1 }],
    queryFn: () => getComplianceReviews({ page: 1, per_page: 10 }),
    initialData: DEFAULT_COMPLIANCE_REVIEWS,
    enabled:
      (persona === "admin" ||
        (persona === "compliance" && complianceView === "reviews")) &&
      hasAccessToken,
    retry: false,
  });
  const complianceSummaryQ = useQuery({
    queryKey: ["complianceDashboardSummary"],
    queryFn: getComplianceDashboardSummary,
    initialData: DEFAULT_COMPLIANCE_DASHBOARD_SUMMARY,
    enabled: persona === "compliance" && hasAccessToken,
    retry: false,
  });
  const complianceQueueQ = useQuery({
    queryKey: ["complianceReviewQueue", { page: 1 }],
    queryFn: () => getComplianceReviewQueue({ page: 1, per_page: 10 }),
    initialData: DEFAULT_COMPLIANCE_REVIEW_QUEUE,
    enabled: persona === "compliance" && hasAccessToken,
    retry: false,
  });
  const complianceMyTasksQ = useQuery({
    queryKey: ["complianceMyTasks", { page: 1 }],
    queryFn: () => getComplianceMyTasks({ page: 1, per_page: 10 }),
    initialData: DEFAULT_COMPLIANCE_MY_TASKS,
    enabled: persona === "compliance" && hasAccessToken,
    retry: false,
  });
  const selectedReviewDetailQ = useQuery({
    queryKey: ["complianceReviewDetail", selectedReview?.reviewId],
    queryFn: () => getComplianceReviewDetail(selectedReview!.reviewId),
    enabled:
      persona === "compliance" &&
      Boolean(selectedReview?.reviewId) &&
      hasAccessToken,
    retry: false,
  });
  const claimReviewMutation = useMutation({
    mutationFn: claimComplianceReview,
    onSuccess: async (response, variables) => {
      showToast(
        response.message?.trim() || "Review claimed successfully.",
        "success",
      );
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["complianceReviewQueue"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["complianceDashboardSummary"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["complianceReviews"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["complianceMyTasks"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["complianceReviewDetail", variables.pathId],
        }),
      ]);

      await selectedReviewDetailQ.refetch();
      setSelectedReview((current) =>
        current && current.reviewId === variables.pathId
          ? { ...current, claimRequired: false }
          : current,
      );
    },
    onError: (error: unknown) => {
      showToast(
        getApiErrorMessage(error, "Unable to claim this review right now."),
        "error",
      );
    },
  });
  const complianceMinerDetailQ = useQuery({
    queryKey: ["complianceMinerDetail", openedMinerDetail?.selection.minerId],
    queryFn: () =>
      getComplianceMinerDetail(openedMinerDetail!.selection.minerId!),
    enabled:
      persona === "compliance" &&
      Boolean(openedMinerDetail?.selection.minerId) &&
      hasAccessToken,
    retry: false,
  });
  const reviewWorkflowMutation = useMutation({
    mutationFn: submitComplianceReviewWorkflow,
    onSuccess: async (response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["complianceReviewQueue"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["complianceDashboardSummary"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["complianceReviews"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["complianceMyTasks"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["complianceReviewDetail", variables.reviewId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["complianceMinerDetail"],
        }),
      ]);

      if (variables.action === "reject") {
        showToast(getWorkflowMessage(response, "Task passed successfully."), "success");
        setSelectedReview(null);
        return;
      }

      if (variables.action === "approve") {
        showToast(
          getWorkflowMessage(response, "Review task accepted successfully."),
          "success",
        );
        await selectedReviewDetailQ.refetch();
        return;
      }

      const status = getWorkflowStatus(response);

      if (status === "claimed") {
        setClaimConflictTask(selectedReview);
        setClaimConflictLoggedAt(new Date());
        setSelectedReview(null);
        return;
      }

      if (selectedReview?.minerId) {
        showToast(getWorkflowMessage(response, "Review started successfully."), "success");
        setOpenedMinerDetail({
          selection: selectedReview,
          reviewDetail: selectedReviewDetailQ.data,
        });
        setSelectedReview(null);
        return;
      }

      showToast("Miner detail is unavailable for this review.", "error");
    },
    onError: (error: unknown) => {
      const message = getApiErrorMessage(
        error,
        "Unable to update this review right now.",
      );

      if (
        reviewWorkflowMutation.variables?.action === "start_review" &&
        message.toLowerCase().includes("task must be claim first")
      ) {
        setSelectedReview((current) =>
          current ? { ...current, claimRequired: true } : current,
        );
      }

      showToast(
        message,
        "error",
      );
    },
  });
  const adminMetrics = mapAdminCardMetrics(
    adminCardsQ.data?.data ?? DEFAULT_COMPLIANCE_REVIEW_DASHBOARD_CARDS.data,
  );
  const adminRows = mapAdminReviewRows(
    adminReviewsQ.data?.data?.results ?? DEFAULT_COMPLIANCE_REVIEWS.data.results,
  );
  const complianceSummary =
    complianceSummaryQ.data?.data ?? DEFAULT_COMPLIANCE_DASHBOARD_SUMMARY.data;
  const complianceAlert = mapComplianceAlert(complianceSummary.latest_alert);
  const complianceMetrics = mapComplianceMetrics(complianceSummary);
  const complianceQueueRows = mapComplianceQueueRows(
    complianceQueueQ.data?.data?.results ?? DEFAULT_COMPLIANCE_REVIEW_QUEUE.data.results,
    now,
  );
  const complianceQueuePreviewRows = complianceQueueRows.slice(0, 5);
  const complianceQueueCount =
    complianceQueueQ.data?.data?.count ?? DEFAULT_COMPLIANCE_REVIEW_QUEUE.data.count;
  const showViewFullQueue = complianceQueueCount > 5;
  const complianceActiveTaskCards = mapComplianceActiveTaskCards(
    complianceMyTasksQ.data?.data?.results ?? DEFAULT_COMPLIANCE_MY_TASKS.data.results,
  );
  const complianceReviewRows = mapAdminReviewRows(
    adminReviewsQ.data?.data?.results ?? DEFAULT_COMPLIANCE_REVIEWS.data.results,
  );
  const reviewLookup = new Map<string, ComplianceReviewItem>();
  for (const item of [
    ...(complianceQueueQ.data?.data?.results ??
      DEFAULT_COMPLIANCE_REVIEW_QUEUE.data.results),
    ...(complianceMyTasksQ.data?.data?.results ??
      DEFAULT_COMPLIANCE_MY_TASKS.data.results),
    ...(adminReviewsQ.data?.data?.results ?? DEFAULT_COMPLIANCE_REVIEWS.data.results),
  ]) {
    if (!reviewLookup.has(item.id)) {
      reviewLookup.set(item.id, item);
    }
  }

  const activeReviewId = selectedReview?.reviewId;
  const activeReviewAction =
    reviewWorkflowMutation.isPending &&
    reviewWorkflowMutation.variables.reviewId === selectedReview?.reviewId
      ? reviewWorkflowMutation.variables.action
      : claimReviewMutation.isPending &&
          claimReviewMutation.variables.pathId === selectedReview?.reviewId
        ? "claim"
      : undefined;

  const openReviewPanel = (selection: ComplianceReviewSelection | null) => {
    if (!selection) {
      return;
    }

    if (!hasAccessToken) {
      showToast(
        "Your browser session is not authenticated. Log in again.",
        "error",
      );
      return;
    }

    setOpenedMinerDetail(null);
    setClaimConflictTask(null);
    setClaimConflictLoggedAt(null);
    setSelectedReview(selection);
  };

  const openReviewById = (reviewId: string) => {
    const matchedItem = reviewLookup.get(reviewId);

    openReviewPanel(
      matchedItem
        ? buildSelectionFromItem(matchedItem)
        : {
            reviewId,
            minerCode: reviewId.slice(0, 8).toUpperCase(),
          },
    );
  };

  const openAlertReview = () => {
    openReviewPanel(
      buildSelectionFromAlert(
        complianceAlert,
        complianceAlert.reviewId
          ? reviewLookup.get(complianceAlert.reviewId)
          : undefined,
      ),
    );
  };

  const handleReviewAction = (action: ReviewActionType) => {
    if (!selectedReview) {
      return;
    }

    if (action === "open_detail") {
      if (!selectedReview.minerId) {
        showToast("Miner detail is unavailable for this review.", "error");
        return;
      }

      setOpenedMinerDetail({
        selection: selectedReview,
        reviewDetail: selectedReviewDetailQ.data,
      });
      setSelectedReview(null);
      return;
    }

    if (action === "claim") {
      claimReviewMutation.mutate({
        pathId: selectedReview.reviewId,
        bodyId: selectedReview.reviewId,
      });
      return;
    }

    reviewWorkflowMutation.mutate({
      reviewId: selectedReview.reviewId,
      action,
      ...(action === "reject" ? { reason: "Not Okay" } : {}),
    });
  };

  const showMinerDetailView = Boolean(openedMinerDetail);

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#202534]">
      <div className="flex min-h-screen">
        <DashboardSidebar persona={persona} complianceView={complianceView} />

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopBar persona={persona} />

          <main className="flex-1 px-4 py-6 sm:px-6 xl:px-8">
            <div className="mx-auto max-w-[1600px] space-y-6">
              {showMinerDetailView && openedMinerDetail ? (
                <ComplianceMinerDetailView
                  selection={openedMinerDetail.selection}
                  reviewDetail={openedMinerDetail.reviewDetail}
                  minerDetail={complianceMinerDetailQ.data}
                  isLoading={complianceMinerDetailQ.isLoading}
                  onBack={() => setOpenedMinerDetail(null)}
                />
              ) : (
                <>
                  <PageHero persona={persona} complianceView={complianceView} />
                  {persona === "admin" ? (
                    <AdminDashboardView metrics={adminMetrics} rows={adminRows} />
                  ) : complianceView === "reviews" ? (
                    <ComplianceReviewsView rows={complianceReviewRows} />
                  ) : (
                    <ComplianceDashboardView
                      alert={complianceAlert}
                      metrics={complianceMetrics}
                      queueRows={complianceQueuePreviewRows}
                      activeTaskCards={complianceActiveTaskCards}
                      showViewFullQueue={showViewFullQueue}
                      activeReviewId={activeReviewId}
                      onOpenQueueReview={openReviewById}
                      onOpenAlertReview={openAlertReview}
                      onOpenActiveTask={openReviewById}
                    />
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {persona === "compliance" && selectedReview ? (
        <ComplianceReviewDrawer
          selection={selectedReview}
          detail={selectedReviewDetailQ.data}
          isLoading={selectedReviewDetailQ.isLoading}
          now={now}
          activeAction={activeReviewAction}
          onClose={() => setSelectedReview(null)}
          onAction={handleReviewAction}
        />
      ) : null}

      {claimConflictTask && claimConflictLoggedAt ? (
        <ComplianceClaimConflictModal
          minerCode={claimConflictTask.minerCode}
          loggedAt={claimConflictLoggedAt}
          onBack={() => {
            setClaimConflictTask(null);
            setClaimConflictLoggedAt(null);
          }}
        />
      ) : null}
    </div>
  );
}
