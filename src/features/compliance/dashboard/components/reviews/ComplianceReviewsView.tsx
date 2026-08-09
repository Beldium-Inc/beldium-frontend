"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  SearchOutlined,
  DownOutlined,
  CalendarOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  PrinterOutlined,
  InfoCircleOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  HistoryOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  LeftOutlined,
  ArrowUpOutlined,
  MoreOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { AdminReviewRow } from "@/src/features/compliance/dashboard/types";
import { classNames, primaryActionStyle, statusStyles } from "@/src/features/compliance/dashboard/lib/style";
import { showToast } from "@/src/store/toast.store";
import {
  getComplianceMinerDetail,
  verifyMinerLicense,
  verifyMinerDocument,
  submitComplianceReviewWorkflow,
  createComplianceSupportRequest,
} from "@/src/features/compliance/dashboard/api";
import RequestComplianceDocumentModal from "@/src/features/compliance/dashboard/components/reviews/RequestComplianceDocumentModal";
import { getApiErrorMessage } from "@/src/features/compliance/dashboard/lib/documents";
import {
  type CaseReviewTab,
  CASE_REVIEW_TABS,
} from "@/src/features/compliance/dashboard/components/reviews/constants";
import {
  CASE_OPERATIONAL_ITEMS,
  CASE_EXPORT_ITEMS,
  CaseChecklistCard,
} from "@/src/features/compliance/dashboard/components/miner-detail/ComplianceMinerDetailView";

type MinerLicenseRecord = {
  id: string;
  license_type?: string | null;
  license_number?: string | null;
  issuing_authority?: string | null;
  expiry_date?: string | null;
  document?: string | null;
  verification_status?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  notes?: string | null;
};

type MinerDocumentRecord = {
  id: string;
  document_type?: string | null;
  file?: string | null;
  issued_date?: string | null;
  status?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  notes?: string | null;
};

type MinerESGReviewRecord = {
  id: string;
  status?: string | null;
  category?: string | null;
  notes?: string | null;
  reviewed_by?: string | null;
  updated_at?: string | null;
};

type ActivityLogRecord = {
  id: string;
  action?: string | null;
  performed_by?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
};

type MinerProfileRecord = {
  country?: string | null;
  state_of_operation?: string | null;
  local_government_area?: string | null;
  mineral_type?: string | null;
  mining_method?: string | null;
  business_role?: string | null;
  license_number?: string | null;
  issuing_authority?: string | null;
  estimated_monthly_output?: string | null;
};

type MinerDetailData = {
  miner?: MinerProfileRecord | null;
  licenses?: MinerLicenseRecord[] | null;
  documents?: MinerDocumentRecord[] | null;
  esg_reviews?: MinerESGReviewRecord[] | null;
  activity_logs?: ActivityLogRecord[] | null;
};

function formatDate(value?: string | null) {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(value?: string | null) {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function licensingToneClass(status?: string | null) {
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "verified" || normalized === "approved") {
    return "border border-[#caebd1] bg-[#ecfaf0] text-[#1ea43b]";
  }
  if (normalized === "expired" || normalized === "rejected") {
    return "border border-[#f6d2d3] bg-[#fff1f2] text-[#ef2f32]";
  }
  return "border border-[#f6e3bf] bg-[#fff4df] text-[#df8b19]";
}

function isVerifiedStatus(status?: string | null) {
  return (status ?? "").toLowerCase() === "verified";
}

function daysUntil(value?: string | null) {
  if (!value) return null;
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((startOfTarget.getTime() - startOfNow.getTime()) / (1000 * 60 * 60 * 24));
}

function relativeExpiryLabel(days: number | null) {
  if (days === null) return null;
  if (days < 0) return `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`;
  if (days === 0) return "Expires today";
  if (days < 60) return `in ${days} Day${days === 1 ? "" : "s"}`;
  const months = Math.round(days / 30);
  return `in ${months} month${months === 1 ? "" : "s"}`;
}

function licenseValidityStatus(days: number | null) {
  if (days === null) return { label: "Unknown", tone: "slate" as const };
  if (days < 0) return { label: "Expired", tone: "red" as const };
  if (days <= 60) return { label: "Expires soon", tone: "amber" as const };
  return { label: "Valid", tone: "green" as const };
}

function getInitials(value: string, fallback = "NA") {
  const trimmed = (value || "").trim();
  if (!trimmed || trimmed.toLowerCase() === "unassigned") return fallback;
  const namePart = trimmed.includes("@") ? trimmed.split("@")[0] : trimmed;
  const segments = namePart.split(/[.\s_-]+/).filter(Boolean);
  const initials = segments
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? "")
    .join("");
  return initials || fallback;
}

