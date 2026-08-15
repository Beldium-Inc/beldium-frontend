"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  ReloadOutlined,
  RightOutlined,
  SearchOutlined,
  ThunderboltOutlined,
  UserSwitchOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { showToast } from "@/src/store/toast.store";
import { getComplianceTeamMembers, type ComplianceTeamMember } from "@/src/features/compliance/dashboard/api";

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ─── Types ──────────────────────────────────────────────────────────────────

type AlertSeverity = "Critical" | "High" | "Medium" | "Low";
type AlertStatus = "Open" | "Investigating" | "Pending" | "Resolved" | "Awaiting response";

type EscalationInfo = {
  escalatedBy: string;
  reason: string;
  escalatedAt: string;
  reviewerNote: string;
};

type RegAlert = {
  id: string;
  severity: AlertSeverity;
  alertType: string;
  miner: string;
  caseId: string;
  assigned: string | null;
  status: AlertStatus;
  mineral: string;
  location: string;
  createdAt: string;
  ruleId: string;
  ruleDescription: string;
  escalation: EscalationInfo | null;
};

type Reviewer = {
  id: string;
  name: string;
  title: string;
  workload: number;
  availability: "Available" | "At capacity";
};

const ESCALATION_REASONS = [
  "Expired document",
  "Suspected fraud",
  "Repeated non-compliance",
  "Data inconsistency",
  "Community risk",
];

// ─── Mock data ───────────────────────────────────────────────────────────────

const ALERTS: RegAlert[] = [
  {
    id: "1",
    severity: "Critical",
    alertType: "Expired Mining License",
    miner: "GreenRock Resources",
    caseId: "BLD-00231",
    assigned: "A. Bello",
    status: "Open",
    mineral: "Copper",
    location: "Oyo state",
    createdAt: "Aug, 15 2026. 3:34PM",
    ruleId: "RULE-017",
    ruleDescription:
      "License expiry date (2024-05-12) has passed for active mining concession ID GRC-992. Operation flagged as continuing without valid regulatory clearance.",
    escalation: null,
  },
  {
    id: "2",
    severity: "Medium",
    alertType: "Exceeded Production Threshold",
    miner: "TriVault Minerals",
    caseId: "BLD-00231",
    assigned: "A. Bello",
    status: "Investigating",
    mineral: "Lithium",
    location: "Kaduna state",
    createdAt: "Aug, 15 2026. 3:34PM",
    ruleId: "RULE-089",
    ruleDescription:
      "Reported production volume exceeded the approved extraction cap of 15,000 MT for the current quarter.",
    escalation: null,
  },
  {
    id: "3",
    severity: "Medium",
    alertType: "Duplicate document",
    miner: "Emerald Group",
    caseId: "BLD-00233",
    assigned: null,
    status: "Pending",
    mineral: "Gold",
    location: "Gombe state",
    createdAt: "Aug, 15 2026. 3:34PM",
    ruleId: "RULE-017",
    ruleDescription:
      "License expiry date (2024-05-12) has passed for active mining concession ID GRC-992. Operation flagged as continuing without valid regulatory clearance.",
    escalation: null,
  },
  {
    id: "4",
    severity: "High",
    alertType: "Failed Verification Rule",
    miner: "Atlas Mining Co.",
    caseId: "BLD-00231",
    assigned: "A. Bello",
    status: "Investigating",
    mineral: "Iron Ore",
    location: "Kogi state",
    createdAt: "Aug, 15 2026. 3:34PM",
    ruleId: "RULE-033",
    ruleDescription:
      "Submitted carbon report failed automated verification checks against declared operational capacity.",
    escalation: null,
  },
  {
    id: "5",
    severity: "Low",
    alertType: "Duplicate documents",
    miner: "Atlas Mining Co.",
    caseId: "BLD-00231",
    assigned: "A. Bello",
    status: "Resolved",
    mineral: "Iron Ore",
    location: "Kogi state",
    createdAt: "Aug, 14 2026. 11:02AM",
    ruleId: "RULE-014",
    ruleDescription: "Duplicate document detected across two separate submissions for the same case.",
    escalation: null,
  },
  {
    id: "6",
    severity: "Low",
    alertType: "Community Complaint",
    miner: "PlainsGold Ltd",
    caseId: "BLD-00231",
    assigned: "A. Bello",
    status: "Awaiting response",
    mineral: "Gold",
    location: "Zamfara state",
    createdAt: "Aug, 14 2026. 9:47AM",
    ruleId: "RULE-062",
    ruleDescription: "Community complaint logged against operation; awaiting miner response.",
    escalation: null,
  },
];

function mapTeamMembersToReviewers(members: ComplianceTeamMember[]): Reviewer[] {
  return members
    .filter((m) => m.status?.toLowerCase() !== "removed")
    .map((m) => ({
      id: m.id,
      name: m.full_name,
      title: m.role_detail?.name || m.department || "Team member",
      workload: 0,
      availability: m.status?.toLowerCase() === "active" ? "Available" : "At capacity",
    }));
}

