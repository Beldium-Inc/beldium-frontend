"use client";

import { useState } from "react";
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
} from "@ant-design/icons";
import type { AdminReviewRow } from "@/src/features/compliance/dashboard/types";
import { classNames, primaryActionStyle } from "@/src/features/compliance/dashboard/lib/style";
import { showToast } from "@/src/store/toast.store";
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

  return (
    <div className="flex h-[calc(100vh-160px)] gap-0 overflow-hidden rounded-[24px] border border-[#e8ecf4] bg-white shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
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
                    { label: "Open Issues", value: "7", sub: "4 pending action" },
                    { label: "Documents Verified", value: "9 / 14", sub: "5 remaining" },
                  ].map((m) => (
                    <OverviewMetricTile key={m.label} label={m.label} value={m.value} valueClassName={m.valueClass} footnote={m.sub} />
                  ))}
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
                  <div className="rounded-[14px] border border-[#e8ecf4] bg-white p-5">
                    <div className="text-[14px] font-semibold text-[#2a2f39]">Company Profile</div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 text-[13px]">
                      {[
                        { label: "Company", value: `${selectedRow.company} Ltd.` },
                        { label: "Registration No.", value: "CAC/RC/0042871" },
                        { label: "Incorporated", value: "2018" },
                        { label: "Country", value: "Nigeria" },
                        { label: "Mine Location", value: selectedRow.location || "Plateau State, North-Central" },
                        { label: "Mineral Types", value: "Lithium, Tin" },
                        { label: "Operational Capacity", value: "12,000 MT / year" },
                        { label: "Assigned Institution", value: "NGMC — National Geo-Minerals Corp" },
                        { label: "Current Reviewer", value: `${selectedRow.reviewer} (Compliance Officer)` },
                        { label: "Submission Date", value: "January 8, 2026" },
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
                          <div className="mt-1 text-[11px]">Plateau State, Nigeria</div>
                          <div className="text-[10px]">9.2°N, 9.5°E</div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[14px] border border-[#e8ecf4] bg-white p-4">
                      <div className="text-[13px] font-semibold text-[#2a2f39]">Review Progress</div>
                      <div className="mt-3 space-y-2.5">
                        {[
                          { label: "Licensing", value: 100 },
                          { label: "Environmental", value: 48 },
                          { label: "Operational", value: 20 },
                          { label: "Export", value: 0 },
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
              <div className="rounded-[18px] border border-dashed border-[#dce3ef] bg-[#fafbfd] px-5 py-6 text-[14px] leading-6 text-[#7b8392]">
                No licensing documents were returned by the miner detail endpoint for this miner yet.
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
                      value="Type your message here"
                      className="mt-4 h-24 w-full resize-none rounded-[16px] border border-[#dce3ef] bg-white px-4 py-3 text-[14px] text-[#5d6675] outline-none"
                    />
                  </div>
                ))}
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
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-[#8a92a1]">
                        No documents were returned for this miner yet.
                      </td>
                    </tr>
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
                  className="inline-flex h-11 items-center justify-center rounded-[12px] bg-[#14244a] px-5 text-[14px] font-semibold text-white"
                  style={primaryActionStyle}
                >
                  Post Note
                </button>
                <div className="rounded-[18px] border border-[#e8ecf4] bg-[#fafbfd] p-5 text-[14px] leading-6 text-[#5d6675]">
                  No internal notes captured for this review yet.
                </div>
              </div>
            ) : (
              <div className="rounded-[18px] border border-dashed border-[#dce3ef] bg-[#fafbfd] px-5 py-6 text-[14px] text-[#7b8392]">
                Timeline activity will appear here once the review progresses.
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

