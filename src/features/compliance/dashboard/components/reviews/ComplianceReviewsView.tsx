"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  SearchOutlined,
  DownOutlined,
  CalendarOutlined,
  UserOutlined,
  RiseOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  PrinterOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  HistoryOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import type { AdminReviewRow } from "@/src/features/compliance/dashboard/types";
import { classNames, primaryActionStyle } from "@/src/features/compliance/dashboard/lib/style";
import { showToast } from "@/src/store/toast.store";
import {
  getComplianceMinerDetail,
  verifyMinerLicense,
  verifyMinerDocument,
} from "@/src/features/compliance/dashboard/api";
import { getApiErrorMessage } from "@/src/features/compliance/dashboard/lib/documents";
import {
  type CaseReviewTab,
  CASE_REVIEW_TABS,
} from "@/src/features/compliance/dashboard/components/reviews/constants";
import {
  CASE_OPERATIONAL_ITEMS,
  CASE_EXPORT_ITEMS,
  CaseChecklistCard,
  OverviewMetricTile,
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

function MarkVerifiedToggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={classNames(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        disabled ? "opacity-60" : "",
        checked ? "bg-[#1ea43b]" : "bg-[#dbe2ee]",
      )}
    >
      <span
        className={classNames(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-1",
        )}
      />
    </button>
  );
}