function useReviewerDirectory() {
  const teamMembersQ = useQuery({
    queryKey: ["complianceTeamMembers"],
    queryFn: getComplianceTeamMembers,
    retry: false,
  });

  const raw = teamMembersQ.data?.data;
  const members = Array.isArray(raw) ? raw : raw?.results ?? [];

  return {
    reviewers: mapTeamMembersToReviewers(members),
    isLoading: teamMembersQ.isLoading,
    hasRealData: members.length > 0,
  };
}

type AlertHistoryEntry = { label: string; note?: string; time: string };

const HISTORY_BY_STATUS: Record<string, AlertHistoryEntry[]> = {
  assigned: [
    { label: "Investigation / reviewed", note: "Note added by A. Bello", time: "Today, 09:41 AM" },
    { label: "Assigned to A. Bello", time: "Today, 08:30 AM" },
    { label: "Alert created", note: "System generated based on RULE-017", time: "Yesterday, 03:43 PM" },
  ],
  unassigned: [{ label: "Alert created", note: "System generated based on RULE-017", time: "Yesterday, 03:43 PM" }],
};

// ─── Severity / status styles ─────────────────────────────────────────────────

const severityBadgeStyle: Record<AlertSeverity, string> = {
  Critical: "bg-[#fff0f1] text-[#ef2f32] border border-[#f7d6d7]",
  High: "bg-[#fff4df] text-[#df8b19] border border-[#f6e3bf]",
  Medium: "bg-[#fff4df] text-[#c99a2e] border border-[#f6e3bf]",
  Low: "bg-[#f4f6f9] text-[#6b7280] border border-[#e5e8ef]",
};

const severityDot: Record<AlertSeverity, string> = {
  Critical: "bg-[#ef2f32]",
  High: "bg-[#f3a000]",
  Medium: "bg-[#e0af3a]",
  Low: "bg-[#9ca3af]",
};

const statusStyle: Record<AlertStatus, string> = {
  Open: "border border-[#e1e5ee] text-[#2f3541] bg-white",
  Investigating: "border border-[#e1e5ee] text-[#2f3541] bg-white",
  Pending: "border border-[#e1e5ee] text-[#2f3541] bg-white",
  Resolved: "border border-[#caebd1] bg-[#ecfaf0] text-[#1ea43b]",
  "Awaiting response": "border border-[#dce7ff] bg-[#eef4ff] text-[#2661d8]",
};

// ─── Metric card ─────────────────────────────────────────────────────────────

function MetricCard({
  icon,
  iconBg,
  iconColor,
  value,
  label,
  sub,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5">
      <span className={classNames("inline-flex h-10 w-10 items-center justify-center rounded-[12px] text-[18px]", iconBg, iconColor)}>
        {icon}
      </span>
      <div className="mt-3 text-[30px] font-bold leading-none tracking-[-0.03em] text-[#1c2230]">{value}</div>
      <div className="mt-1.5 text-[14px] font-semibold text-[#2a2f39]">{label}</div>
      <div className="mt-0.5 text-[12px] text-[#8a92a1]">{sub}</div>
    </div>
  );
}

// ─── More menu ────────────────────────────────────────────────────────────────

function MoreMenu({
  alert,
  onViewRule,
  onAssign,
}: {
  alert: RegAlert;
  onViewRule: () => void;
  onAssign: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e9f1] text-[#4b5260] hover:bg-[#f4f6fa]"
        aria-label="More actions"
      >
        <span className="text-[16px] leading-none">⋯</span>
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          />
          <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-[180px] overflow-hidden rounded-[12px] border border-[#e5e9f1] bg-white py-1 shadow-[0_20px_44px_-24px_rgba(16,30,61,0.35)]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onViewRule();
              }}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] font-medium text-[#2f3541] hover:bg-[#f7f9fc]"
            >
              Triggered rule
              <ThunderboltOutlined className="text-[13px] text-[#8a92a1]" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onAssign();
              }}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] font-medium text-[#2f3541] hover:bg-[#f7f9fc]"
            >
              {alert.assigned ? "Re-assign to" : "Assign to"}
              <UserSwitchOutlined className="text-[13px] text-[#8a92a1]" />
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

// ─── Empty / error states ─────────────────────────────────────────────────────

function AlertsEmptyState({
  variant,
  onRefresh,
}: {
  variant: "empty" | "error";
  onRefresh: () => void;
}) {
  const isError = variant === "error";
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f4f6f9] text-[24px] text-[#a7adba]">
        <InboxOutlined />
      </span>
      <div className="text-[16px] font-semibold text-[#2a2f39]">
        {isError ? "Alert unavailable" : "No alert yet"}
      </div>
      <p className="max-w-[320px] text-[13px] text-[#8a92a1]">
        {isError
          ? "We couldn't load regulatory alerts. Check your connection and try again"
          : "No alerts to review yet. Alerts will appear here when a compliance issue or regulatory risk is detected."}
      </p>
      <button
        type="button"
        onClick={onRefresh}
        className="mt-1 inline-flex h-9 items-center rounded-[10px] border border-[#e1e5ee] bg-white px-4 text-[13px] font-medium text-[#2f3541] hover:bg-[#f7f9fc]"
      >
        Refresh
      </button>
    </div>
  );
}

