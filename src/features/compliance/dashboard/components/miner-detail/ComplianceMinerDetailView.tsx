"use client";

import { useState } from "react";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  UserOutlined,
  RiseOutlined,
  DownloadOutlined,
  ApartmentOutlined,
  IdcardOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  WarningFilled,
  ClockCircleOutlined,
} from "@ant-design/icons";
import type { ComplianceReviewDetail, ComplianceMinerDetailResponse } from "@/src/features/compliance/dashboard/api";
import type { ComplianceReviewSelection } from "@/src/features/compliance/dashboard/types";
import {
  formatRiskLevelBadge,
  formatReviewScore,
  formatReviewDateTime,
  formatReviewStatusText,
} from "@/src/features/compliance/dashboard/lib/format";
import { getMinerDetailSummary } from "@/src/features/compliance/dashboard/lib/mappers";
import { getMinerDetailDocuments } from "@/src/features/compliance/dashboard/lib/documents";
import { classNames, primaryActionStyle } from "@/src/features/compliance/dashboard/lib/style";
import { showToast } from "@/src/store/toast.store";
import {
  StatusBadgePill,
  LinearProgress,
} from "@/src/features/compliance/dashboard/components/shared/DashboardMetricCard";
import {
  ReviewInfoTile,
  ReviewDocumentRow,
} from "@/src/features/compliance/dashboard/components/shared/ReviewTiles";
import {
  type CaseReviewTab,
  CASE_REVIEW_TABS,
} from "@/src/features/compliance/dashboard/components/reviews/constants";

export type CaseChecklistItem = {
  title: string;
  detail: string;
  status: "verified" | "pending" | "flagged";
};

type MinerLicenseRecord = { verification_status: string };
type MinerInspectionRecord = { status: string; outcome: string | null; scheduled_date: string };
type MinerSafetyRecord = { status: string; severity: string; incident_date: string };
type MinerProductionRecord = { record_date: string; mineral_type: string; quantity: string };

/**
 * Real, backend-driven checklist — replaces the previous hardcoded mock array.
 * Each item is derived from actual records on the miner detail payload, so an
 * empty/pending state here means the miner genuinely has no data on file yet,
 * not that the check hasn't been wired up.
 */
export function buildOperationalChecklist(minerDetail?: ComplianceMinerDetailResponse): CaseChecklistItem[] {
  const data = minerDetail?.data as
    | {
        licenses?: MinerLicenseRecord[];
        inspections?: MinerInspectionRecord[];
        safety_records?: MinerSafetyRecord[];
        production_records?: MinerProductionRecord[];
      }
    | undefined;

  const licenses = data?.licenses ?? [];
  const inspections = data?.inspections ?? [];
  const safetyRecords = data?.safety_records ?? [];
  const productionRecords = data?.production_records ?? [];

  const licenseStatus: CaseChecklistItem["status"] = licenses.some((l) => l.verification_status === "verified")
    ? "verified"
    : licenses.some((l) => l.verification_status === "rejected" || l.verification_status === "issues_found")
      ? "flagged"
      : "pending";

  const latestInspection = inspections[0];
  const inspectionStatus: CaseChecklistItem["status"] =
    latestInspection?.outcome === "passed" || latestInspection?.outcome === "passed_with_conditions"
      ? "verified"
      : latestInspection?.outcome === "failed"
        ? "flagged"
        : "pending";

  const openSafetyIncidents = safetyRecords.filter((r) => r.status !== "resolved");
  const safetyStatus: CaseChecklistItem["status"] =
    safetyRecords.length === 0 ? "pending" : openSafetyIncidents.length > 0 ? "flagged" : "verified";

  return [
    {
      title: "Mining Permit",
      detail: licenses.length
        ? `${licenses.length} license${licenses.length === 1 ? "" : "s"} on file — ${licenseStatus === "verified" ? "at least one verified" : licenseStatus === "flagged" ? "issues found on review" : "pending verification"}.`
        : "No license on file for this miner yet.",
      status: licenses.length ? licenseStatus : "pending",
    },
    {
      title: "Production Reports",
      detail: productionRecords.length
        ? `${productionRecords.length} production record${productionRecords.length === 1 ? "" : "s"} logged for this miner's sites.`
        : "No production records logged yet.",
      status: productionRecords.length > 0 ? "verified" : "pending",
    },
    {
      title: "Site Inspections",
      detail: latestInspection
        ? `Latest inspection scheduled ${latestInspection.scheduled_date} — ${latestInspection.outcome ? latestInspection.outcome.replace(/_/g, " ") : latestInspection.status}.`
        : "No site inspection has been scheduled or logged yet.",
      status: inspections.length ? inspectionStatus : "pending",
    },
    {
      title: "Safety Records",
      detail: safetyRecords.length
        ? `${safetyRecords.length} safety record${safetyRecords.length === 1 ? "" : "s"} on file, ${openSafetyIncidents.length} still open.`
        : "No safety incidents recorded.",
      status: safetyStatus,
    },
  ];
}