export default function ComplianceReviewsView({
  rows,
  onOpenReview,
}: {
  rows: AdminReviewRow[];
  onOpenReview?: (reviewId: string) => void;
}) {
  const [selectedRow, setSelectedRow] = useState<AdminReviewRow | null>(rows[0] ?? null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<CaseReviewTab>("overview");
  const [docSearch, setDocSearch] = useState("");
  const [docViewMode, setDocViewMode] = useState<"list" | "grid">("list");
  const queryClient = useQueryClient();

  const filteredRows = rows.filter((r) =>
    search.trim()
      ? r.company.toLowerCase().includes(search.toLowerCase()) ||
        r.minerId.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const handleSelect = (row: AdminReviewRow) => {
    setSelectedRow(row);
    setActiveTab("overview");
    onOpenReview?.(row.id);
  };

  useEffect(() => {
    if (!selectedRow && rows[0]) {
      setSelectedRow(rows[0]);
    }
  }, [rows, selectedRow]);

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

  return (
    <div className="flex h-[calc(100vh-140px)] gap-0 overflow-hidden rounded-[24px] border border-[#e8ecf4] bg-white shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
      {/* Left panel */}
      <div className="flex w-[300px] shrink-0 flex-col border-r border-[#e8ecf4]">
        <div className="flex items-center justify-between border-b border-[#e8ecf4] px-4 py-4">
          <span className="text-[15px] font-semibold text-[#2a2f39]">Assigned Reviews</span>
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#14244a] text-[11px] font-semibold text-white">
            {rows.length}
          </span>
        </div>

        <div className="px-3 py-2">
          <div className="relative">
            <SearchOutlined className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a6b3] text-[12px]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company or case..."
              className="h-8 w-full rounded-[8px] border border-[#e8ecf4] bg-[#fafbfe] pl-8 pr-3 text-[12px] text-[#2d3441] outline-none placeholder:text-[#a0a6b3]"
            />
          </div>
          <div className="mt-2 flex gap-1.5">
            {["Status", "Risk", "Region"].map((f) => (
              <button key={f} type="button" className="inline-flex h-7 items-center gap-1 rounded-[6px] border border-[#e8ecf4] bg-white px-2.5 text-[11px] font-medium text-[#5d6675]">
                {f} <DownOutlined className="text-[9px]" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredRows.map((row) => {
            const isSelected = selectedRow?.id === row.id;
            const mineral = row.minerId.includes("00231") ? "Lithium" : row.minerId.includes("00228") ? "Cobalt" : row.minerId.includes("00219") ? "Gold" : "Copper";
            const stage = row.reviewStatus.label === "Under review" ? "Environmental Review" : row.reviewStatus.label === "Pending" ? "Licensing" : "Document Verification";
            const waitTime = row.lastActionDate === "Today" ? "2h ago" : row.lastActionDate === "Yesterday" ? "5h ago" : "1d ago";
            const openDays = row.minerId.includes("00231") ? "14d open" : row.minerId.includes("00228") ? "7d open" : row.minerId.includes("00219") ? "3d open" : "21d open";
            const progress = row.complianceScore;
            const dotColor = row.riskLevel.tone === "red" ? "bg-[#ef2f32]" : row.riskLevel.tone === "amber" ? "bg-[#f3a000]" : "bg-[#1ea43b]";

            return (
              <button
                key={row.id}
                type="button"
                onClick={() => handleSelect(row)}
                className={classNames(
                  "w-full border-b border-[#f0f3f8] px-4 py-3 text-left transition-colors",
                  isSelected ? "bg-[#f0f5ff]" : "hover:bg-[#fafbfe]"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={classNames("mt-1 h-2 w-2 shrink-0 rounded-full", dotColor)} />
                      <span className="truncate text-[13px] font-semibold text-[#2a2f39]">{row.company}</span>
                    </div>
                    <div className="mt-0.5 pl-3.5 text-[11px] text-[#8a92a1]">{row.minerId} · {mineral}</div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1 pl-3.5">
                  <span className={classNames("rounded-full px-2 py-0.5 text-[10px] font-semibold", row.riskLevel.tone === "red" ? "bg-[#fff0f1] text-[#ef2f32]" : row.riskLevel.tone === "amber" ? "bg-[#fff4df] text-[#df8b19]" : "bg-[#ecfaf0] text-[#1ea43b]")}>
                    {row.riskLevel.label}
                  </span>
                  {row.reviewStatus.label === "Under review" && (
                    <span className="rounded-full bg-[#fff0f1] px-2 py-0.5 text-[10px] font-semibold text-[#ef2f32]">Urgent</span>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between pl-3.5 text-[11px] text-[#8a92a1]">
                  <span>{stage}</span>
                  <span>{openDays}</span>
                </div>
                <div className="mt-1.5 pl-3.5">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e8ecf2]">
                    <div className="h-full rounded-full bg-[#14244a]" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-[#8a92a1]">
                    <span>{progress}% complete</span>
                    <span>{waitTime}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel */}
      {selectedRow ? (
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1f7] px-6 py-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[20px] font-bold text-[#2a2f39]">{selectedRow.company}</span>
                <span className="rounded-[6px] border border-[#e5e9f1] bg-[#f7f9fc] px-2.5 py-0.5 text-[12px] font-medium text-[#5d6675]">Case {selectedRow.minerId}</span>
                <span className={classNames("rounded-full px-2.5 py-0.5 text-[12px] font-semibold", selectedRow.riskLevel.tone === "red" ? "text-[#ef2f32]" : "text-[#df8b19]")}>
                  {selectedRow.riskLevel.label} Risk
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-[12px] text-[#8a92a1]">
                <span className="inline-flex items-center gap-1"><CalendarOutlined /> Submitted Jan 08, 2026</span>
                <span className="inline-flex items-center gap-1"><UserOutlined /> Reviewer: {selectedRow.reviewer}</span>
                <span className="inline-flex items-center gap-1 text-[#df8b19]"><RiseOutlined /> Score: {selectedRow.complianceScore}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[{ icon: <DownloadOutlined />, label: "Export" }, { icon: <ShareAltOutlined />, label: "Share" }, { icon: <PrinterOutlined />, label: "Print" }].map((btn) => (
                <button key={btn.label} type="button" className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-[#e5e9f1] bg-white px-3 text-[12px] font-medium text-[#2b3140] hover:bg-[#f7f9fc]">
                  {btn.icon} {btn.label}
                </button>
              ))}
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
          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === "overview" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Compliance Score", value: `${selectedRow.complianceScore}%`, sub: "Threshold: 85%", valueClass: "text-[#df8b19]" },
                    { label: "Risk Score", value: selectedRow.riskLevel.label, sub: "3 critical flags", valueClass: "text-[#ef2f32]" },
                    { label: "Open Issues", value: String(licenses.filter((l) => !isVerifiedStatus(l.verification_status)).length + documentRecords.filter((d) => !isVerifiedStatus(d.status)).length), sub: "Unverified licenses & documents" },
                    { label: "Documents Verified", value: `${documentRecords.filter((d) => isVerifiedStatus(d.status)).length} / ${documentRecords.length || "-"}`, sub: `${licenses.filter((l) => isVerifiedStatus(l.verification_status)).length} / ${licenses.length || "-"} licenses verified` },
                  ].map((m) => (
                    <OverviewMetricTile key={m.label} label={m.label} value={m.value} valueClassName={m.valueClass} footnote={m.sub} />
                  ))}
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
                  <div className="rounded-[14px] border border-[#e8ecf4] bg-white p-5">
                    <div className="text-[14px] font-semibold text-[#2a2f39]">Company Profile</div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 text-[13px]">
                      {[
                        { label: "Company", value: selectedRow.company },
                        { label: "Business Role", value: miner?.business_role || "N/A" },
                        { label: "Country", value: miner?.country || "N/A" },
                        { label: "Mine Location", value: selectedRow.location || "N/A" },
                        { label: "Mineral Type", value: miner?.mineral_type || "N/A" },
                        { label: "Mining Method", value: miner?.mining_method || "N/A" },
                        { label: "License Number", value: miner?.license_number || "N/A" },
                        { label: "Issuing Authority", value: miner?.issuing_authority || "N/A" },
                        { label: "Current Reviewer", value: `${selectedRow.reviewer} (Compliance Officer)` },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="text-[#8a92a1]">{item.label}</div>
                          <div className="mt-0.5 font-medium text-[#2a2f39]">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-[14px] border border-[#e8ecf4] bg-white p-4">
                      <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#2a2f39]">
                        <EnvironmentOutlined className="text-[#2661d8]" /> Mine Location
                      </div>
                      <div className="mt-3 flex h-[100px] items-center justify-center rounded-[10px] bg-[#f4f7fb] text-[#8a92a1]">
                        <div className="text-center">
                          <EnvironmentOutlined className="text-[20px]" />
                          <div className="mt-1 text-[11px]">{selectedRow.location || "Location not on file"}</div>
                          <div className="text-[10px]">{miner?.country || ""}</div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[14px] border border-[#e8ecf4] bg-white p-4">
                      <div className="text-[13px] font-semibold text-[#2a2f39]">Review Progress</div>
                      <div className="mt-3 space-y-2.5">
                        {[
                          {
                            label: "Licensing",
                            value: licenses.length
                              ? Math.round((licenses.filter((l) => isVerifiedStatus(l.verification_status)).length / licenses.length) * 100)
                              : 0,
                          },
                          {
                            label: "Documents",
                            value: documentRecords.length
                              ? Math.round((documentRecords.filter((d) => isVerifiedStatus(d.status)).length / documentRecords.length) * 100)
                              : 0,
                          },
                          {
                            label: "Environmental & ESG",
                            value: esgReviews.length
                              ? Math.round((esgReviews.filter((e) => (e.status ?? "").toLowerCase() === "approved").length / esgReviews.length) * 100)
                              : 0,
                          },
                        ].map((r) => (
                          <div key={r.label}>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-[#5d6675]">{r.label}</span>
                              <span className={classNames("font-medium", r.value === 100 ? "text-[#1ea43b]" : r.value >= 40 ? "text-[#df8b19]" : "text-[#2a2f39]")}>{r.value}%</span>
                            </div>
                            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#e8ecf2]">
                              <div className={classNames("h-full rounded-full", r.value === 100 ? "bg-[#1ea43b]" : r.value >= 40 ? "bg-[#df8b19]" : "bg-[#e8ecf2]")} style={{ width: `${r.value}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : activeTab === "licensing" ? (
              <div className="space-y-4">
                {licenses.length > 0 ? (
                  licenses.map((doc) => {
                    const isVerified = isVerifiedStatus(doc.verification_status);
                    return (
                      <div
                        key={doc.id}
                        className="flex flex-col gap-4 rounded-[18px] border border-[#e8ecf4] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#f4f7fb] text-[16px] text-[#5e6777]">
                            <FileTextOutlined />
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[15px] font-semibold text-[#2a2f39]">{doc.license_type || "License"}</span>
                              <span className={classNames("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", licensingToneClass(doc.verification_status))}>
                                {doc.verification_status || "Pending Review"}
                              </span>
                            </div>
                            <div className="mt-1 text-[12px] text-[#8a92a1]">
                              Ref: {doc.license_number || "N/A"} · Issued by {doc.issuing_authority || "N/A"} · Expires {formatDate(doc.expiry_date)}
                            </div>
                            <div className="mt-1 text-[12px] text-[#a0a7b5]">
                              {doc.verified_by ? `Verified by ${doc.verified_by} · ${formatDateTime(doc.verified_at)}` : "Not yet verified"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {doc.document ? (
                              <a href={doc.document} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e8ecf4] text-[14px] text-[#7b8392] hover:bg-[#f7f9fc]">
                                <EyeOutlined />
                              </a>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-medium text-[#5d6675]">Mark verified</span>
                            <MarkVerifiedToggle
                              checked={isVerified}
                              disabled={verifyLicenseMutation.isPending}
                              onChange={(next) =>
                                verifyLicenseMutation.mutate({
                                  licenseId: doc.id,
                                  verification_status: next ? "Verified" : "Pending Review",
                                })
                              }
                            />
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
            <div className="flex items-center gap-5 text-[12px]">
              <div>
                <div className="text-[#8a92a1]">Compliance Score</div>
                <div className="text-[20px] font-bold text-[#df8b19]">{selectedRow.complianceScore}%</div>
              </div>
              <div>
                <div className="text-[#8a92a1]">Decision Status</div>
                <div className="text-[13px] font-semibold text-[#df8b19]">Under Review</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#f6e3bf] bg-[#fff4df] px-4 text-[13px] font-medium text-[#a5680c]">
                <InfoCircleOutlined /> Request Information
              </button>
              <button type="button" className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#f3c2c4] bg-white px-4 text-[13px] font-medium text-[#ef2f32]">
                <CloseOutlined /> Reject Application
              </button>
              <button type="button" className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#14244a] px-4 text-[13px] font-semibold text-white" style={primaryActionStyle}>
                <CheckCircleOutlined /> Approve Compliance
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-[14px] text-[#8a92a1]">
          Select a review from the list
        </div>
      )}
    </div>
  );
}