function ScoreRing({
  value,
  size = 88,
  strokeWidth = 8,
  trackColor = "#eef1f6",
  color = "#14244a",
  caption,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  color?: string;
  caption?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[16px] font-bold text-[#2a2f39]">{clamped}%</span>
        {caption ? <span className="text-[9px] text-[#8a92a1]">{caption}</span> : null}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 appearance-none rounded-[8px] border border-[#e8ecf4] bg-white pl-3 pr-8 text-[12px] font-medium text-[#5d6675] outline-none"
      >
        <option value="all">{label}: All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <DownOutlined className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-[#a0a6b3]" />
    </div>
  );
}

function RowActionsMenu({
  open,
  onToggle,
  onOpenCase,
  onCopyLink,
}: {
  open: boolean;
  onToggle: () => void;
  onOpenCase: () => void;
  onCopyLink: () => void;
}) {
  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-8 w-8 items-center justify-center rounded-full text-[#7b8392] hover:bg-[#f4f6fb]"
      >
        <MoreOutlined />
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-[10px] border border-[#e8ecf4] bg-white shadow-[0_16px_40px_-16px_rgba(16,30,61,0.35)]">
            <button
              type="button"
              onClick={onOpenCase}
              className="block w-full px-4 py-2.5 text-left text-[12px] font-medium text-[#2b3140] hover:bg-[#f7f9fc]"
            >
              Open case
            </button>
            <button
              type="button"
              onClick={onCopyLink}
              className="block w-full px-4 py-2.5 text-left text-[12px] font-medium text-[#2b3140] hover:bg-[#f7f9fc]"
            >
              Copy case link
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function ComplianceReviewsView({
  rows,
}: {
  rows: AdminReviewRow[];
}) {
  const [screen, setScreen] = useState<"list" | "detail">("list");
  const [selectedRow, setSelectedRow] = useState<AdminReviewRow | null>(null);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [reviewerFilter, setReviewerFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openMenuRowId, setOpenMenuRowId] = useState<string | null>(null);
  const [caseIntelOpen, setCaseIntelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<CaseReviewTab>("overview");
  const [docSearch, setDocSearch] = useState("");
  const [docViewMode, setDocViewMode] = useState<"list" | "grid">("list");
  const [licenseStatusFilter, setLicenseStatusFilter] = useState<"all" | "verified" | "issues_found" | "rejected">("all");
  const queryClient = useQueryClient();

  const riskOptions = Array.from(new Set(rows.map((r) => r.riskLevel.label))).sort();
  const reviewerOptions = Array.from(new Set(rows.map((r) => r.reviewer))).sort();
  const statusOptions = Array.from(new Set(rows.map((r) => r.reviewStatus.label))).sort();

  const filteredRows = rows.filter((r) => {
    const matchesSearch = search.trim()
      ? r.company.toLowerCase().includes(search.toLowerCase()) ||
        r.minerId.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesRisk = riskFilter === "all" || r.riskLevel.label === riskFilter;
    const matchesReviewer = reviewerFilter === "all" || r.reviewer === reviewerFilter;
    const matchesStatus = statusFilter === "all" || r.reviewStatus.label === statusFilter;
    return matchesSearch && matchesRisk && matchesReviewer && matchesStatus;
  });

  const pendingReviewsCount = rows.filter((r) => r.reviewStatus.label === "Pending").length;
  const highRiskCount = rows.filter((r) => r.riskLevel.label === "High").length;
  const averageCompletion = rows.length
    ? Math.round(rows.reduce((sum, r) => sum + r.complianceScore, 0) / rows.length)
    : 0;

  const handleSelect = (row: AdminReviewRow) => {
    setSelectedRow(row);
    setActiveTab("overview");
    setScreen("detail");
    setOpenMenuRowId(null);
  };

  const handleBackToList = () => {
    setScreen("list");
  };

  const minerDetailQ = useQuery({
    queryKey: ["reviewsMinerDetail", selectedRow?.minerUuid],
    queryFn: () => getComplianceMinerDetail(selectedRow!.minerUuid),
    enabled: Boolean(selectedRow?.minerUuid),
  });

  const minerDetail = minerDetailQ.data?.data as MinerDetailData | undefined;
  const miner = minerDetail?.miner ?? null;
  const licenses = minerDetail?.licenses ?? [];
  const documentRecords = minerDetail?.documents ?? [];
  const esgReviews = minerDetail?.esg_reviews ?? [];
  const activityLogs = minerDetail?.activity_logs ?? [];

  const verifyLicenseMutation = useMutation({
    mutationFn: verifyMinerLicense,
    onSuccess: () => {
      showToast("License verification updated.", "success");
      queryClient.invalidateQueries({ queryKey: ["reviewsMinerDetail", selectedRow?.minerUuid] });
    },
    onError: (error) => {
      showToast(getApiErrorMessage(error, "Could not update license verification."), "error");
    },
  });

  const verifyDocumentMutation = useMutation({
    mutationFn: verifyMinerDocument,
    onSuccess: () => {
      showToast("Document verification updated.", "success");
      queryClient.invalidateQueries({ queryKey: ["reviewsMinerDetail", selectedRow?.minerUuid] });
    },
    onError: (error) => {
      showToast(getApiErrorMessage(error, "Could not update document verification."), "error");
    },
  });

  const [isRequestDocsOpen, setIsRequestDocsOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState<string | null>(null);

  const invalidateReviewLists = () => {
    queryClient.invalidateQueries({ queryKey: ["complianceReviews"] });
    queryClient.invalidateQueries({ queryKey: ["complianceReviewQueue"] });
    queryClient.invalidateQueries({ queryKey: ["reviewsMinerDetail", selectedRow?.minerUuid] });
  };

  const reviewWorkflowMutation = useMutation({
    mutationFn: submitComplianceReviewWorkflow,
    onSuccess: (_data, variables) => {
      showToast(
        variables.action === "approve"
          ? "Compliance approved."
          : variables.action === "reject"
            ? "Application rejected."
            : "Review updated.",
        "success",
      );
      invalidateReviewLists();
    },
    onError: (error) => {
      showToast(getApiErrorMessage(error, "Could not update this review."), "error");
    },
  });

  const supportRequestMutation = useMutation({
    mutationFn: createComplianceSupportRequest,
    onSuccess: () => {
      invalidateReviewLists();
    },
    onError: (error) => {
      showToast(getApiErrorMessage(error, "Could not send the document request."), "error");
    },
  });

  const handleExport = () => {
    if (!selectedRow) return;
    const lines = [
      `Case ${selectedRow.minerId} - ${selectedRow.company}`,
      `Risk Level: ${selectedRow.riskLevel.label}`,
      `Compliance Score: ${selectedRow.complianceScore}%`,
      `Reviewer: ${selectedRow.reviewer}`,
      "",
      "Licenses:",
      ...licenses.map((l) => `- ${l.license_type || "License"} (${l.license_number || "N/A"}): ${l.verification_status || "Pending Review"}`),
      "",
      "Documents:",
      ...documentRecords.map((d) => `- ${d.document_type || "Document"}: ${d.status || "Unverified"}`),
      "",
      "ESG Reviews:",
      ...esgReviews.map((e) => `- ${e.category || "ESG"}: ${e.status || "Not initiated"}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedRow.minerId}-compliance-case.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async (row?: AdminReviewRow) => {
    const target = row ?? selectedRow;
    if (!target) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast(`Link to the Reviews page copied. Case ${target.minerId} is selected in this session only.`, "success");
    } catch {
      showToast("Could not copy the link to your clipboard.", "error");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Real, per-selected-case derived figures reused across the detail screen.
  const unverifiedLicensesCount = licenses.filter((l) => !isVerifiedStatus(l.verification_status)).length;
  const unverifiedDocumentsCount = documentRecords.filter((d) => !isVerifiedStatus(d.status)).length;
  const openIssuesCount = unverifiedLicensesCount + unverifiedDocumentsCount;
  const verifiedDocumentsCount = documentRecords.filter((d) => isVerifiedStatus(d.status)).length;
  const verifiedLicensesCount = licenses.filter((l) => isVerifiedStatus(l.verification_status)).length;
  const requiredChecksTotal = licenses.length + documentRecords.length;

  const licensingProgress = licenses.length ? Math.round((verifiedLicensesCount / licenses.length) * 100) : 0;
  const documentsProgress = documentRecords.length ? Math.round((verifiedDocumentsCount / documentRecords.length) * 100) : 0;
  const esgProgress = esgReviews.length
    ? Math.round((esgReviews.filter((e) => (e.status ?? "").toLowerCase() === "approved").length / esgReviews.length) * 100)
    : 0;
  const trackedProgressValues = [
    licenses.length ? licensingProgress : null,
    documentRecords.length ? documentsProgress : null,
    esgReviews.length ? esgProgress : null,
  ].filter((v): v is number => v !== null);
  const estimatedCompletion = trackedProgressValues.length
    ? Math.round(trackedProgressValues.reduce((sum, v) => sum + v, 0) / trackedProgressValues.length)
    : 0;

  const daysOpen = selectedRow?.createdAt
    ? Math.max(0, -1 * (daysUntil(selectedRow.createdAt) ?? 0))
    : null;

  const expiringLicenseAlerts = licenses
    .map((l) => {
      const days = daysUntil(l.expiry_date);
      return days !== null && days >= 0 && days <= 30
        ? { id: `license-${l.id}`, text: `${l.license_type || "License"} expires in ${days} Day${days === 1 ? "" : "s"}` }
        : null;
    })
    .filter((a): a is { id: string; text: string } => a !== null);

  const unverifiedDocTypes = documentRecords
    .filter((d) => !isVerifiedStatus(d.status))
    .map((d) => d.document_type || "Document");

  const caseAlerts = [
    ...expiringLicenseAlerts.map((a) => ({ ...a, tone: "amber" as const })),
    ...(unverifiedDocumentsCount > 0
      ? [
          {
            id: "unverified-documents",
            tone: "red" as const,
            text: `${unverifiedDocumentsCount} document${unverifiedDocumentsCount === 1 ? "" : "s"} require verification${
              unverifiedDocTypes.length ? ` (${unverifiedDocTypes.slice(0, 3).join(", ")}${unverifiedDocTypes.length > 3 ? "..." : ""})` : ""
            }`,
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-5">
      {screen === "list" ? (
        <div className="flex flex-col gap-5">
          <h1 className="text-[22px] font-bold text-[#2a2f39]">Reviews</h1>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-4">
              <div className="flex items-start justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#eef2fb] text-[16px] text-[#14244a]">
                  <ClockCircleOutlined />
                </span>
                <ArrowUpOutlined className="text-[12px] text-[#c7ccd6]" />
              </div>
              <div className="mt-3 text-[12px] font-medium text-[#8a92a1]">Pending reviews</div>
              <div className="mt-1 text-[24px] font-bold text-[#2a2f39]">{pendingReviewsCount}</div>
              <div className="mt-1 text-[11px] text-[#a0a7b5]">Awaiting review</div>
            </div>

            <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-4">
              <div className="flex items-start justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#fff0f1] text-[16px] text-[#ef2f32]">
                  <WarningOutlined />
                </span>
                <ArrowUpOutlined className="text-[12px] text-[#c7ccd6]" />
              </div>
              <div className="mt-3 text-[12px] font-medium text-[#8a92a1]">High Risk</div>
              <div className="mt-1 text-[24px] font-bold text-[#2a2f39]">{highRiskCount}</div>
              <div className="mt-1 text-[11px] text-[#a0a7b5]">Require immediate attention</div>
            </div>

            <div
              className="rounded-[16px] border border-[#e8ecf4] bg-white p-4"
              title="Illustrative — no due-date field exists on reviews yet"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#eafaf0] text-[16px] text-[#1ea43b]">
                  <CalendarOutlined />
                </span>
              </div>
              <div className="mt-3 text-[12px] font-medium text-[#8a92a1]">Due Today</div>
              <div className="mt-1 text-[24px] font-bold text-[#2a2f39]">2</div>
              <div className="mt-1 text-[11px] text-[#a0a7b5]">Review due today</div>
            </div>

            <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-4">
              <div className="flex items-center gap-3">
                <ScoreRing value={averageCompletion} size={56} strokeWidth={6} />
                <div>
                  <div className="text-[12px] font-medium text-[#8a92a1]">Average Completion</div>
                  <div className="mt-1 text-[20px] font-bold text-[#2a2f39]">{averageCompletion}%</div>
                </div>
              </div>
              <div
                className="mt-2 text-[11px] font-medium text-[#1ea43b]"
                title="Illustrative — no historical trend data exists yet"
              >
                &#8599; +15% last month
              </div>
            </div>
          </div>

          <div className="rounded-[20px] border border-[#e8ecf4] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#eef2fb] text-[14px] text-[#14244a]">
                  <TeamOutlined />
                </span>
                <span className="text-[15px] font-semibold text-[#2a2f39]">Assigned Reviews</span>
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#14244a] px-1.5 text-[11px] font-semibold text-white">
                  {filteredRows.length}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <SearchOutlined className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#a0a6b3]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search company or case..."
                    className="h-9 w-[220px] rounded-[8px] border border-[#e8ecf4] bg-[#fafbfe] pl-8 pr-3 text-[12px] text-[#2d3441] outline-none placeholder:text-[#a0a6b3]"
                  />
                </div>
                <FilterSelect label="Risk" value={riskFilter} options={riskOptions} onChange={setRiskFilter} />
                <FilterSelect label="Reviewer" value={reviewerFilter} options={reviewerOptions} onChange={setReviewerFilter} />
                <FilterSelect label="Status" value={statusFilter} options={statusOptions} onChange={setStatusFilter} />
              </div>
            </div>

            <div className="mt-4 overflow-x-auto rounded-[14px] border border-[#e8ecf4]">
              <table className="w-full min-w-[1080px] text-[13px]">
                <thead>
                  <tr className="border-b border-[#edf1f7] bg-[#fafbfd] text-left text-[#8a92a1]">
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Industry</th>
                    <th className="px-4 py-3 font-medium">Risk</th>
                    <th className="px-4 py-3 font-medium">Progress</th>
                    <th className="px-4 py-3 font-medium">Reviewer</th>
                    <th className="px-4 py-3 font-medium">Due Date</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Last Action</th>
                    <th className="px-2 py-3 font-medium text-right"> </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-[13px] text-[#8a92a1]">
                        No reviews match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => {
                      const riskStyle = statusStyles[row.riskLevel.tone];
                      const statusStyle = statusStyles[row.reviewStatus.tone];
                      const progressColor =
                        row.complianceScore >= 85 ? "#1ea43b" : row.complianceScore >= 50 ? "#df8b19" : "#ef2f32";

                      return (
                        <tr
                          key={row.id}
                          className="cursor-pointer border-b border-[#f2f4f8] last:border-b-0 hover:bg-[#fafbfe]"
                          onClick={() => handleSelect(row)}
                        >
                          <td className="px-4 py-3">
                            <div className="font-semibold text-[#2a2f39]">{row.company}</div>
                            <div className="mt-0.5 text-[11px] text-[#8a92a1]">Case {row.minerId}</div>
                          </td>
                          <td
                            className="px-4 py-3 text-[#5d6675]"
                            title="Illustrative — no industry/sector field exists on reviews yet"
                          >
                            Mining
                          </td>
                          <td className="px-4 py-3">
                            <span className={classNames("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", riskStyle.container)}>
                              {row.riskLevel.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#e8ecf2]">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${row.complianceScore}%`, backgroundColor: progressColor }}
                                />
                              </div>
                              <span className="text-[11px] font-medium text-[#5d6675]">{row.complianceScore}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eef2fb] text-[10px] font-semibold text-[#14244a]">
                                {getInitials(row.reviewer)}
                              </span>
                              <span className="max-w-[160px] truncate text-[12px] text-[#5d6675]">{row.reviewer}</span>
                            </div>
                          </td>
                          <td
                            className="px-4 py-3 text-[12px] text-[#a0a7b5]"
                            title="Illustrative — no due-date field exists on reviews yet"
                          >
                            14 Jan 2026
                          </td>
                          <td className="px-4 py-3">
                            <span className={classNames("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", statusStyle.container)}>
                              <span className={classNames("h-1.5 w-1.5 rounded-full", statusStyle.dot)} />
                              {row.reviewStatus.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[12px] text-[#5d6675]">{row.lastActionDate}</td>
                          <td className="px-2 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <RowActionsMenu
                              open={openMenuRowId === row.id}
                              onToggle={() => setOpenMenuRowId((prev) => (prev === row.id ? null : row.id))}
                              onOpenCase={() => handleSelect(row)}
                              onCopyLink={() => {
                                setOpenMenuRowId(null);
                                handleShare(row);
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : selectedRow ? (
        <div className="flex flex-col gap-5">
          <button
            type="button"
            onClick={handleBackToList}
            className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-[#5d6675] hover:text-[#2a2f39]"
          >
            <LeftOutlined className="text-[11px]" /> Back to Assigned Reviews
          </button>

          <div className="rounded-[20px] border border-[#e8ecf4] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1f7] px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#14244a] text-[15px] font-semibold text-white">
                  {getInitials(selectedRow.company, selectedRow.company.slice(0, 2).toUpperCase())}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[19px] font-bold text-[#2a2f39]">{selectedRow.company}</span>
                    <span
                      className="rounded-full border border-[#d7e3fb] bg-[#eef2fb] px-2.5 py-0.5 text-[11px] font-medium text-[#2661d8]"
                      title="Illustrative — no industry/sector field exists on the backend yet"
                    >
                      Mining
                    </span>
                    <span className={classNames("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", statusStyles[selectedRow.riskLevel.tone].container)}>
                      {selectedRow.riskLevel.label} Risk
                    </span>
                  </div>
                  <div className="mt-1 text-[12px] text-[#8a92a1]">
                    Case ID: {selectedRow.minerId} &middot; Submitted: {formatDate(selectedRow.createdAt)} &middot; Assigned: {selectedRow.reviewer}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleExport} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#e5e9f1] bg-white px-3 text-[12px] font-medium text-[#2b3140] hover:bg-[#f7f9fc]">
                  <DownloadOutlined /> Export
                </button>
                <button type="button" onClick={() => handleShare()} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#e5e9f1] bg-white px-3 text-[12px] font-medium text-[#2b3140] hover:bg-[#f7f9fc]">
                  <ShareAltOutlined /> Share
                </button>
                <button type="button" onClick={handlePrint} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#e5e9f1] bg-white px-3 text-[12px] font-medium text-[#2b3140] hover:bg-[#f7f9fc]">
                  <PrinterOutlined /> Print
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-0 overflow-x-auto border-b border-[#edf1f7] px-6">
              {CASE_REVIEW_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={classNames("whitespace-nowrap border-b-2 px-4 py-3 text-[13px] font-medium transition-colors",
                    activeTab === tab.key ? "border-[#14244a] text-[#14244a]" : "border-transparent text-[#8a92a1] hover:text-[#2a2f39]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="p-5">
              {activeTab === "overview" ? (
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-4">
                    <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5">
                      <div className="text-[14px] font-semibold text-[#2a2f39]">Case Summary</div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2 text-[13px]">
                        {[
                          { label: "Company Name", value: selectedRow.company },
                          { label: "State", value: miner?.state_of_operation || "Not set" },
                          { label: "Registration Number", value: "RC/2018/045678", placeholder: true },
                          { label: "Assigned Institution", value: "NGMC", placeholder: true },
                          { label: "Industry", value: "Mining", placeholder: true },
                          { label: "Reviewer", value: selectedRow.reviewer },
                          { label: "Operational Capacity", value: miner?.estimated_monthly_output || "Not set" },
                        ].map((item) => (
                          <div
                            key={item.label}
                            title={item.placeholder ? "Illustrative — no matching field exists on the backend yet" : undefined}
                          >
                            <div className="text-[#8a92a1]">{item.label}</div>
                            <div className="mt-0.5 font-medium text-[#2a2f39]">{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5">
                      <div className="text-[14px] font-semibold text-[#2a2f39]">Compliance Overview</div>
                      <div className="mt-4 flex flex-wrap items-center gap-6">
                        <ScoreRing value={selectedRow.complianceScore} caption="Score" />
                        <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
                          <div>
                            <div className="text-[11px] text-[#8a92a1]">Risk Level</div>
                            <div className="mt-1 text-[15px] font-semibold text-[#2a2f39]">{selectedRow.riskLevel.label}</div>
                          </div>
                          <div>
                            <div className="text-[11px] text-[#8a92a1]">Open Issues</div>
                            <div className="mt-1 text-[15px] font-semibold text-[#2a2f39]">{openIssuesCount}</div>
                          </div>
                          <div>
                            <div className="text-[11px] text-[#8a92a1]">Documents Verified</div>
                            <div className="mt-1 text-[15px] font-semibold text-[#2a2f39]">
                              {verifiedDocumentsCount} / {documentRecords.length || "-"}
                            </div>
                          </div>
                          <div title="Illustrative — no verification-rules field exists on the backend yet">
                            <div className="text-[11px] text-[#8a92a1]">Verification Rules</div>
                            <div className="mt-1 text-[15px] font-semibold text-[#2a2f39]">25,000 MT / yr</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5">
                      <div className="text-[14px] font-semibold text-[#2a2f39]">Review Details</div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2 text-[13px]">
                        <div>
                          <div className="text-[#8a92a1]">Started On</div>
                          <div className="mt-0.5 font-medium text-[#2a2f39]">{formatDate(selectedRow.createdAt)}</div>
                        </div>
                        <div>
                          <div className="text-[#8a92a1]">Last Updated</div>
                          <div className="mt-0.5 font-medium text-[#2a2f39]">{selectedRow.lastActionDate}</div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#5d6675]">Estimated Completion</span>
                          <span className="font-medium text-[#2a2f39]">{estimatedCompletion}%</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#e8ecf2]">
                          <div className="h-full rounded-full bg-[#14244a]" style={{ width: `${estimatedCompletion}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5">
                      <div className="flex items-center justify-between">
                        <div className="text-[14px] font-semibold text-[#2a2f39]">Latest Activity</div>
                        <button
                          type="button"
                          onClick={() => setActiveTab("timeline")}
                          className="text-[12px] font-medium text-[#2661d8] hover:underline"
                        >
                          View full timeline
                        </button>
                      </div>
                      <div className="mt-3 space-y-3">
                        {activityLogs.length > 0 ? (
                          activityLogs.slice(0, 3).map((entry) => (
                            <div key={entry.id} className="flex gap-3">
                              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f3f6fb] text-[12px] text-[#52607a]">
                                <HistoryOutlined />
                              </span>
                              <div>
                                <div className="text-[13px] font-medium text-[#2a2f39]">
                                  {entry.performed_by || "System"} {(entry.action || "").toLowerCase()}
                                </div>
                                <div className="mt-0.5 text-[11px] text-[#a0a7b5]">{formatDateTime(entry.created_at)}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-[13px] text-[#8a92a1]">
                            {minerDetailQ.isLoading ? "Loading activity..." : "No activity has been logged for this case yet."}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5">
                      <button
                        type="button"
                        onClick={() => setCaseIntelOpen((prev) => !prev)}
                        className="flex w-full items-center justify-between"
                      >
                        <span className="text-[14px] font-semibold text-[#2a2f39]">Case Intelligence</span>
                        <div className="flex items-center gap-2">
                          <span className={classNames(
                            "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
                            caseAlerts.length > 0 ? "bg-[#fff0f1] text-[#ef2f32]" : "bg-[#ecfaf0] text-[#1ea43b]",
                          )}>
                            {caseAlerts.length}
                          </span>
                          <DownOutlined className={classNames("text-[10px] text-[#a0a6b3] transition-transform", caseIntelOpen ? "rotate-180" : "")} />
                        </div>
                      </button>
                      <div className="mt-1 text-[11px] text-[#a0a7b5]">Key alerts</div>

                      {caseIntelOpen ? (
                        <div className="mt-4 space-y-2.5">
                          {caseAlerts.length > 0 ? (
                            caseAlerts.map((alert) => (
                              <div
                                key={alert.id}
                                className={classNames(
                                  "flex items-start gap-2 rounded-[12px] border px-3 py-2.5 text-[12px]",
                                  alert.tone === "red"
                                    ? "border-[#f7d6d7] bg-[#fff5f5] text-[#8a2a2c]"
                                    : "border-[#f6e3bf] bg-[#fffaf0] text-[#7a5308]",
                                )}
                              >
                                {alert.tone === "red" ? (
                                  <ExclamationCircleOutlined className="mt-0.5 text-[#ef2f32]" />
                                ) : (
                                  <WarningOutlined className="mt-0.5 text-[#df8b19]" />
                                )}
                                <span>{alert.text}</span>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-[12px] border border-dashed border-[#dce3ef] bg-[#fafbfd] px-3 py-3 text-[12px] text-[#8a92a1]">
                              {minerDetailQ.isLoading ? "Loading case intelligence..." : "No alerts for this case right now."}
                            </div>
                          )}

                          <div
                            className="mt-5 flex items-center justify-between"
                            title="Illustrative — no conditions/covenant tracking exists on the backend yet"
                          >
                            <span className="text-[13px] font-semibold text-[#2a2f39]">Outstanding Conditions</span>
                            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#f4f6f9] px-1.5 text-[11px] font-semibold text-[#5d6675]">
                              2
                            </span>
                          </div>
                          <div
                            className="mt-2.5 space-y-2"
                            title="Illustrative — no conditions/covenant tracking exists on the backend yet"
                          >
                            {[
                              { text: "Replace expired insurance Certificate", due: "Due in 28 days" },
                              { text: "Submit updated Waste Management Plan", due: "Due in 28 days" },
                            ].map((item) => (
                              <div
                                key={item.text}
                                className="flex items-center justify-between rounded-[12px] border border-[#e8ecf4] bg-white px-3 py-2.5 text-[12px]"
                              >
                                <span className="text-[#5d6675]">{item.text}</span>
                                <span className="flex items-center gap-1 text-[11px] text-[#a0a7b5]">
                                  <CalendarOutlined /> {item.due}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5">
                      <div className="text-[14px] font-semibold text-[#2a2f39]">Case Quick Info</div>
                      <div className="mt-3 space-y-2.5 text-[13px]">
                        <div
                          className="flex items-center justify-between"
                          title="Illustrative — no due-date field exists on reviews yet"
                        >
                          <span className="text-[#8a92a1]">Due Date</span>
                          <span className="font-medium text-[#2a2f39]">14 Jan 2026</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#8a92a1]">Days Open</span>
                          <span className="font-medium text-[#2a2f39]">
                            {daysOpen !== null ? `${daysOpen} day${daysOpen === 1 ? "" : "s"}` : "Not set"}
                          </span>
                        </div>
                        <div
                          className="flex items-center justify-between"
                          title="Priority mirrors this case's risk level — there is no separate priority field yet"
                        >
                          <span className="text-[#8a92a1]">Priority</span>
                          <span className="font-medium text-[#2a2f39]">{selectedRow.riskLevel.label}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#8a92a1]">Last Updated</span>
                          <span className="font-medium text-[#2a2f39]">{selectedRow.lastActionDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === "licensing" ? (
                <div className="space-y-5">
                  <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5">
                    <div className="text-[14px] font-semibold text-[#2a2f39]">Licensing Review Summary</div>
                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
                      <div>
                        <div className="text-[11px] text-[#8a92a1]">Overall Status</div>
                        <div className="mt-1 text-[14px] font-semibold text-[#df8b19]">
                          {licenses.length === 0
                            ? "No licenses"
                            : verifiedLicensesCount === licenses.length
                              ? "Complete"
                              : "In Progress"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#8a92a1]">License Verified</div>
                        <div className="mt-1 text-[14px] font-semibold text-[#2a2f39]">
                          {verifiedLicensesCount} / {licenses.length || "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#8a92a1]">Requires Review</div>
                        <div className="mt-1 text-[14px] font-semibold text-[#2a2f39]">
                          {licenses.filter((l) => ["pending", "issues_found"].includes((l.verification_status ?? "").toLowerCase())).length}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#8a92a1]">Rejected</div>
                        <div className="mt-1 text-[14px] font-semibold text-[#ef2f32]">
                          {licenses.filter((l) => (l.verification_status ?? "").toLowerCase() === "rejected").length}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#8a92a1]">Overall Licensing Score</div>
                        <div className="mt-1 text-[14px] font-semibold text-[#1ea43b]">{licensingProgress}%</div>
                      </div>
                    </div>
                  </div>

                  {licenses.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { key: "all" as const, label: "All", count: licenses.length },
                        {
                          key: "verified" as const,
                          label: "Verified",
                          count: licenses.filter((l) => (l.verification_status ?? "").toLowerCase() === "verified").length,
                        },
                        {
                          key: "issues_found" as const,
                          label: "Needs clarification",
                          count: licenses.filter((l) => (l.verification_status ?? "").toLowerCase() === "issues_found").length,
                        },
                        {
                          key: "rejected" as const,
                          label: "Rejected",
                          count: licenses.filter((l) => (l.verification_status ?? "").toLowerCase() === "rejected").length,
                        },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setLicenseStatusFilter(tab.key)}
                          className={classNames(
                            "rounded-[8px] border px-3 py-1.5 text-[12px] font-medium",
                            licenseStatusFilter === tab.key
                              ? "border-[#c7d4ee] bg-[#eef2fb] text-[#14244a]"
                              : "border-[#e8ecf4] bg-white text-[#5d6675] hover:bg-[#f7f9fc]",
                          )}
                        >
                          {tab.label} ({tab.count})
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {licenses.length > 0 ? (
                    licenses
                      .filter((doc) =>
                        licenseStatusFilter === "all"
                          ? true
                          : (doc.verification_status ?? "").toLowerCase() === licenseStatusFilter,
                      )
                      .map((doc) => {
                      const status = (doc.verification_status ?? "pending").toLowerCase();
                      const days = daysUntil(doc.expiry_date);
                      const validity = licenseValidityStatus(days);
                      const borderColor =
                        status === "rejected"
                          ? "#ef2f32"
                          : status === "issues_found"
                            ? "#df8b19"
                            : status === "verified"
                              ? "#1ea43b"
                              : "#dbe2ee";

                      return (
                        <div
                          key={doc.id}
                          className="overflow-hidden rounded-[16px] border border-[#e8ecf4] bg-white"
                          style={{ borderLeft: `4px solid ${borderColor}` }}
                        >
                          <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex items-start gap-3">
                              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#f4f7fb] text-[16px] text-[#5e6777]">
                                <FileTextOutlined />
                              </span>
                              <div>
                                <div className="text-[15px] font-semibold text-[#2a2f39]">{doc.license_type || "License"}</div>
                                <div className="mt-2 text-[10px] uppercase tracking-wide text-[#a0a7b5]">License No.</div>
                                <div className="text-[12px] text-[#5d6675]">{doc.license_number || "N/A"}</div>
                                <div className="mt-2 text-[10px] uppercase tracking-wide text-[#a0a7b5]">Issuing Authority</div>
                                <div className="text-[12px] text-[#5d6675]">{doc.issuing_authority || "N/A"}</div>
                                <div className="mt-3">
                                  {doc.document ? (
                                    <a
                                      href={doc.document}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#cfe0fb] bg-[#eef4ff] px-3 py-1.5 text-[12px] font-medium text-[#2661d8] hover:bg-[#e2ecfe]"
                                    >
                                      <EyeOutlined /> View Document
                                    </a>
                                  ) : (
                                    <span className="text-[12px] text-[#a0a7b5]">No document on file</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div>
                              <div
                                className="text-[10px] uppercase tracking-wide text-[#a0a7b5]"
                                title="Illustrative — no issue-date field exists on the backend yet"
                              >
                                Issue Date
                              </div>
                              <div className="text-[12px] text-[#5d6675]">12 Jan 2024</div>
                              <div className="mt-2 text-[10px] uppercase tracking-wide text-[#a0a7b5]">Expiry Date</div>
                              <div className="text-[12px] text-[#5d6675]">
                                {formatDate(doc.expiry_date)}
                                {days !== null ? (
                                  <span className={classNames("ml-1", days < 0 ? "text-[#ef2f32]" : "text-[#df8b19]")}>
                                    ({relativeExpiryLabel(days)})
                                  </span>
                                ) : null}
                              </div>
                              <div className="mt-2 text-[10px] uppercase tracking-wide text-[#a0a7b5]">Status</div>
                              <span className={classNames("mt-0.5 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold", statusStyles[validity.tone].container)}>
                                {validity.label}
                              </span>
                            </div>

                            <div>
                              <div
                                className="text-[10px] uppercase tracking-wide text-[#a0a7b5]"
                                title="Illustrative — the backend does not run automated document validation yet"
                              >
                                Validation Checks
                              </div>
                              <div className="mt-1.5 space-y-1">
                                <div className="flex items-center gap-1.5 text-[12px] text-[#5d6675]">
                                  <CheckCircleOutlined className="text-[11px] text-[#1ea43b]" /> File is readable
                                </div>
                                <div className="flex items-center gap-1.5 text-[12px] text-[#5d6675]">
                                  <CheckCircleOutlined className="text-[11px] text-[#1ea43b]" /> Government format detected
                                </div>
                                <div className="flex items-center gap-1.5 text-[12px] text-[#5d6675]">
                                  <CheckCircleOutlined className="text-[11px] text-[#1ea43b]" /> Signature verified
                                </div>
                                {days !== null ? (
                                  <div className={classNames("flex items-center gap-1.5 text-[12px]", days < 0 ? "text-[#ef2f32]" : "text-[#df8b19]")}>
                                    <WarningOutlined className="text-[11px]" />
                                    {days < 0 ? relativeExpiryLabel(days) : `Expires ${relativeExpiryLabel(days)}`}
                                  </div>
                                ) : null}
                              </div>
                            </div>

                            <div className="min-w-[190px]">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-wide text-[#a0a7b5]">Reviewer Assessment</span>
                                <span className={classNames("rounded-full px-2 py-0.5 text-[10px] font-semibold", licensingToneClass(status))}>
                                  {status === "issues_found" ? "Needs clarification" : status.charAt(0).toUpperCase() + status.slice(1)}
                                </span>
                              </div>
                              <div className="mt-2 space-y-1.5">
                                {[
                                  { value: "verified", label: "Verified" },
                                  { value: "issues_found", label: "Needs Clarification" },
                                  { value: "rejected", label: "Rejected" },
                                ].map((option) => (
                                  <label key={option.value} className="flex items-center gap-2 text-[12px] text-[#5d6675]">
                                    <input
                                      type="radio"
                                      name={`license-assessment-${doc.id}`}
                                      checked={status === option.value}
                                      disabled={verifyLicenseMutation.isPending}
                                      onChange={() =>
                                        verifyLicenseMutation.mutate({
                                          licenseId: doc.id,
                                          verification_status: option.value,
                                        })
                                      }
                                      className="h-3.5 w-3.5 accent-[#14244a]"
                                    />
                                    {option.label}
                                  </label>
                                ))}
                              </div>
                              <div className="mt-3 text-[11px] text-[#a0a7b5]">
                                {doc.verified_by ? (
                                  <>
                                    <span className="font-medium text-[#5d6675]">Reviewed by</span> {doc.verified_by}
                                    <br />
                                    {formatDateTime(doc.verified_at)}
                                  </>
                                ) : (
                                  "Not yet reviewed"
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-[18px] border border-dashed border-[#dce3ef] bg-[#fafbfd] px-5 py-6 text-[14px] text-[#7b8392]">
                      {minerDetailQ.isLoading ? "Loading licenses..." : "No licenses were returned by the miner detail endpoint for this case yet."}
                    </div>
                  )}
                </div>
              ) : activeTab === "environmental-esg" ? (
                <div className="space-y-6">
                  {esgReviews.length > 0 ? (
                    esgReviews.map((review) => (
                      <div key={review.id} className="rounded-[20px] border border-[#e8ecf4] bg-[#fafbfd] p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-[16px] font-medium text-[#2a2f39]">{review.category || "ESG Review"}</div>
                          <span className={classNames("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", licensingToneClass(review.status))}>
                            {review.status || "Not initiated"}
                          </span>
                        </div>
                        <div className="mt-2 text-[12px] text-[#a0a7b5]">
                          {review.reviewed_by ? `Reviewed by ${review.reviewed_by} · ${formatDateTime(review.updated_at)}` : "Not yet reviewed"}
                        </div>
                        <textarea
                          readOnly
                          value={review.notes || "No notes on file"}
                          className="mt-4 h-24 w-full resize-none rounded-[16px] border border-[#dce3ef] bg-white px-4 py-3 text-[14px] text-[#5d6675] outline-none"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[18px] border border-dashed border-[#dce3ef] bg-[#fafbfd] px-5 py-6 text-[14px] text-[#7b8392]">
                      {minerDetailQ.isLoading ? "Loading ESG reviews..." : "No ESG reviews were returned by the miner detail endpoint for this case yet."}
                    </div>
                  )}
                </div>
              ) : activeTab === "operational" ? (
                <div className="space-y-4">
                  {CASE_OPERATIONAL_ITEMS.map((item) => (
                    <CaseChecklistCard key={item.title} item={item} />
                  ))}
                </div>
              ) : activeTab === "export-compliance" ? (
                <div className="space-y-4">
                  {CASE_EXPORT_ITEMS.map((item) => (
                    <CaseChecklistCard key={item.title} item={item} />
                  ))}
                </div>
              ) : activeTab === "documents" ? (
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full max-w-[320px]">
                      <SearchOutlined className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#a0a6b3]" />
                      <input
                        type="text"
                        value={docSearch}
                        onChange={(e) => setDocSearch(e.target.value)}
                        placeholder="Search documents..."
                        className="h-10 w-full rounded-[10px] border border-[#e8ecf4] bg-[#fafbfe] pl-9 pr-3 text-[13px] text-[#2d3441] outline-none placeholder:text-[#a0a6b3]"
                      />
                    </div>
                    <div className="inline-flex items-center rounded-[10px] border border-[#e8ecf4] bg-white p-1">
                      <button
                        type="button"
                        onClick={() => setDocViewMode("list")}
                        className={classNames(
                          "inline-flex h-8 items-center gap-1.5 rounded-[8px] px-3 text-[12px] font-medium transition-colors",
                          docViewMode === "list" ? "bg-[#14244a] text-white" : "text-[#5d6675]",
                        )}
                      >
                        <UnorderedListOutlined /> List
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocViewMode("grid")}
                        className={classNames(
                          "inline-flex h-8 items-center gap-1.5 rounded-[8px] px-3 text-[12px] font-medium transition-colors",
                          docViewMode === "grid" ? "bg-[#14244a] text-white" : "text-[#5d6675]",
                        )}
                      >
                        <AppstoreOutlined /> Grid
                      </button>
                    </div>
                  </div>

                  {(() => {
                    const filteredDocs = documentRecords.filter((doc) =>
                      docSearch.trim()
                        ? (doc.document_type || "").toLowerCase().includes(docSearch.trim().toLowerCase())
                        : true,
                    );

                    if (minerDetailQ.isLoading) {
                      return (
                        <div className="rounded-[18px] border border-dashed border-[#dce3ef] bg-[#fafbfd] px-5 py-6 text-[14px] text-[#7b8392]">
                          Loading documents...
                        </div>
                      );
                    }

                    if (filteredDocs.length === 0) {
                      return (
                        <div className="rounded-[18px] border border-dashed border-[#dce3ef] bg-[#fafbfd] px-5 py-6 text-[14px] text-[#7b8392]">
                          {documentRecords.length === 0
                            ? "No documents were returned by the miner detail endpoint for this case yet."
                            : "No documents match your search."}
                        </div>
                      );
                    }

                    if (docViewMode === "grid") {
                      return (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          {filteredDocs.map((doc) => (
                            <div key={doc.id} className="rounded-[16px] border border-[#e8ecf4] bg-white p-4">
                              <div className="flex items-start justify-between gap-2">
                                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#f4f7fb] text-[16px] text-[#5e6777]">
                                  <FileTextOutlined />
                                </span>
                                <span className={classNames("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", licensingToneClass(doc.status))}>
                                  {doc.status || "Unverified"}
                                </span>
                              </div>
                              <div className="mt-3 truncate text-[13px] font-semibold text-[#2a2f39]">{doc.document_type || "Document"}</div>
                              <div className="mt-1 text-[12px] text-[#8a92a1]">Issued {formatDate(doc.issued_date)}</div>
                              <div className="mt-3 flex items-center gap-2">
                                {doc.file ? (
                                  <a href={doc.file} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e8ecf4] text-[13px] text-[#7b8392] hover:bg-[#f7f9fc]">
                                    <EyeOutlined />
                                  </a>
                                ) : null}
                                <button
                                  type="button"
                                  disabled={verifyDocumentMutation.isPending}
                                  onClick={() =>
                                    verifyDocumentMutation.mutate({
                                      documentId: doc.id,
                                      status: isVerifiedStatus(doc.status) ? "Unverified" : "Verified",
                                    })
                                  }
                                  className="inline-flex h-8 items-center rounded-full border border-[#e8ecf4] px-3 text-[12px] text-[#5d6675] hover:bg-[#f7f9fc]"
                                >
                                  {isVerifiedStatus(doc.status) ? "Unmark" : "Mark verified"}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    }

                    return (
                      <div className="overflow-x-auto rounded-[18px] border border-[#e8ecf4]">
                        <table className="w-full min-w-[820px] text-[13px]">
                          <thead>
                            <tr className="border-b border-[#edf1f7] bg-[#fafbfd] text-left text-[#8a92a1]">
                              <th className="px-4 py-3 font-medium">Document</th>
                              <th className="px-4 py-3 font-medium">Issued</th>
                              <th className="px-4 py-3 font-medium">Verified By</th>
                              <th className="px-4 py-3 font-medium">Status</th>
                              <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredDocs.map((doc) => (
                              <tr key={doc.id} className="border-b border-[#f2f4f8] last:border-b-0">
                                <td className="px-4 py-3 font-medium text-[#2a2f39]">{doc.document_type || "Document"}</td>
                                <td className="px-4 py-3 text-[#5d6675]">{formatDate(doc.issued_date)}</td>
                                <td className="px-4 py-3 text-[#5d6675]">{doc.verified_by || "N/A"}</td>
                                <td className="px-4 py-3">
                                  <span className={classNames("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", licensingToneClass(doc.status))}>
                                    {doc.status || "Unverified"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="inline-flex items-center gap-2">
                                    {doc.file ? (
                                      <a href={doc.file} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e8ecf4] text-[13px] text-[#7b8392] hover:bg-[#f7f9fc]">
                                        <EyeOutlined />
                                      </a>
                                    ) : null}
                                    <button
                                      type="button"
                                      disabled={verifyDocumentMutation.isPending}
                                      onClick={() =>
                                        verifyDocumentMutation.mutate({
                                          documentId: doc.id,
                                          status: isVerifiedStatus(doc.status) ? "Unverified" : "Verified",
                                        })
                                      }
                                      className="inline-flex h-8 items-center rounded-full border border-[#e8ecf4] px-3 text-[12px] text-[#5d6675] hover:bg-[#f7f9fc]"
                                    >
                                      {isVerifiedStatus(doc.status) ? "Unmark" : "Mark verified"}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              ) : activeTab === "internal-notes" ? (
                <div className="space-y-4">
                  <textarea
                    placeholder="Add an internal note..."
                    className="h-32 w-full resize-none rounded-[16px] border border-[#dce3ef] bg-white px-4 py-3 text-[14px] text-[#2a2f39] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => showToast("Notes aren't connected to the backend yet.", "error")}
                    className="inline-flex h-11 items-center justify-center rounded-[12px] bg-[#14244a] px-5 text-[14px] font-semibold text-white"
                    style={primaryActionStyle}
                  >
                    Post Note
                  </button>
                  <div className="rounded-[18px] border border-[#e8ecf4] bg-[#fafbfd] p-5 text-[14px] leading-6 text-[#5d6675]">
                    No internal notes captured for this review yet.
                  </div>
                </div>
              ) : activeTab === "audit-history" ? (
                <div className="space-y-4">
                  {activityLogs.length > 0 ? (
                    activityLogs.map((entry) => (
                      <div key={entry.id} className="flex gap-3 rounded-[18px] border border-[#e8ecf4] bg-white px-5 py-4">
                        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f3f6fb] text-[#52607a]">
                          <HistoryOutlined />
                        </span>
                        <div>
                          <div className="text-[14px] font-semibold text-[#2a2f39]">
                            {entry.performed_by || "System"} {(entry.action || "").toLowerCase()}
                          </div>
                          <div className="mt-1 text-[12px] text-[#a0a7b5]">{formatDateTime(entry.created_at)}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[18px] border border-dashed border-[#dce3ef] bg-[#fafbfd] px-5 py-6 text-[14px] text-[#7b8392]">
                      {minerDetailQ.isLoading ? "Loading audit history..." : "No activity has been logged for this case yet."}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {activityLogs.length > 0 ? (
                    activityLogs
                      .slice()
                      .reverse()
                      .map((entry) => (
                        <div key={entry.id} className="flex gap-3 rounded-[18px] border border-[#e8ecf4] bg-white px-5 py-4">
                          <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f3f6fb] text-[#52607a]">
                            <HistoryOutlined />
                          </span>
                          <div>
                            <div className="text-[14px] font-semibold text-[#2a2f39]">
                              {entry.performed_by || "System"} {(entry.action || "").toLowerCase()}
                            </div>
                            <div className="mt-1 text-[12px] text-[#a0a7b5]">{formatDateTime(entry.created_at)}</div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="rounded-[18px] border border-dashed border-[#dce3ef] bg-[#fafbfd] px-5 py-6 text-[14px] text-[#7b8392]">
                      Timeline activity will appear here once the review progresses.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1f7] bg-[#fafbfd] px-6 py-4">
              <div className="text-[12px] font-semibold uppercase tracking-wide text-[#8a92a1]">
                Required checks &middot; {openIssuesCount} of {requiredChecksTotal} items unverified
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRequestDocsOpen(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#f6e3bf] bg-[#fff4df] px-4 text-[13px] font-medium text-[#a5680c]"
                >
                  <InfoCircleOutlined /> More Information Required
                </button>
                <button
                  type="button"
                  title="Conditional approval is not supported by the compliance workflow yet."
                  onClick={() => showToast("Conditional approval isn't connected to the backend yet.", "info")}
                  className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#e5e9f1] bg-white px-4 text-[13px] font-medium text-[#5d6675] hover:bg-[#f7f9fc]"
                >
                  Conditionally Approve
                </button>
                <button
                  type="button"
                  disabled={reviewWorkflowMutation.isPending}
                  onClick={() => setRejectReason("")}
                  className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#f3c2c4] bg-white px-4 text-[13px] font-medium text-[#ef2f32] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CloseOutlined /> Reject Application
                </button>
                <div className="flex items-stretch overflow-hidden rounded-[10px]" style={primaryActionStyle}>
                  <button
                    type="button"
                    disabled={reviewWorkflowMutation.isPending}
                    onClick={() => reviewWorkflowMutation.mutate({ reviewId: selectedRow.id, action: "approve" })}
                    className="inline-flex h-10 items-center gap-2 bg-[#14244a] px-4 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircleOutlined /> Approve Compliance
                  </button>
                  <button
                    type="button"
                    title="No approval variants are supported by the compliance workflow yet."
                    onClick={() => showToast("Only a standard approval is supported today.", "info")}
                    className="flex h-10 w-8 items-center justify-center border-l border-white/20 bg-[#14244a] text-white hover:bg-[#1c2f5c]"
                  >
                    <DownOutlined className="text-[10px]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isRequestDocsOpen && selectedRow ? (
        <RequestComplianceDocumentModal
          minerCode={selectedRow.minerId}
          onClose={() => setIsRequestDocsOpen(false)}
          onConfirm={() => setIsRequestDocsOpen(false)}
          onSubmit={async (payload) => {
            await supportRequestMutation.mutateAsync({
              minerId: selectedRow.minerUuid,
              review: selectedRow.id,
              support_type: "REGULATORY_ADVISORY",
              priority: payload.priority,
              custom_note: payload.custom_note,
              document_types: payload.document_types,
            });
          }}
        />
      ) : null}

      {rejectReason !== null && selectedRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(8,13,28,0.28)] backdrop-blur-[4px] px-4">
          <div className="w-full max-w-[480px] rounded-[20px] bg-white p-6 shadow-[0_40px_90px_-40px_rgba(16,30,61,0.55)]">
            <div className="text-[18px] font-semibold text-[#2a2f39]">Reject Application</div>
            <div className="mt-1 text-[13px] text-[#8a92a1]">Provide a reason for rejecting case {selectedRow.minerId}.</div>
            <textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Reason for rejection..."
              className="mt-4 h-28 w-full resize-none rounded-[14px] border border-[#dce3ef] bg-white px-4 py-3 text-[14px] text-[#2a2f39] outline-none placeholder:text-[#a0a7b5]"
            />
            <div className="mt-5 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setRejectReason(null)} className="text-[14px] font-medium text-[#5d6675]">
                Cancel
              </button>
              <button
                type="button"
                disabled={reviewWorkflowMutation.isPending || !rejectReason.trim()}
                onClick={() => {
                  reviewWorkflowMutation.mutate(
                    { reviewId: selectedRow.id, action: "reject", reason: rejectReason.trim() },
                    { onSuccess: () => setRejectReason(null) },
                  );
                }}
                className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#ef2f32] px-4 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CloseOutlined /> Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