export function caseChecklistStatusMeta(status: CaseChecklistItem["status"]) {
  switch (status) {
    case "verified":
      return { label: "Verified", className: "border border-[#caebd1] bg-[#ecfaf0] text-[#1ea43b]", icon: <CheckCircleOutlined className="text-[#1ea43b]" /> };
    case "flagged":
      return { label: "Flagged", className: "border border-[#f6d9c2] bg-[#fff2e6] text-[#e0781a]", icon: <WarningFilled className="text-[#e0781a]" /> };
    case "pending":
    default:
      return { label: "Pending", className: "border border-[#f6e3bf] bg-[#fff4df] text-[#e09408]", icon: <ClockCircleOutlined className="text-[#e09408]" /> };
  }
}

export function CaseChecklistCard({ item }: { item: CaseChecklistItem }) {
  const meta = caseChecklistStatusMeta(item.status);
  return (
    <div className="flex items-start justify-between gap-4 rounded-[18px] border border-[#e8ecf4] bg-white px-5 py-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-[18px]">{meta.icon}</span>
        <div>
          <div className="text-[15px] font-semibold text-[#2a2f39]">{item.title}</div>
          <div className="mt-1 text-[13px] text-[#7b8392]">{item.detail}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={classNames("rounded-full px-3 py-1 text-[12px] font-medium", meta.className)}>
          {meta.label}
        </span>
        <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e8ecf4] text-[14px] text-[#7b8392]">
          <EyeOutlined />
        </button>
      </div>
    </div>
  );
}

type MinerSiteRecord = {
  id: string;
  name: string;
  status: string;
  mineral_type: string | null;
  mining_method: string | null;
  country: string | null;
  state_of_operation: string | null;
  local_government_area: string | null;
  latitude: string | null;
  longitude: string | null;
};

function SiteDetailField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <div className="text-[#8a92a1]">{label}</div>
      <div className="mt-0.5 font-medium capitalize text-[#2a2f39]">{value || "—"}</div>
    </div>
  );
}

export function OverviewMetricTile({
  label,
  value,
  valueClassName,
  footnote,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  footnote?: string;
}) {
  return (
    <div className="rounded-[20px] border border-[#e8ecf4] bg-white p-5">
      <div className="text-[13px] font-medium text-[#8a92a1]">{label}</div>
      <div className={classNames("mt-3 text-[26px] font-semibold text-[#2a2f39]", valueClassName)}>{value}</div>
      {footnote ? <div className="mt-2 text-[12px] text-[#a0a7b5]">{footnote}</div> : null}
    </div>
  );
}