// ─── Alert detail drawer ───────────────────────────────────────────────────────

function AlertDetailDrawer({
  alert,
  onClose,
  onAssign,
  onEscalate,
}: {
  alert: RegAlert;
  onClose: () => void;
  onAssign: () => void;
  onEscalate: () => void;
}) {
  const history = alert.assigned ? HISTORY_BY_STATUS.assigned : HISTORY_BY_STATUS.unassigned;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Close alert panel"
        className="absolute inset-0 bg-[rgba(8,13,28,0.18)] backdrop-blur-[3px]"
        onClick={onClose}
      />

      <aside className="relative flex h-full w-full max-w-[460px] flex-col overflow-y-auto border-l border-[#e8ecf4] bg-white shadow-[-20px_0_50px_-30px_rgba(16,30,61,0.5)]">
        <div className="flex items-center justify-between border-b border-[#edf1f7] px-6 py-5">
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] font-semibold text-[#202534]">Regulatory Alert</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f4f6f9] px-2.5 py-1 text-[11px] font-medium text-[#6b7280]">
              {alert.caseId}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e9f1] bg-[#fafbfd] text-[15px] text-[#4f5664] hover:bg-white"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="flex-1 space-y-6 px-6 py-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-semibold text-[#1c2230]">{alert.alertType}</h3>
            <span className={classNames("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", severityBadgeStyle[alert.severity])}>
              <span className={classNames("h-1.5 w-1.5 rounded-full", severityDot[alert.severity])} />
              {alert.severity}
            </span>
          </div>

          <section>
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">Overview</div>
            <div className="grid grid-cols-2 gap-y-4 rounded-[14px] border border-[#e8ecf4] bg-[#fbfcfe] p-4 text-[13px]">
              <div>
                <div className="text-[#8a92a1]">Miner</div>
                <div className="mt-1 font-semibold text-[#2a2f39]">{alert.miner}</div>
              </div>
              <div>
                <div className="text-[#8a92a1]">Status</div>
                <div className="mt-1">
                  <span className="inline-flex items-center rounded-[8px] border border-[#e1e5ee] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#2f3541]">
                    {alert.status}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-[#8a92a1]">Reviewer</div>
                <div className="mt-1 font-semibold text-[#2a2f39]">{alert.assigned ?? "Unassigned"}</div>
              </div>
              <div>
                <div className="text-[#8a92a1]">Mineral</div>
                <div className="mt-1 font-semibold text-[#2a2f39]">{alert.mineral}</div>
              </div>
              <div>
                <div className="text-[#8a92a1]">Created on</div>
                <div className="mt-1 font-semibold text-[#2a2f39]">{alert.createdAt}</div>
              </div>
              <div>
                <div className="text-[#8a92a1]">Location</div>
                <div className="mt-1 font-semibold text-[#2a2f39]">{alert.location}</div>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">Why this alert was triggered</div>
            <div className="rounded-[14px] border border-[#e8ecf4] bg-[#fbfcfe] p-4">
              <div className="text-[13px] font-semibold text-[#2a2f39]">{alert.ruleId}</div>
              <p className="mt-1.5 text-[13px] leading-5 text-[#5d6675]">{alert.ruleDescription}</p>
            </div>
          </section>

          <section>
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">Related entity</div>
            <div className="flex items-center justify-between rounded-[14px] border border-[#e8ecf4] bg-[#fbfcfe] p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef4ff] text-[12px] font-semibold text-[#2661d8]">
                  {alert.miner.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <div className="text-[13px] font-semibold text-[#2a2f39]">{alert.miner}</div>
                  <div className="text-[12px] text-[#8a92a1]">Mining company</div>
                </div>
              </div>
              <button type="button" className="flex items-center gap-1 text-[12px] font-semibold text-[#2661d8]">
                View miner <RightOutlined className="text-[10px]" />
              </button>
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">Alert history</div>
              <button type="button" className="text-[12px] font-semibold text-[#2661d8]">
                See all
              </button>
            </div>
            <div className="space-y-4">
              {history.map((entry, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={classNames(
                        "mt-1 h-2.5 w-2.5 rounded-full",
                        i === 0 ? "bg-[#2661d8]" : "border-2 border-[#d1d7e3] bg-white",
                      )}
                    />
                    {i < history.length - 1 ? <span className="mt-1 h-full w-px flex-1 bg-[#e5e9f1]" /> : null}
                  </div>
                  <div className="pb-1">
                    <div className="text-[12px] text-[#8a92a1]">{entry.time}</div>
                    <div className="text-[13px] font-semibold text-[#2a2f39]">{entry.label}</div>
                    {entry.note ? (
                      <div className="text-[12px] text-[#8a92a1]">
                        {entry.note}{" "}
                        <button type="button" className="font-semibold text-[#2661d8]">
                          View
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">Review notes</div>
            <textarea
              rows={3}
              placeholder="Add an internal note..."
              className="w-full rounded-[14px] border border-[#e1e5ee] bg-white p-3 text-[13px] text-[#2a2f39] outline-none placeholder:text-[#a0a6b3] focus:border-[#101e3d]"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => showToast("Note added", "success")}
                className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-[#e1e5ee] bg-white px-4 text-[13px] font-medium text-[#2f3541] hover:bg-[#f7f9fc]"
              >
                Post Note
              </button>
            </div>
          </section>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-[#edf1f7] px-6 py-4">
          <button
            type="button"
            onClick={onAssign}
            className="inline-flex h-10 items-center rounded-[10px] border border-[#dce7ff] bg-[#eef4ff] px-4 text-[13px] font-semibold text-[#2661d8] hover:bg-[#e2ecff]"
          >
            {alert.assigned ? "Re-assign" : "Assign"}
          </button>
          <button
            type="button"
            onClick={onEscalate}
            className="inline-flex h-10 items-center rounded-[10px] border border-[#f6e3bf] bg-white px-4 text-[13px] font-semibold text-[#df8b19] hover:bg-[#fffaf0]"
          >
            Escalate
          </button>
          <button
            type="button"
            onClick={() => {
              showToast(`Case ${alert.caseId} dismissed`, "info");
              onClose();
            }}
            className="inline-flex h-10 items-center rounded-[10px] border border-[#e1e5ee] bg-white px-4 text-[13px] font-semibold text-[#2f3541] hover:bg-[#f7f9fc]"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={() => {
              showToast(`Case ${alert.caseId} marked resolved`, "success");
              onClose();
            }}
            className="ml-auto inline-flex h-10 items-center rounded-[10px] bg-[#14244a] px-5 text-[13px] font-semibold !text-white hover:bg-[#182c57]"
          >
            Mark Resolved
          </button>
        </div>
      </aside>
    </div>
  );
}

// ─── Assign / Re-assign reviewer modal ─────────────────────────────────────────

function AssignReviewerModal({
  alert,
  reviewers,
  onClose,
  onAssigned,
}: {
  alert: RegAlert;
  reviewers: Reviewer[];
  onClose: () => void;
  onAssigned: (reviewerName: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>(reviewers[0]?.id ?? "");
  const isReassign = Boolean(alert.assigned);

  const filtered = useMemo(
    () =>
      reviewers.filter((r) =>
        search.trim() ? r.name.toLowerCase().includes(search.toLowerCase()) || r.title.toLowerCase().includes(search.toLowerCase()) : true,
      ),
    [search, reviewers],
  );

  const handleConfirm = () => {
    const reviewer = reviewers.find((r) => r.id === selectedId);
    onAssigned(reviewer?.name ?? "Reviewer");
    showToast("Reviewer assigned successfully", "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(22,28,36,0.6)] px-4 py-8">
      <div className="relative w-full max-w-[520px] rounded-[24px] bg-white shadow-[0_40px_120px_-56px_rgba(15,23,42,0.75)]">
        <div className="flex items-start justify-between border-b border-[#edf1f6] px-6 py-5">
          <div>
            <h2 className="text-[17px] font-semibold text-[#252b37]">
              {isReassign ? "Re-assign Reviewer" : "Assign Reviewer"}
            </h2>
            <p className="mt-1 text-[13px] text-[#8a92a1]">Select an analyst to handle case {alert.caseId}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[16px] text-[#303744] hover:bg-[#f7f9fc]"
            aria-label="Close assign reviewer modal"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="relative">
            <SearchOutlined className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0a6b3] text-[13px]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, level or department type..."
              className="h-11 w-full rounded-[12px] border border-[#dfe4ec] bg-white pl-9 pr-3 text-[13px] text-[#2d3441] outline-none placeholder:text-[#a0a6b3] focus:border-[#101e3d]"
            />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-[12px] text-[#8a92a1]">Filter by:</span>
            <button type="button" className="inline-flex h-8 items-center rounded-full border border-[#e1e5ee] px-3 text-[12px] font-medium text-[#4b5260]">
              Available
            </button>
            <button type="button" className="inline-flex h-8 items-center rounded-full border border-[#e1e5ee] px-3 text-[12px] font-medium text-[#4b5260]">
              Senior analyst
            </button>
          </div>

          {isReassign ? (
            <div className="mt-4">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">Previous reviewer</div>
              <div className="flex items-center justify-between rounded-[12px] border border-[#e8ecf4] bg-[#fbfcfe] px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef4ff] text-[12px] font-semibold text-[#2661d8]">
                    {alert.assigned
                      ?.split(" ")
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                  <div>
                    <div className="text-[13px] font-semibold text-[#2a2f39]">{alert.assigned}</div>
                    <div className="text-[12px] text-[#8a92a1]">Compliance I</div>
                  </div>
                </div>
                <div className="text-right text-[12px]">
                  <span className="text-[#8a92a1]">Workload: </span>
                  <span className="font-semibold text-[#2f3541]">5 active</span>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-4 max-h-[260px] space-y-2 overflow-y-auto">
            {filtered.map((r) => (
              <label
                key={r.id}
                className={classNames(
                  "flex cursor-pointer items-center justify-between rounded-[12px] border px-4 py-3 transition-colors",
                  selectedId === r.id ? "border-[#101e3d] bg-[#fafbfe]" : "border-[#e8ecf4] hover:bg-[#fafbfe]",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef4ff] text-[12px] font-semibold text-[#2661d8]">
                    {r.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                  <div>
                    <div className="text-[13px] font-semibold text-[#2a2f39]">{r.name}</div>
                    <div className="text-[12px] text-[#8a92a1]">{r.title}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-[12px]">
                    <div>
                      <span className="text-[#8a92a1]">Workload: </span>
                      <span
                        className={classNames(
                          "font-semibold",
                          r.availability === "At capacity" ? "text-[#ef2f32]" : "text-[#2f3541]",
                        )}
                      >
                        {r.workload} active
                      </span>
                    </div>
                    <div className={classNames("font-medium", r.availability === "At capacity" ? "text-[#ef2f32]" : "text-[#2661d8]")}>
                      {r.availability}
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="reviewer"
                    checked={selectedId === r.id}
                    onChange={() => setSelectedId(r.id)}
                    className="h-4 w-4"
                  />
                </div>
              </label>
            ))}
          </div>

          <div className="mt-3 text-right">
            <button type="button" className="text-[12px] font-semibold text-[#2661d8]">
              See all
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1f6] px-6 py-4">
          <span className="flex items-center gap-1.5 text-[12px] text-[#8a92a1]">
            <ExclamationCircleOutlined /> Assignment notifies Reviewer immediately.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center rounded-[10px] border border-[#e1e5ee] bg-white px-4 text-[13px] font-semibold text-[#2f3541] hover:bg-[#f7f9fc]"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex h-10 items-center rounded-[10px] bg-[#14244a] px-4 text-[13px] font-semibold !text-white hover:bg-[#182c57]"
            >
              Confirm assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Escalate alert modal ───────────────────────────────────────────────────────

function EscalateAlertModal({
  alert,
  reviewers,
  onClose,
  onEscalated,
}: {
  alert: RegAlert;
  reviewers: Reviewer[];
  onClose: () => void;
  onEscalated: (info: EscalationInfo) => void;
}) {
  const [reason, setReason] = useState("");
  const [investigatorId, setInvestigatorId] = useState("");
  const [notes, setNotes] = useState("");

  const canSubmit = reason.trim().length > 0;

  const handleEscalate = () => {
    if (!canSubmit) return;
    const investigator = reviewers.find((r) => r.id === investigatorId);
    onEscalated({
      escalatedBy: "You",
      reason,
      escalatedAt: "Just now",
      reviewerNote: notes,
    });
    showToast(`Case ${alert.caseId} escalated${investigator ? ` to ${investigator.name}` : ""}`, "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(22,28,36,0.6)] px-4 py-8">
      <div className="relative w-full max-w-[480px] rounded-[24px] bg-white shadow-[0_40px_120px_-56px_rgba(15,23,42,0.75)]">
        <div className="flex items-start justify-between border-b border-[#edf1f6] px-6 py-5">
          <div>
            <h2 className="text-[17px] font-semibold text-[#252b37]">Escalate</h2>
            <p className="mt-1 text-[13px] text-[#8a92a1]">Escalate this alert for investigation</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[16px] text-[#303744] hover:bg-[#f7f9fc]"
            aria-label="Close escalate modal"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4 rounded-[12px] border border-[#e8ecf4] bg-[#fbfcfe] p-4 text-[13px]">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8a92a1]">Miner</div>
              <div className="mt-1 font-semibold text-[#2a2f39]">{alert.miner}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8a92a1]">Case ID</div>
              <div className="mt-1 font-mono font-semibold text-[#2a2f39]">{alert.caseId}</div>
            </div>
            <div className="col-span-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8a92a1]">Alert trigger</div>
              <div className="mt-1 font-semibold text-[#2a2f39]">{alert.alertType}</div>
            </div>
          </div>

          <div>
            <label className="text-[13px] font-medium text-[#2f3541]">Escalation reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1.5 h-11 w-full appearance-none rounded-[10px] border border-[#dfe4ec] bg-white px-3 text-[13px] text-[#2d3441] outline-none focus:border-[#101e3d]"
            >
              <option value="">Select reason</option>
              {ESCALATION_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-[#2f3541]">Investigators</label>
            <select
              value={investigatorId}
              onChange={(e) => setInvestigatorId(e.target.value)}
              className="mt-1.5 h-11 w-full appearance-none rounded-[10px] border border-[#dfe4ec] bg-white px-3 text-[13px] text-[#2d3441] outline-none focus:border-[#101e3d]"
            >
              <option value="">Select investigator</option>
              {reviewers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-[#2f3541]">Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add an internal note..."
              className="mt-1.5 w-full rounded-[10px] border border-[#dfe4ec] bg-white p-3 text-[13px] text-[#2a2f39] outline-none placeholder:text-[#a0a6b3] focus:border-[#101e3d]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#edf1f6] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center rounded-[10px] border border-[#e1e5ee] bg-white px-4 text-[13px] font-semibold text-[#2f3541] hover:bg-[#f7f9fc]"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={handleEscalate}
            disabled={!canSubmit}
            className="inline-flex h-10 items-center rounded-[10px] bg-[#ef2f32] px-4 text-[13px] font-semibold !text-white hover:bg-[#d92629] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Escalate alert
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Escalated case review (full page) ─────────────────────────────────────────

function EscalatedCaseReviewView({
  alert,
  onBack,
  onAssign,
}: {
  alert: RegAlert;
  onBack: () => void;
  onAssign: () => void;
}) {
  const history = alert.assigned ? HISTORY_BY_STATUS.assigned : HISTORY_BY_STATUS.unassigned;
  const escalation = alert.escalation;

  return (
    <div className="space-y-4">
      <div className="text-[13px] text-[#8a92a1]">
        <button type="button" onClick={onBack} className="font-medium text-[#8a92a1] hover:text-[#2a2f39]">
          Escalated cases
        </button>
        <span className="mx-2">›</span>
        <span className="text-[#2a2f39]">Case ID: {alert.caseId}</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-bold tracking-[-0.02em] text-[#1c2230]">{alert.miner}</h1>
            <span className={classNames("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", severityBadgeStyle[alert.severity])}>
              <span className={classNames("h-1.5 w-1.5 rounded-full", severityDot[alert.severity])} />
              {alert.severity}
            </span>
          </div>
          <div className="mt-1 text-[13px] text-[#8a92a1]">Subject: {alert.alertType}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAssign}
            className="inline-flex h-9 items-center rounded-[10px] border border-[#dce7ff] bg-[#eef4ff] px-4 text-[13px] font-semibold text-[#2661d8] hover:bg-[#e2ecff]"
          >
            {alert.assigned ? "Re-assign" : "Assign"}
          </button>
          <button
            type="button"
            onClick={() => showToast(`Case ${alert.caseId} dismissed`, "info")}
            className="inline-flex h-9 items-center rounded-[10px] border border-[#e1e5ee] bg-white px-4 text-[13px] font-semibold text-[#2f3541] hover:bg-[#f7f9fc]"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={() => showToast(`Case ${alert.caseId} marked resolved`, "success")}
            className="inline-flex h-9 items-center rounded-[10px] bg-[#14244a] px-4 text-[13px] font-semibold !text-white hover:bg-[#182c57]"
          >
            Mark as Resolved
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="rounded-[14px] border border-[#e8ecf4] bg-white p-5">
            <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-[#2a2f39]">
              <ExclamationCircleOutlined className="text-[#df8b19]" />
              Escalation Context
            </div>
            <div className="grid grid-cols-3 gap-4 text-[13px]">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8a92a1]">Escalated by</div>
                <div className="mt-1 font-semibold text-[#2a2f39]">{escalation?.escalatedBy ?? "—"}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8a92a1]">Escalated reason</div>
                <div className="mt-1 font-semibold text-[#2a2f39]">{escalation?.reason ?? "—"}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8a92a1]">Escalated on</div>
                <div className="mt-1 font-semibold text-[#2a2f39]">{escalation?.escalatedAt ?? "—"}</div>
              </div>
            </div>
            <div className="mt-4 rounded-[12px] bg-[#fbfcfe] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8a92a1]">Reviewer note</div>
              <p className="mt-1.5 text-[13px] leading-5 text-[#5d6675]">
                {escalation?.reviewerNote?.trim() || "No note was added when this case was escalated."}
              </p>
            </div>
          </div>

          <div className="rounded-[14px] border border-[#e8ecf4] bg-white p-5">
            <div className="mb-3 text-[13px] font-semibold text-[#2a2f39]">Investigation workspace</div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8a92a1]">Alert trigger</div>
            <p className="mt-1.5 text-[13px] leading-5 text-[#5d6675]">
              {alert.ruleId}. {alert.ruleDescription}
            </p>
          </div>
        </div>

        <div className="rounded-[14px] border border-[#e8ecf4] bg-white p-5">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">Alert history</div>
          <div className="space-y-4">
            {(escalation
              ? [
                  {
                    label: "Escalated for investigation",
                    note: escalation.reviewerNote ? `Note added by ${escalation.escalatedBy}` : undefined,
                    time: escalation.escalatedAt,
                  },
                  ...history,
                ]
              : history
            ).map((entry, i, arr) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={classNames(
                      "mt-1 h-2.5 w-2.5 rounded-full",
                      i === 0 ? "bg-[#2661d8]" : "border-2 border-[#d1d7e3] bg-white",
                    )}
                  />
                  {i < arr.length - 1 ? <span className="mt-1 h-full w-px flex-1 bg-[#e5e9f1]" /> : null}
                </div>
                <div className="pb-1">
                  <div className="text-[12px] text-[#8a92a1]">{entry.time}</div>
                  <div className="text-[13px] font-semibold text-[#2a2f39]">{entry.label}</div>
                  {entry.note ? <div className="text-[12px] text-[#8a92a1]">{entry.note}</div> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RegulatoryAlertsView() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [alerts, setAlerts] = useState<RegAlert[]>(ALERTS);
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);
  const [assignTargetId, setAssignTargetId] = useState<string | null>(null);
  const [escalateTargetId, setEscalateTargetId] = useState<string | null>(null);
  const [escalatedCaseId, setEscalatedCaseId] = useState<string | null>(null);
  const { reviewers } = useReviewerDirectory();

  const allChecked = alerts.length > 0 && selectedIds.size === alerts.length;

  const toggleAll = () => {
    if (allChecked) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(alerts.map((a) => a.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredAlerts = alerts.filter((a) =>
    search.trim()
      ? a.miner.toLowerCase().includes(search.toLowerCase()) ||
        a.caseId.toLowerCase().includes(search.toLowerCase()) ||
        a.alertType.toLowerCase().includes(search.toLowerCase())
      : true,
  );

  const activeAlert = alerts.find((a) => a.id === activeAlertId) ?? null;
  const assignTarget = alerts.find((a) => a.id === assignTargetId) ?? null;
  const escalateTarget = alerts.find((a) => a.id === escalateTargetId) ?? null;
  const escalatedCase = alerts.find((a) => a.id === escalatedCaseId) ?? null;

  const handleAssigned = (alertId: string, reviewerName: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, assigned: reviewerName, status: a.status === "Pending" ? "Investigating" : a.status } : a)),
    );
  };

  const handleEscalated = (alertId: string, info: EscalationInfo) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, escalation: info } : a)));
    setActiveAlertId(null);
    setEscalatedCaseId(alertId);
  };

  if (escalatedCase) {
    return (
      <>
        <EscalatedCaseReviewView
          alert={escalatedCase}
          onBack={() => setEscalatedCaseId(null)}
          onAssign={() => setAssignTargetId(escalatedCase.id)}
        />
        {assignTarget ? (
          <AssignReviewerModal
            alert={assignTarget}
            reviewers={reviewers}
            onClose={() => setAssignTargetId(null)}
            onAssigned={(name) => handleAssigned(assignTarget.id, name)}
          />
        ) : null}
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[#2a2f39]">Regulatory Alerts</h1>
          <p className="mt-1 max-w-[560px] text-[14px] text-[#7a8291]">
            Monitor regulatory risks, compliance breaches, expiring obligations, and escalated cases across all registered mining operations.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => showToast("Export started", "info")}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#e1e5ee] bg-white px-4 text-[13px] font-medium text-[#2f3541] hover:bg-[#f7f9fc] transition-colors"
          >
            <DownloadOutlined />
            Export Alerts
          </button>
          <button
            type="button"
            onClick={() => showToast("Alerts refreshed", "success")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#e1e5ee] bg-white text-[#2f3541] hover:bg-[#f7f9fc] transition-colors"
            aria-label="Refresh alerts"
          >
            <ReloadOutlined />
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          icon={<WarningOutlined />}
          iconBg="bg-[#fff0f1]"
          iconColor="text-[#ef2f32]"
          value="3"
          label="Critical Alerts"
          sub="Require immediate action"
        />
        <MetricCard
          icon={<WarningOutlined />}
          iconBg="bg-[#fff4df]"
          iconColor="text-[#df8b19]"
          value="3"
          label="Warnings"
          sub="Action within 24-72 hrs"
        />
        <MetricCard
          icon={<ArrowUpOutlined />}
          iconBg="bg-[#fff0e6]"
          iconColor="text-[#e5793a]"
          value="4"
          label="Escalated Cases"
          sub="Under active investigation"
        />
        <MetricCard
          icon={<CheckCircleOutlined />}
          iconBg="bg-[#ecfaf0]"
          iconColor="text-[#1ea43b]"
          value="1"
          label="Resolved Today"
          sub="Successfully closed"
        />
      </div>

      {/* Priority matrix */}
      <div className="flex flex-wrap items-center gap-4 rounded-[12px] border border-[#e8ecf4] bg-white px-5 py-3 text-[13px]">
        <span className="font-semibold text-[#2a2f39] uppercase tracking-[0.06em] text-[11px]">Priority Matrix</span>
        {[
          { dot: "bg-[#ef2f32]", label: "Critical", desc: "Immediate action" },
          { dot: "bg-[#f3a000]", label: "High", desc: "Within 24 hours" },
          { dot: "bg-[#e0af3a]", label: "Medium", desc: "Within 7 days" },
          { dot: "bg-[#2661d8]", label: "Low", desc: "Monitor" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-[#4b5260]">
            <span className={classNames("h-2 w-2 rounded-full", item.dot)} />
            <span className="font-medium">{item.label}</span>
            <span className="text-[#8a92a1]">{item.desc}</span>
          </div>
        ))}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-[14px] border border-[#e8ecf4] bg-white px-5 py-4">
          <div>
            <div className="text-[14px] font-semibold text-[#2a2f39]">Regulatory policy update</div>
            <div className="mt-0.5 text-[13px] text-[#8a92a1]">Review latest changes to extraction guidelines (v2.4)</div>
          </div>
          <button type="button" className="shrink-0 text-[13px] font-medium text-[#2a2f39] underline underline-offset-2">
            See all
          </button>
        </div>
        <div className="flex items-center justify-between rounded-[14px] border border-[#e8ecf4] bg-white px-5 py-4">
          <div>
            <div className="text-[14px] font-semibold text-[#2a2f39]">Risk alert</div>
            <div className="mt-0.5 text-[13px] text-[#8a92a1]">Unusual pattern detected in section 4 (logistics)</div>
          </div>
          <button type="button" className="shrink-0 text-[13px] font-medium text-[#2a2f39] underline underline-offset-2">
            See all
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-[420px]">
        <SearchOutlined className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a6b3] text-[13px]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search miner, case ID, alert type..."
          className="h-10 w-full rounded-[10px] border border-[#dfe4ec] bg-white pl-9 pr-3 text-[13px] text-[#2d3441] outline-none placeholder:text-[#a0a6b3] focus:border-[#101e3d]"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[14px] border border-[#e5e9f1] bg-white">
        {filteredAlerts.length === 0 ? (
          <AlertsEmptyState variant="empty" onRefresh={() => setSearch("")} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-separate border-spacing-0 text-left text-[13px]">
                <thead>
                  <tr className="bg-[#fafbfe] text-[#6b7280]">
                    <th className="border-b border-[#e5e9f1] px-4 py-3 w-10">
                      <input type="checkbox" checked={allChecked} onChange={toggleAll} className="rounded border-[#d1d5db]" />
                    </th>
                    <th className="border-b border-[#e5e9f1] px-3 py-3 font-medium">Severity</th>
                    <th className="border-b border-[#e5e9f1] px-3 py-3 font-medium">Alert type</th>
                    <th className="border-b border-[#e5e9f1] px-3 py-3 font-medium">Miner</th>
                    <th className="border-b border-[#e5e9f1] px-3 py-3 font-medium">Case ID</th>
                    <th className="border-b border-[#e5e9f1] px-3 py-3 font-medium">Assigned</th>
                    <th className="border-b border-[#e5e9f1] px-3 py-3 font-medium">Status</th>
                    <th className="border-b border-[#e5e9f1] px-3 py-3 font-medium">More</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.map((alert, index) => {
                    const isSelected = selectedIds.has(alert.id);
                    return (
                      <tr
                        key={alert.id}
                        onClick={() => (alert.escalation ? setEscalatedCaseId(alert.id) : setActiveAlertId(alert.id))}
                        className={classNames(
                          "cursor-pointer transition-colors",
                          isSelected ? "bg-[#f0f5ff]" : index % 2 === 0 ? "bg-white" : "bg-[#fafbfe]",
                          "hover:bg-[#f4f7fc]",
                        )}
                      >
                        <td className="border-b border-[#f0f3f8] px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleOne(alert.id)} className="rounded border-[#d1d5db]" />
                        </td>
                        <td className="border-b border-[#f0f3f8] px-3 py-3">
                          <span className={classNames("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", severityBadgeStyle[alert.severity])}>
                            <span className={classNames("h-1.5 w-1.5 rounded-full", severityDot[alert.severity])} />
                            {alert.severity}
                          </span>
                        </td>
                        <td className="border-b border-[#f0f3f8] px-3 py-3 font-medium text-[#2a2f39] whitespace-nowrap">{alert.alertType}</td>
                        <td className="border-b border-[#f0f3f8] px-3 py-3 text-[#4b5260]">{alert.miner}</td>
                        <td className="border-b border-[#f0f3f8] px-3 py-3 font-mono text-[#5d6675]">{alert.caseId}</td>
                        <td className="border-b border-[#f0f3f8] px-3 py-3 text-[#4b5260]">{alert.assigned ?? "Unassigned"}</td>
                        <td className="border-b border-[#f0f3f8] px-3 py-3">
                          <span className={classNames("inline-flex items-center rounded-[8px] px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap", statusStyle[alert.status])}>
                            {alert.status}
                          </span>
                        </td>
                        <td className="border-b border-[#f0f3f8] px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <MoreMenu
                            alert={alert}
                            onViewRule={() => setActiveAlertId(alert.id)}
                            onAssign={() => setAssignTargetId(alert.id)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-[#f0f3f8] px-4 py-3 text-[13px] text-[#8a92a1]">
              <span>
                Showing {filteredAlerts.length} of {alerts.length} alerts
              </span>
              <div className="flex items-center gap-1">
                <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#14244a] !text-white text-[12px] font-semibold">
                  1
                </button>
                <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-[#4b5260] hover:bg-[#f4f6fa] text-[12px]">
                  2
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {activeAlert ? (
        <AlertDetailDrawer
          alert={activeAlert}
          onClose={() => setActiveAlertId(null)}
          onAssign={() => setAssignTargetId(activeAlert.id)}
          onEscalate={() => setEscalateTargetId(activeAlert.id)}
        />
      ) : null}

      {assignTarget ? (
        <AssignReviewerModal
          alert={assignTarget}
          reviewers={reviewers}
          onClose={() => setAssignTargetId(null)}
          onAssigned={(name) => handleAssigned(assignTarget.id, name)}
        />
      ) : null}

      {escalateTarget ? (
        <EscalateAlertModal
          alert={escalateTarget}
          reviewers={reviewers}
          onClose={() => setEscalateTargetId(null)}
          onEscalated={(info) => handleEscalated(escalateTarget.id, info)}
        />
      ) : null}
    </div>
  );
}
