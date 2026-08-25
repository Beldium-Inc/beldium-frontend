"use client";

import { useState, useEffect, type ReactNode } from "react";
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
  MoreOutlined,
  HourglassOutlined,
  ArrowRightOutlined,
  RightOutlined,
  RiseOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import type { AdminReviewRow } from "@/src/features/compliance/dashboard/types";
import { classNames, primaryActionStyle, statusStyles } from "@/src/features/compliance/dashboard/lib/style";
import { showToast } from "@/src/store/toast.store";
import {
  getComplianceMinerDetail,
  getComplianceMiningSiteSourceProfile,
  verifyMinerLicense,
  verifyMinerDocument,
  submitComplianceReviewWorkflow,
  createComplianceSupportRequest,
  type MineralSourceProfileResponse,
} from "@/src/features/compliance/dashboard/api";
import RequestComplianceDocumentModal from "@/src/features/compliance/dashboard/components/reviews/RequestComplianceDocumentModal";
import { getApiErrorMessage } from "@/src/features/compliance/dashboard/lib/documents";
import {
  type CaseReviewTab,
  CASE_REVIEW_TABS,
} from "@/src/features/compliance/dashboard/components/reviews/constants";
import {
  type CaseChecklistItem,
  type MinerSiteRecord,
  buildOperationalChecklist,
  caseChecklistStatusMeta,
  SiteDetailField,
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
  registration_number?: string | null;
  industry_sector?: string | null;
  government_issue_document_type?: string | null;
  government_issue_document?: string | null;
  license_issue_date?: string | null;
  license_certificate?: string | null;
  environmental_documentation?: string | null;
  environmental_consultant?: string | null;
  environmental_compliance_document?: string | null;
  has_safety_measures?: boolean | null;
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

const ESG_STATUS_OPTIONS: { value: string; label: string; tone: keyof typeof statusStyles }[] = [
  { value: "approved", label: "Approved", tone: "green" },
  { value: "in_progress", label: "In Progress", tone: "amber" },
  { value: "not_initiated", label: "Not Initiated", tone: "slate" },
];

function esgStatusMeta(status?: string | null) {
  const normalized = (status ?? "not_initiated").toLowerCase();
  return ESG_STATUS_OPTIONS.find((option) => option.value === normalized) ?? ESG_STATUS_OPTIONS[2];
}

function esgCategoryLabel(category?: string | null) {
  const normalized = (category ?? "").toLowerCase();
  if (normalized === "environmental") return "Environmental";
  if (normalized === "safety") return "Safety";
  if (normalized === "community") return "Community";
  return category || "ESG Review";
}

const CHECKLIST_STATUS_OPTIONS: { value: CaseChecklistItem["status"]; label: string }[] = [
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending" },
  { value: "flagged", label: "Flagged" },
];

function ChecklistItemDrawer({
  item,
  categoryLabel,
  onClose,
}: {
  item: CaseChecklistItem;
  categoryLabel: string;
  onClose: () => void;
}) {
  const [drawerTab, setDrawerTab] = useState<"overview" | "comments">("overview");
  const [assessment, setAssessment] = useState<CaseChecklistItem["status"]>(item.status);
  const [notes, setNotes] = useState("");
  const meta = caseChecklistStatusMeta(item.status);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[rgba(8,13,28,0.28)] backdrop-blur-[4px]">
      <div className="flex h-full w-full max-w-[440px] flex-col bg-white shadow-[0_40px_90px_-40px_rgba(16,30,61,0.55)]">
        <div className="flex items-start justify-between gap-3 border-b border-[#edf1f7] px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#f4f7fb] text-[16px] text-[#5e6777]">
              <FileTextOutlined />
            </span>
            <div>
              <div className="text-[15px] font-semibold text-[#2a2f39]">{item.title}</div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full border border-[#d7e3fb] bg-[#eef2fb] px-2 py-0.5 text-[10px] font-medium text-[#2661d8]">
                  {categoryLabel}
                </span>
                <span className={classNames("rounded-full px-2 py-0.5 text-[10px] font-semibold", meta.className)}>
                  {meta.label}
                </span>
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-[#7b8392] hover:bg-[#f4f6fb]">
            <CloseOutlined />
          </button>
        </div>

        <div className="flex gap-0 border-b border-[#edf1f7] px-6">
          {([
            { key: "overview" as const, label: "Overview" },
            { key: "comments" as const, label: "Comments" },
          ]).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setDrawerTab(tab.key)}
              className={classNames(
                "whitespace-nowrap border-b-2 px-5 py-4 text-[15px] transition-colors",
                drawerTab === tab.key
                  ? "border-[#1f2430] font-semibold text-[#1f2430]"
                  : "border-transparent font-normal text-[#8a92a1] hover:text-[#2a2f39]",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto bg-[#fbfcfe] px-6 py-6">
          {drawerTab === "overview" ? (
            <div className="space-y-5">
              <div className="rounded-[16px] border border-[#eef1f6] bg-white p-5">
                <div className="text-[17px] font-semibold text-[#1f2430]">Requirement</div>
                <div className="mt-3 text-[15px] leading-6 text-[#5d6675]">{item.detail}</div>
              </div>

              <div className="rounded-[16px] border border-[#eef1f6] bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[17px] font-semibold text-[#1f2430]">Reviewer Assessment</span>
                  <span className={classNames("rounded-full px-3 py-1 text-[13px] font-medium", meta.className)}>
                    {meta.label}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {CHECKLIST_STATUS_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-3 text-[15px] text-[#3f4654]">
                      <input
                        type="radio"
                        name={`checklist-assessment-${item.title}`}
                        checked={assessment === option.value}
                        onChange={() => setAssessment(option.value)}
                        className="h-4 w-4 accent-[#14244a]"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-[16px] border border-[#eef1f6] bg-white p-5">
                <div className="text-[17px] font-semibold text-[#1f2430]">Reviewer Notes</div>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add any notes about this item"
                  className="mt-4 h-28 w-full resize-none rounded-[12px] border border-[#e8ecf4] bg-[#fbfcfe] px-4 py-3 text-[15px] text-[#2a2f39] outline-none placeholder:text-[#a0a7b5]"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-[16px] border border-[#eef1f6] bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[17px] font-semibold text-[#1f2430]">Internal Discussion</span>
                <button
                  type="button"
                  onClick={() => showToast("Comments aren't connected to the backend yet.", "info")}
                  className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#e5e9f1] bg-white px-4 text-[14px] font-medium text-[#2b3140] hover:bg-[#f7f9fc]"
                >
                  <PlusOutlined className="text-[12px]" /> Add comment
                </button>
              </div>
              <div className="mt-5 rounded-[12px] border border-dashed border-[#dce3ef] bg-[#fbfcfe] px-4 py-8 text-center text-[14px] text-[#8a92a1]">
                No comments yet on this item.
              </div>
              <div className="mt-5 rounded-[12px] border border-[#eef1f6] bg-white p-4">
                <div className="text-[15px] font-semibold text-[#1f2430]">Reviewer Notes</div>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add any notes about this item"
                  className="mt-3 h-24 w-full resize-none rounded-[12px] border border-[#e8ecf4] bg-[#fbfcfe] px-4 py-3 text-[15px] text-[#2a2f39] outline-none placeholder:text-[#a0a7b5]"
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => showToast("Comments aren't connected to the backend yet.", "info")}
                    className="inline-flex h-10 items-center rounded-[10px] bg-[#14244a] px-4 text-[14px] font-semibold !text-white"
                    style={primaryActionStyle}
                  >
                    Add comment
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#edf1f7] bg-white px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center rounded-[12px] border border-[#e5e9f1] bg-white px-6 text-[15px] font-medium text-[#3f4654] hover:bg-[#f7f9fc]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              showToast("Item assessments aren't connected to the backend yet.", "info");
              onClose();
            }}
            className="inline-flex h-11 items-center rounded-[12px] bg-[#14244a] px-6 text-[15px] font-semibold !text-white"
            style={primaryActionStyle}
          >
            Save assessment
          </button>
        </div>
      </div>
    </div>
  );
}

function ChecklistReviewTab({
  title,
  scoreLabel,
  requirementColumnLabel,
  categoryLabel,
  items,
}: {
  title: string;
  scoreLabel: string;
  requirementColumnLabel: string;
  categoryLabel: string;
  items: CaseChecklistItem[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "outstanding" | "verified" | "critical">("all");
  const [openItem, setOpenItem] = useState<CaseChecklistItem | null>(null);

  const verifiedCount = items.filter((i) => i.status === "verified").length;
  const outstandingCount = items.filter((i) => i.status === "pending").length;
  const criticalCount = items.filter((i) => i.status === "flagged").length;
  const score = items.length ? Math.round((verifiedCount / items.length) * 100) : 0;

  const filteredItems = items
    .filter((item) => (search.trim() ? item.title.toLowerCase().includes(search.trim().toLowerCase()) : true))
    .filter((item) => {
      if (filter === "all") return true;
      if (filter === "outstanding") return item.status === "pending";
      if (filter === "verified") return item.status === "verified";
      return item.status === "flagged";
    });

  return (
    <div className="space-y-5">
      <div className="rounded-[18px] border border-[#eef1f6] bg-white p-6">
        <div className="text-[20px] font-semibold tracking-[-0.01em] text-[#1f2430]">{title}</div>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <SummaryTile
            label={title.includes("Export") ? "Compliance Status" : "Operational Status"}
            value={items.length === 0 ? "No items" : criticalCount > 0 ? "Needs Attention" : outstandingCount > 0 ? "In Progress" : "Good"}
            valueClassName={criticalCount > 0 ? "text-[#ef2f32]" : outstandingCount > 0 ? "text-[#df8b19]" : "text-[#1ea43b]"}
          />
          <SummaryTile
            label={title.includes("Export") ? "Export Checks" : "Checks Complete"}
            value={`${verifiedCount} / ${items.length || "-"}`}
          />
          <SummaryTile label="Outstanding" value={String(outstandingCount)} />
          <SummaryTile label="Critical" value={String(criticalCount)} valueClassName="text-[#ef2f32]" />
          <SummaryTile label={scoreLabel} value={`${score}%`} valueClassName="text-[#1ea43b]" />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all" as const, label: "All", count: items.length },
            { key: "outstanding" as const, label: "Outstanding", count: outstandingCount },
            { key: "verified" as const, label: "Verified", count: verifiedCount },
            { key: "critical" as const, label: "Critical", count: criticalCount },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={classNames(
                "rounded-[10px] border px-4 py-2 text-[14px] font-medium transition-colors",
                filter === tab.key
                  ? "border-[#cfe0f5] bg-[#eaf3fb] text-[#1f6f8b]"
                  : "border-[#e8ecf4] bg-white text-[#5d6675] hover:bg-[#f7f9fc]",
              )}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        <div className="relative">
          <SearchOutlined className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[14px] text-[#a0a6b3]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${title.includes("Export") ? "export compliance" : "operational"} items`}
            className="h-11 w-[300px] rounded-[10px] border border-[#e8ecf4] bg-white pl-4 pr-10 text-[14px] text-[#2d3441] outline-none placeholder:text-[#a0a6b3]"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-[18px] border border-[#eef1f6] bg-white">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-[#eef1f6] bg-[#fbfcfe] text-left text-[15px] font-medium text-[#3f4654]">
              <th className="px-6 py-4 font-medium">#</th>
              <th className="px-6 py-4 font-medium">{requirementColumnLabel}</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-[14px] text-[#8a92a1]">
                  No items match your filters.
                </td>
              </tr>
            ) : (
              filteredItems.map((item, index) => {
                const itemMeta = caseChecklistStatusMeta(item.status);
                return (
                  <tr
                    key={item.title}
                    className="cursor-pointer border-b border-[#f2f4f8] last:border-b-0 hover:bg-[#fafbfe]"
                    onClick={() => setOpenItem(item)}
                  >
                    <td className="px-6 py-4 text-[15px] text-[#8a92a1]">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="text-[15px] text-[#1f2430]">{item.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={classNames("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium", itemMeta.className)}>
                        {itemMeta.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setOpenItem(item)}
                        className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-[18px] text-[#c7ccd6] hover:bg-[#f4f6fb] hover:text-[#7b8392]"
                      >
                        <MoreOutlined />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {openItem ? (
        <ChecklistItemDrawer item={openItem} categoryLabel={categoryLabel} onClose={() => setOpenItem(null)} />
      ) : null}
    </div>
  );
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
  showValue = true,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  color?: string;
  caption?: string;
  showValue?: boolean;
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
      {showValue ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[16px] font-bold text-[#2a2f39]">{clamped}%</span>
          {caption ? <span className="text-[9px] text-[#8a92a1]">{caption}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  valueClassName = "text-[#1f2430]",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-[12px] border border-[#eef1f6] bg-white px-4 py-3.5">
      <div className="text-[13px] text-[#8a92a1]">{label}</div>
      <div className={classNames("mt-1.5 text-[17px] font-semibold", valueClassName)}>{value}</div>
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

function SiteEmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-[18px] border border-dashed border-[#dce3ef] bg-[#fafbfd] px-5 py-6 text-[14px] leading-6 text-[#7b8392]">
      {label}
    </div>
  );
}

function SiteFieldsCard({ title, fields }: { title: string; fields: { label: string; value: string | null | undefined }[] }) {
  return (
    <div className="rounded-[18px] border border-[#eef1f6] bg-white p-6">
      <div className="text-[15px] font-semibold text-[#1f2430]">{title}</div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-[13px] sm:grid-cols-3">
        {fields.map((f) => (
          <SiteDetailField key={f.label} label={f.label} value={f.value} />
        ))}
      </div>
    </div>
  );
}

function SiteRecordsTable<T extends { id: string }>({
  rows,
  emptyLabel,
  columns,
}: {
  rows: T[];
  emptyLabel: string;
  columns: { label: string; render: (row: T) => ReactNode }[];
}) {
  if (!rows.length) return <SiteEmptyState label={emptyLabel} />;
  return (
    <div className="overflow-x-auto rounded-[18px] border border-[#eef1f6] bg-white">
      <table className="w-full min-w-[520px] text-left text-[13px]">
        <thead className="bg-[#fafbfd] text-[#8a92a1]">
          <tr>
            {columns.map((c) => (
              <th key={c.label} className="whitespace-nowrap px-4 py-3 font-medium">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-[#eef1f6]">
              {columns.map((c) => (
                <td key={c.label} className="px-4 py-3 text-[#2a2f39]">
                  {c.render(row) ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SiteSubTabPanel({
  tab,
  miner,
  selectedSite,
  siteProfile,
  licenses,
  esgReviews,
}: {
  tab: Exclude<CaseReviewTab, "documents">;
  miner: {
    registration_number?: string | null;
    government_issue_document_type?: string | null;
    business_role?: string | null;
    industry_sector?: string | null;
    license_number?: string | null;
    issuing_authority?: string | null;
    license_issue_date?: string | null;
    environmental_documentation?: string | null;
    environmental_consultant?: string | null;
    has_safety_measures?: boolean | null;
  } | null;
  selectedSite: MinerSiteRecord | null;
  siteProfile: MineralSourceProfileResponse["data"] | undefined;
  licenses: {
    id: string;
    license_type?: string | null;
    license_number?: string | null;
    issuing_authority?: string | null;
    expiry_date?: string | null;
    verification_status?: string | null;
  }[];
  esgReviews: { id: string; category?: string | null; status?: string | null; notes?: string | null }[];
}) {
  if (tab === "corporate") {
    return (
      <SiteFieldsCard
        title="Corporate registration"
        fields={[
          { label: "Registration Number", value: miner?.registration_number },
          { label: "Business Role", value: miner?.business_role },
          { label: "Industry Sector", value: miner?.industry_sector },
          { label: "ID Document Type", value: miner?.government_issue_document_type },
        ]}
      />
    );
  }

  if (tab === "licence") {
    return (
      <div className="space-y-3">
        <div className="text-[13px] text-[#7b8392]">
          Licences are held at the miner account level and are not yet linked to individual sites.
        </div>
        <SiteRecordsTable
          rows={licenses}
          emptyLabel="No licences on file for this miner yet."
          columns={[
            { label: "Type", render: (l) => l.license_type },
            { label: "Number", render: (l) => l.license_number },
            { label: "Issuing Authority", render: (l) => l.issuing_authority },
            { label: "Expiry", render: (l) => formatDate(l.expiry_date) },
            {
              label: "Status",
              render: (l) => (
                <span className={classNames("rounded-full px-2.5 py-1 text-[11px] font-medium capitalize", licensingToneClass(l.verification_status))}>
                  {(l.verification_status || "pending").replace(/_/g, " ")}
                </span>
              ),
            },
          ]}
        />
      </div>
    );
  }

  if (tab === "site_gps") {
    const site = siteProfile ?? selectedSite;
    return (
      <SiteFieldsCard
        title="Site & GPS"
        fields={[
          { label: "Mineral Type", value: site?.mineral_type },
          { label: "Mining Method", value: site?.mining_method },
          { label: "Depth Range", value: (siteProfile as { depth_range?: string | null } | undefined)?.depth_range },
          {
            label: "Location",
            value: [site?.local_government_area, site?.state_of_operation, site?.country].filter(Boolean).join(", "),
          },
          {
            label: "Coordinates",
            value: site?.latitude && site?.longitude ? `${site.latitude}, ${site.longitude}` : null,
          },
          { label: "Operational Status", value: siteProfile?.operational_status },
        ]}
      />
    );
  }

  if (tab === "ownership") {
    return (
      <SiteRecordsTable
        rows={siteProfile?.ownership_records ?? []}
        emptyLabel="No ownership records submitted for this site yet."
        columns={[
          { label: "Type", render: (o) => o.ownership_type },
          { label: "Holder", render: (o) => o.holder_name },
          { label: "Agreement Ref", render: (o) => o.agreement_reference },
          { label: "Start", render: (o) => formatDate(o.start_date) },
          { label: "End", render: (o) => formatDate(o.end_date) },
        ]}
      />
    );
  }

  if (tab === "environmental") {
    const environmentalReviews = esgReviews.filter((e) => (e.category || "").toLowerCase() === "environmental");
    return (
      <div className="space-y-4">
        <SiteFieldsCard
          title="Environmental documentation"
          fields={[
            { label: "Environmental Documentation", value: miner?.environmental_documentation },
            { label: "Environmental Consultant", value: miner?.environmental_consultant },
          ]}
        />
        <SiteRecordsTable
          rows={environmentalReviews}
          emptyLabel="No environmental/ESG review recorded yet."
          columns={[
            { label: "Category", render: (e) => esgCategoryLabel(e.category) },
            {
              label: "Status",
              render: (e) => (
                <span className="rounded-full border border-[#dce3ef] bg-[#fafbfd] px-2.5 py-1 text-[11px] font-medium capitalize text-[#5d6675]">
                  {esgStatusMeta(e.status).label}
                </span>
              ),
            },
            { label: "Notes", render: (e) => e.notes },
          ]}
        />
      </div>
    );
  }

  if (tab === "safety") {
    return (
      <div className="space-y-4">
        <SiteFieldsCard
          title="Safety programme"
          fields={[{ label: "Formal Safety Measures On File", value: miner?.has_safety_measures ? "Yes" : "Not confirmed" }]}
        />
        <SiteRecordsTable
          rows={siteProfile?.safety_records ?? []}
          emptyLabel="No safety incidents recorded for this site."
          columns={[
            { label: "Incident Date", render: (s) => formatDate(s.incident_date) },
            { label: "Severity", render: (s) => s.severity },
            { label: "Status", render: (s) => s.status },
            { label: "Description", render: (s) => s.description },
            { label: "Resolved", render: (s) => formatDate(s.resolved_at) },
          ]}
        />
      </div>
    );
  }

  if (tab === "equipment") {
    return (
      <SiteRecordsTable
        rows={siteProfile?.equipment ?? []}
        emptyLabel="No plant or equipment registered for this site yet."
        columns={[
          { label: "Name", render: (e) => e.name },
          { label: "Type", render: (e) => e.equipment_type },
          { label: "Capacity", render: (e) => e.capacity },
          { label: "Status", render: (e) => e.status },
          { label: "Last Serviced", render: (e) => formatDate(e.last_serviced_at) },
        ]}
      />
    );
  }

  if (tab === "production") {
    return (
      <SiteRecordsTable
        rows={siteProfile?.production_records ?? []}
        emptyLabel="No production records logged for this site yet."
        columns={[
          { label: "Date", render: (p) => formatDate(p.record_date) },
          { label: "Mineral", render: (p) => p.mineral_type },
          { label: "Quantity", render: (p) => (p.quantity ? `${p.quantity} ${p.unit || ""}`.trim() : null) },
          { label: "Extraction Method", render: (p) => p.extraction_method },
          { label: "Notes", render: (p) => p.notes },
        ]}
      />
    );
  }

  if (tab === "sampling") {
    return (
      <SiteRecordsTable
        rows={siteProfile?.samples ?? []}
        emptyLabel="No samples or lab results submitted for this site yet."
        columns={[
          { label: "Sample Ref", render: (s) => s.sample_reference },
          { label: "Sampling Date", render: (s) => formatDate(s.sampling_date) },
          { label: "Method", render: (s) => s.sampling_method },
          { label: "Laboratory", render: (s) => s.laboratory_result?.laboratory_name },
          { label: "Grade", render: (s) => (s.laboratory_result?.grade_percentage ? `${s.laboratory_result.grade_percentage}%` : null) },
          { label: "Result Summary", render: (s) => s.laboratory_result?.result_summary },
        ]}
      />
    );
  }

  // inspection
  return (
    <SiteRecordsTable
      rows={siteProfile?.inspections ?? []}
      emptyLabel="No site inspections logged yet."
      columns={[
        { label: "Scheduled", render: (i) => formatDate(i.scheduled_date) },
        { label: "Visited", render: (i) => formatDate(i.visited_at) },
        { label: "Status", render: (i) => i.status },
        { label: "Outcome", render: (i) => (i.outcome ? i.outcome.replace(/_/g, " ") : null) },
        { label: "Findings", render: (i) => i.findings },
      ]}
    />
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
  const [activeTab, setActiveTab] = useState<CaseReviewTab>("corporate");
  const [docSearch, setDocSearch] = useState("");
  const [docViewMode, setDocViewMode] = useState<"list" | "grid">("list");
  const [licenseStatusFilter, setLicenseStatusFilter] = useState<"all" | "verified" | "issues_found" | "rejected">("all");
  const [esgStatusFilter, setEsgStatusFilter] = useState<"all" | "approved" | "in_progress" | "not_initiated">("all");
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
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
    setActiveTab("corporate");
    setScreen("detail");
    setOpenMenuRowId(null);
    setSelectedSiteId(null);
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
  const minerSites = ((minerDetail as { sites?: MinerSiteRecord[] } | undefined)?.sites) ?? [];
  const documentRecords = minerDetail?.documents ?? [];
  const esgReviews = minerDetail?.esg_reviews ?? [];
  const activityLogs = minerDetail?.activity_logs ?? [];

  useEffect(() => {
    if (!selectedSiteId && minerSites.length > 0) {
      setSelectedSiteId(minerSites[0].id);
    }
  }, [selectedSiteId, minerSites]);

  const siteProfileQ = useQuery({
    queryKey: ["complianceSiteSourceProfile", selectedSiteId],
    queryFn: () => getComplianceMiningSiteSourceProfile(selectedSiteId!),
    enabled: Boolean(selectedSiteId),
  });
  const siteProfile = siteProfileQ.data?.data;
  const selectedSite = minerSites.find((s) => s.id === selectedSiteId) ?? null;

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
          <h1 className="text-[34px] font-semibold tracking-[-0.02em] text-[#1f2430]">Reviews</h1>

          <div className="rounded-[24px] bg-white/60 p-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[18px] border border-[#eef1f6] bg-white p-5 shadow-[0_10px_30px_-24px_rgba(16,30,61,0.35)]">
                <div className="flex items-center gap-2.5">
                  <HourglassOutlined className="text-[18px] text-[#3f4654]" />
                  <span className="text-[15px] font-medium text-[#3f4654]">Pending reviews</span>
                </div>
                <div className="mt-6 text-[38px] font-bold leading-none tracking-[-0.03em] text-[#1f2430]">
                  {pendingReviewsCount}
                </div>
                <div className="mt-4 text-[13px] text-[#9aa1af]">Awaiting review</div>
              </div>

              <div className="rounded-[18px] border border-[#eef1f6] bg-white p-5 shadow-[0_10px_30px_-24px_rgba(16,30,61,0.35)]">
                <div className="flex items-center gap-2.5">
                  <ExclamationCircleOutlined className="text-[18px] text-[#ef2f32]" />
                  <span className="text-[15px] font-medium text-[#3f4654]">High Risk</span>
                </div>
                <div className="mt-6 flex items-end justify-between gap-3">
                  <div className="text-[38px] font-bold leading-none tracking-[-0.03em] text-[#1f2430]">
                    {highRiskCount}
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f3f7] text-[13px] text-[#687081]">
                    <ArrowRightOutlined className="-rotate-45" />
                  </span>
                </div>
                <div className="mt-4 text-[13px] text-[#9aa1af]">Require immediate attention</div>
              </div>

              <div className="rounded-[18px] border border-[#eef1f6] bg-white p-5 shadow-[0_10px_30px_-24px_rgba(16,30,61,0.35)]">
                <div className="flex items-center gap-2.5">
                  <CalendarOutlined className="text-[18px] text-[#3f4654]" />
                  <span className="text-[15px] font-medium text-[#3f4654]">Due Today</span>
                </div>
                <div className="mt-6 flex items-end justify-between gap-3">
                  <div className="text-[38px] font-bold leading-none tracking-[-0.03em] text-[#1f2430]">2</div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f3f7] text-[13px] text-[#687081]">
                    <ArrowRightOutlined className="-rotate-45" />
                  </span>
                </div>
                <div className="mt-4 text-[13px] text-[#9aa1af]">Review due today</div>
              </div>

              <div className="rounded-[18px] border border-[#eef1f6] bg-white p-5 shadow-[0_10px_30px_-24px_rgba(16,30,61,0.35)]">
                <div className="flex items-center gap-2.5">
                  <ClockCircleOutlined className="text-[18px] text-[#3f4654]" />
                  <span className="text-[15px] font-medium text-[#3f4654]">Average Completion</span>
                </div>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[38px] font-bold leading-none tracking-[-0.03em] text-[#1f2430]">
                      {averageCompletion}%
                    </div>
                    <div className="mt-4 flex items-center gap-1 whitespace-nowrap text-[13px] font-medium text-[#1ea43b]">
                      <RiseOutlined className="text-[12px]" />
                      Across all reviews
                    </div>
                  </div>
                  <ScoreRing
                    value={averageCompletion}
                    size={62}
                    strokeWidth={7}
                    color="#18b829"
                    trackColor="#e8ecf2"
                    showValue={false}
                  />
                </div>
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
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#14244a] px-1.5 text-[11px] font-semibold !text-white">
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
                            className="px-4 py-3 font-medium text-[#2661d8]"
                            title="Illustrative - no industry/sector field exists on reviews yet"
                          >
                            Mining
                          </td>
                          <td className="px-4 py-3">
                            <span className={classNames("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", riskStyle.container)}>
                              {row.riskLevel.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="w-[110px]">
                              <div className="text-[11px] font-medium text-[#5d6675]">{row.complianceScore}%</div>
                              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#e8ecf2]">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${row.complianceScore}%`, backgroundColor: progressColor }}
                                />
                              </div>
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
                            title="Illustrative - no due-date field exists on reviews yet"
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
            <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-7 sm:py-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1d2b4f] to-[#3f6fd8] text-[15px] font-semibold !text-white sm:h-14 sm:w-14 sm:text-[17px]">
                  {getInitials(selectedRow.company, selectedRow.company.slice(0, 2).toUpperCase())}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[19px] font-semibold tracking-[-0.02em] text-[#1f2430] sm:text-[26px]">
                      {selectedRow.company}
                    </span>
                    <span
                      className="rounded-full bg-[#e8f0fe] px-3 py-1 text-[13px] font-medium text-[#2661d8]"
                      title="Illustrative - no industry/sector field exists on the backend yet"
                    >
                      Mining
                    </span>
                    <span
                      className={classNames(
                        "rounded-full px-3 py-1 text-[13px] font-medium",
                        selectedRow.riskLevel.tone === "red"
                          ? "bg-[#ffeaec] text-[#ef2f32]"
                          : selectedRow.riskLevel.tone === "amber"
                            ? "bg-[#fff4df] text-[#df8b19]"
                            : selectedRow.riskLevel.tone === "green"
                              ? "bg-[#e9faef] text-[#1ea43b]"
                              : "bg-[#f1f3f7] text-[#6b7280]",
                      )}
                    >
                      {selectedRow.riskLevel.label}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[14px] text-[#8a92a1]">
                    <span>
                      Case ID: <span className="text-[#5d6675]">{selectedRow.minerId}</span>
                    </span>
                    <span className="text-[#c7ccd6]">&bull;</span>
                    <span>
                      Submitted: <span className="text-[#5d6675]">{formatDate(selectedRow.createdAt)}</span>
                    </span>
                    <span className="text-[#c7ccd6]">&bull;</span>
                    <span>
                      Assigned: <span className="text-[#5d6675]">{selectedRow.reviewer}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <button type="button" onClick={handleExport} className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[#e5e9f1] bg-white px-3 text-[13px] font-medium text-[#2b3140] hover:bg-[#f7f9fc] sm:h-11 sm:px-4 sm:text-[14px]">
                  Export <DownloadOutlined />
                </button>
                <button type="button" onClick={() => handleShare()} className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[#e5e9f1] bg-white px-3 text-[13px] font-medium text-[#2b3140] hover:bg-[#f7f9fc] sm:h-11 sm:px-4 sm:text-[14px]">
                  Share <ShareAltOutlined />
                </button>
                <button type="button" onClick={handlePrint} className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[#e5e9f1] bg-white px-3 text-[13px] font-medium text-[#2b3140] hover:bg-[#f7f9fc] sm:h-11 sm:px-4 sm:text-[14px]">
                  Print <PrinterOutlined />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-0 overflow-x-auto border-t border-[#edf1f7] px-4 sm:px-7">
              {CASE_REVIEW_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={classNames("whitespace-nowrap border-b-2 px-3 py-3 text-[13px] transition-colors sm:px-5 sm:py-4 sm:text-[15px]",
                    activeTab === tab.key
                      ? "border-[#1f2430] font-semibold text-[#1f2430]"
                      : "border-transparent font-normal text-[#8a92a1] hover:text-[#2a2f39]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[13px] text-[#8a92a1]">
                  <EnvironmentOutlined />
                  <span className="font-semibold text-[#2a2f39]">
                    {selectedSite?.name || siteProfile?.name || (minerDetailQ.isLoading ? "Loading site..." : "No site on file")}
                  </span>
                  {selectedSite ? (
                    <span className="rounded-full border border-[#dce3ef] bg-[#fafbfd] px-3 py-1 text-[12px] font-medium capitalize text-[#5d6675]">
                      {(siteProfile?.status || selectedSite.status || "").replace(/_/g, " ") || "Active"}
                    </span>
                  ) : null}
                </div>

                {minerSites.length > 1 ? (
                  <select
                    value={selectedSiteId ?? ""}
                    onChange={(e) => setSelectedSiteId(e.target.value || null)}
                    className="h-9 rounded-[10px] border border-[#dce3ef] bg-white px-3 text-[13px] text-[#2a2f39] outline-none"
                  >
                    {minerSites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>

              {activeTab === "documents" ? (
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
                          docViewMode === "list" ? "bg-[#14244a] !text-white" : "text-[#5d6675]",
                        )}
                      >
                        <UnorderedListOutlined /> List
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocViewMode("grid")}
                        className={classNames(
                          "inline-flex h-8 items-center gap-1.5 rounded-[8px] px-3 text-[12px] font-medium transition-colors",
                          docViewMode === "grid" ? "bg-[#14244a] !text-white" : "text-[#5d6675]",
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
                                      status: isVerifiedStatus(doc.status) ? "pending" : "verified",
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
                                          status: isVerifiedStatus(doc.status) ? "pending" : "verified",
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
              ) : !selectedSiteId ? (
                <div className="rounded-[18px] border border-dashed border-[#dce3ef] bg-[#fafbfd] px-5 py-6 text-[14px] leading-6 text-[#7b8392]">
                  {minerDetailQ.isLoading ? "Loading sites..." : "No mining sites were returned by the miner detail endpoint for this miner yet."}
                </div>
              ) : siteProfileQ.isLoading ? (
                <div className="rounded-[18px] border border-dashed border-[#dce3ef] bg-[#fafbfd] px-5 py-6 text-[14px] leading-6 text-[#7b8392]">
                  Loading site record...
                </div>
              ) : (
                <SiteSubTabPanel
                  tab={activeTab}
                  miner={miner}
                  selectedSite={selectedSite}
                  siteProfile={siteProfile}
                  licenses={licenses}
                  esgReviews={esgReviews}
                />
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
                    className="inline-flex h-10 items-center gap-2 bg-[#14244a] px-4 text-[13px] font-semibold !text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircleOutlined /> Approve Compliance
                  </button>
                  <button
                    type="button"
                    title="No approval variants are supported by the compliance workflow yet."
                    onClick={() => showToast("Only a standard approval is supported today.", "info")}
                    className="flex h-10 w-8 items-center justify-center border-l border-white/20 bg-[#14244a] !text-white hover:bg-[#1c2f5c]"
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
                className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#ef2f32] px-4 text-[13px] font-semibold !text-white disabled:cursor-not-allowed disabled:opacity-60"
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