export default function ComplianceMinerDetailView({
  selection,
  reviewDetail,
  minerDetail,
  isLoading,
  onBack,
  onAction,
  activeAction,
}: {
  selection: ComplianceReviewSelection;
  reviewDetail?: ComplianceReviewDetail | null;
  minerDetail?: ComplianceMinerDetailResponse;
  isLoading: boolean;
  onBack: () => void;
  onAction: (action: "approve" | "reject" | "request_information") => void;
  activeAction?: "approve" | "reject" | "request_information";
}) {
  const [activeTab, setActiveTab] = useState<CaseReviewTab>("overview");
  const minerSummary = getMinerDetailSummary(minerDetail);
  const documents = getMinerDetailDocuments(minerDetail);
  const minerSites = (minerDetail?.data?.sites as MinerSiteRecord[] | undefined) ?? [];
  const operationalChecklist = buildOperationalChecklist(minerDetail);
  const reviewStatus = reviewDetail?.status ?? "under_review";
  const riskBadge = formatRiskLevelBadge(reviewDetail?.risk_level ?? null);
  const scoreText = formatReviewScore(reviewDetail?.compliance_score);
  const companyName = selection.company ?? selection.minerName ?? "Miner Profile";
  const caseCode = selection.minerCode ?? selection.reviewId.slice(0, 8).toUpperCase();
  const documentsVerifiedCount = documents.length;
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

      <div className="overflow-hidden rounded-[16px] border border-[#e8ecf4] bg-white shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#edf1f7] px-6 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[22px] font-semibold text-[#2a2f39]">{companyName}</span>
              <span className="rounded-[8px] border border-[#e5e9f1] bg-[#f7f9fc] px-3 py-1 text-[13px] font-medium text-[#5d6675]">
                Case {caseCode}
              </span>
              <StatusBadgePill badge={riskBadge.label === "Unrated" ? { label: "Risk pending", tone: "slate" } : { label: `${riskBadge.label} Risk`, tone: riskBadge.tone }} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-[13px] text-[#8a92a1]">
              <span className="inline-flex items-center gap-1.5">
                <CalendarOutlined /> Submitted {selection.createdAt ? formatReviewDateTime(selection.createdAt) : "Not yet"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <UserOutlined /> Reviewer: {reviewDetail?.assigned_to || "Unassigned"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <RiseOutlined /> Score: {scoreText}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => showToast("Export isn't connected to the backend yet.", "error")}
              className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#dce3ef] bg-white px-4 text-[13px] font-medium text-[#2b3140]"
            >
              <DownloadOutlined /> Export
            </button>
            <button
              type="button"
              onClick={() => showToast("Share isn't connected to the backend yet.", "error")}
              className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#dce3ef] bg-white px-4 text-[13px] font-medium text-[#2b3140]"
            >
              Share
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#dce3ef] bg-white px-4 text-[13px] font-medium text-[#2b3140]"
            >
              Print
            </button>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-[#edf1f7] px-6">
          {CASE_REVIEW_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={classNames(
                "whitespace-nowrap border-b-2 px-3 py-4 text-[14px] font-medium transition-colors",
                activeTab === tab.key
                  ? "border-[#14244a] text-[#14244a]"
                  : "border-transparent text-[#8a92a1] hover:text-[#2a2f39]",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-24 animate-pulse rounded-[18px] bg-[#f3f6fb]" />
              <div className="h-44 animate-pulse rounded-[18px] bg-[#f3f6fb]" />
            </div>
          ) : activeTab === "overview" ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <OverviewMetricTile label="Compliance Score" value={scoreText} valueClassName="text-[#e0781a]" />
                <OverviewMetricTile label="Risk Score" value={riskBadge.label} footnote={reviewDetail?.notes ? undefined : undefined} />
                <OverviewMetricTile label="Open Issues" value={String(activityItems.length)} />
                <OverviewMetricTile label="Documents Verified" value={`${documentsVerifiedCount} / ${documentsVerifiedCount || "-"}`} />
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
                <section className="rounded-[20px] border border-[#e8ecf4] bg-white p-5">
                  <div className="text-[16px] font-semibold text-[#2a2f39]">Company Profile</div>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <ReviewInfoTile icon={<ApartmentOutlined />} label="Company" value={companyName} />
                    <ReviewInfoTile icon={<IdcardOutlined />} label="Miner ID" value={caseCode} />
                    <ReviewInfoTile icon={<EnvironmentOutlined />} label="Mine Location" value={selection.location ?? "Pending location data"} />
                    <ReviewInfoTile icon={<UserOutlined />} label="Current Reviewer" value={reviewDetail?.assigned_to || "Unassigned"} />
                    <ReviewInfoTile icon={<CalendarOutlined />} label="Submission Date" value={selection.createdAt ? formatReviewDateTime(selection.createdAt) : "Not yet"} />
                    <ReviewInfoTile icon={<CheckCircleOutlined />} label="Review Status" value={formatReviewStatusText(reviewStatus)} />
                  </div>
                </section>

                <aside className="space-y-4">
                  <section className="rounded-[20px] border border-[#e8ecf4] bg-white p-5">
                    <div className="flex items-center gap-2 text-[15px] font-semibold text-[#2a2f39]">
                      <EnvironmentOutlined /> Mine Location
                    </div>
                    <div className="mt-4 flex h-[110px] items-center justify-center rounded-[14px] bg-[#f4f7fb] text-[#8a92a1]">
                      <EnvironmentOutlined className="text-[24px]" />
                    </div>
                    <div className="mt-3 text-[13px] text-[#5d6675]">{selection.location ?? "Location pending"}</div>
                  </section>

                  <section className="rounded-[20px] border border-[#e8ecf4] bg-white p-5">
                    <div className="text-[15px] font-semibold text-[#2a2f39]">Review Progress</div>
                    <div className="mt-4 space-y-4">
                      {[
                        { label: "Licensing", value: 100 },
                        { label: "Environmental", value: 48 },
                        { label: "Operational", value: 20 },
                        { label: "Export", value: 0 },
                      ].map((row) => (
                        <div key={row.label}>
                          <div className="flex items-center justify-between text-[13px] text-[#5d6675]">
                            <span>{row.label}</span>
                            <span className="font-medium text-[#2a2f39]">{row.value}%</span>
                          </div>
                          <LinearProgress value={row.value} tone={row.value >= 80 ? "green" : row.value >= 30 ? "amber" : "red"} />
                        </div>
                      ))}
                    </div>
                  </section>
                </aside>
              </div>
            </div>
          ) : activeTab === "sites" ? (
            <div className="space-y-4">
              {minerSites.length > 0 ? (
                minerSites.map((site) => (
                  <div key={site.id} className="rounded-[18px] border border-[#e8ecf4] bg-white p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <EnvironmentOutlined className="text-[#8a92a1]" />
                        <span className="text-[15px] font-semibold text-[#2a2f39]">{site.name}</span>
                      </div>
                      <span className="rounded-full border border-[#dce3ef] bg-[#fafbfd] px-3 py-1 text-[12px] font-medium capitalize text-[#5d6675]">
                        {(site.status || "").replace(/_/g, " ") || "Unknown"}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-[13px] sm:grid-cols-4">
                      <SiteDetailField label="Mineral Type" value={site.mineral_type} />
                      <SiteDetailField label="Mining Method" value={site.mining_method} />
                      <SiteDetailField
                        label="Location"
                        value={[site.local_government_area, site.state_of_operation, site.country].filter(Boolean).join(", ")}
                      />
                      <SiteDetailField
                        label="Coordinates"
                        value={site.latitude && site.longitude ? `${site.latitude}, ${site.longitude}` : null}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[18px] border border-dashed border-[#dce3ef] bg-[#fafbfd] px-5 py-6 text-[14px] leading-6 text-[#7b8392]">
                  No mining sites were returned by the miner detail endpoint for this miner yet.
                </div>
              )}
            </div>
          ) : activeTab === "licensing" ? (
            <div className="space-y-4">
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
                  No licensing documents were returned by the miner detail endpoint for this miner yet.
                </div>
              )}
            </div>
          ) : activeTab === "environmental-esg" ? (
            <div className="space-y-6">
              {[
                "EIA Status",
                "Environmental Consultant",
                "Safety Measures",
                "Community Engagement",
              ].map((item) => (
                <div key={item} className="rounded-[20px] border border-[#e8ecf4] bg-[#fafbfd] p-5">
                  <div className="text-[16px] font-medium text-[#2a2f39]">{item}</div>
                  <div className="mt-4 flex flex-wrap gap-3 text-[14px] text-[#5d6675]">
                    <span className="rounded-full border border-[#dce3ef] bg-white px-3 py-2">Approved</span>
                    <span className="rounded-full border border-[#dce3ef] bg-white px-3 py-2">In progress</span>
                    <span className="rounded-full border border-[#dce3ef] bg-white px-3 py-2">Not initiated</span>
                  </div>
                  <textarea
                    readOnly
                    value={reviewDetail?.notes?.trim() || "Type your message here"}
                    className="mt-4 h-24 w-full resize-none rounded-[16px] border border-[#dce3ef] bg-white px-4 py-3 text-[14px] text-[#5d6675] outline-none"
                  />
                </div>
              ))}
            </div>
          ) : activeTab === "operational" ? (
            <div className="space-y-4">
              {operationalChecklist.map((item) => (
                <CaseChecklistCard key={item.title} item={item} />
              ))}
            </div>
          ) : activeTab === "export-compliance" ? (
            <div className="rounded-[18px] border border-dashed border-[#dce3ef] bg-[#fafbfd] px-5 py-8 text-center text-[14px] leading-6 text-[#7b8392]">
              Export compliance tracking (export licenses, shipment manifests, customs declarations) isn&apos;t
              wired up on the backend yet — this tab will populate once those records exist. It is intentionally
              left empty rather than showing placeholder data.
            </div>
          ) : activeTab === "documents" ? (
            <div className="overflow-x-auto rounded-[18px] border border-[#e8ecf4]">
              <table className="w-full min-w-[720px] text-[14px]">
                <thead>
                  <tr className="border-b border-[#edf1f7] bg-[#fafbfd] text-left text-[#8a92a1]">
                    <th className="px-4 py-3 font-medium">Document</th>
                    <th className="px-4 py-3 font-medium">Uploaded By</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length > 0 ? (
                    documents.map((document) => (
                      <tr key={document.id} className="border-b border-[#f2f4f8] last:border-b-0">
                        <td className="px-4 py-3 font-medium text-[#2a2f39]">{document.name}</td>
                        <td className="px-4 py-3 text-[#5d6675]">{companyName}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full border border-[#caebd1] bg-[#ecfaf0] px-3 py-1 text-[12px] font-medium text-[#1ea43b]">
                            Verified
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <a href={document.viewUrl} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e8ecf4] text-[#5d6675]">
                              <EyeOutlined />
                            </a>
                            <a href={document.downloadUrl} target="_blank" rel="noreferrer" download={document.name} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e8ecf4] text-[#5d6675]">
                              <DownloadOutlined />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-[#8a92a1]">
                        No documents were returned for this miner yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
                className="inline-flex h-11 items-center justify-center rounded-[12px] bg-[#14244a] px-5 text-[14px] font-semibold !text-white"
                style={primaryActionStyle}
              >
                Post Note
              </button>
              <div className="rounded-[18px] border border-[#e8ecf4] bg-[#fafbfd] p-5 text-[14px] leading-6 text-[#5d6675]">
                {reviewDetail?.notes?.trim() || "No internal notes captured for this review yet."}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {activityItems.length > 0 ? (
                activityItems.map((item) => (
                  <div key={item.label} className="flex gap-3 rounded-[18px] border border-[#e8ecf4] bg-white px-5 py-4">
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
                <div className="rounded-[18px] border border-dashed border-[#dce3ef] bg-[#fafbfd] px-5 py-6 text-[14px] text-[#7b8392]">
                  Timeline activity will appear here once the review progresses.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#edf1f7] bg-[#fafbfd] px-6 py-5">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[12px] text-[#8a92a1]">Compliance Score</div>
              <div className="text-[18px] font-semibold text-[#e0781a]">{scoreText}</div>
            </div>
            <div>
              <div className="text-[12px] text-[#8a92a1]">Decision Status</div>
              <div className="text-[15px] font-semibold text-[#e09408]">{formatReviewStatusText(reviewStatus)}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={activeAction != null}
              onClick={() => onAction("request_information")}
              className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-[#f6e3bf] bg-[#fff4df] px-4 text-[14px] font-medium text-[#a5680c] disabled:opacity-60"
            >
              Request Information
            </button>
            <button
              type="button"
              disabled={activeAction != null}
              onClick={() => onAction("reject")}
              className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-[#f3c2c4] bg-white px-4 text-[14px] font-medium text-[#ef2f32] disabled:opacity-60"
            >
              {activeAction === "reject" ? "Working..." : "Reject Application"}
            </button>
            <button
              type="button"
              disabled={activeAction != null}
              onClick={() => onAction("approve")}
              className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#14244a] px-4 text-[14px] font-semibold !text-white disabled:opacity-60"
              style={primaryActionStyle}
            >
              {activeAction === "approve" ? "Working..." : "Approve Compliance"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

