"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BellOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  ReloadOutlined,
  RightOutlined,
  SearchOutlined,
  UserSwitchOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { showToast } from "@/src/store/toast.store";
import {
  getComplianceTeamMembers,
  getPolicyAlerts,
  getRegulatoryAlerts,
  updateRegulatoryAlertStatus,
  assignRegulatoryAlert,
  type ComplianceTeamMember,
  type RegulatoryAlertRecord,
  type RegulatoryAlertSeverity,
  type RegulatoryAlertStatus,
  type RegulatoryAlertType,
} from "@/src/features/compliance/dashboard/api";
import { getApiErrorMessage } from "@/src/features/compliance/dashboard/lib/documents";

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const ALERT_TYPE_LABEL: Record<RegulatoryAlertType, string> = {
  license_expiry: "Licence Expiry",
  rule_violation: "Rule Violation",
  document: "Document",
};

const SEVERITY_LABEL: Record<RegulatoryAlertSeverity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const STATUS_LABEL: Record<RegulatoryAlertStatus, string> = {
  open: "Open",
  in_review: "In Review",
  resolved: "Resolved",
};

const severityBadgeStyle: Record<RegulatoryAlertSeverity, string> = {
  critical: "bg-[#fff0f1] text-[#ef2f32] border border-[#f7d6d7]",
  high: "bg-[#fff4df] text-[#df8b19] border border-[#f6e3bf]",
  medium: "bg-[#fff4df] text-[#c99a2e] border border-[#f6e3bf]",
  low: "bg-[#f4f6f9] text-[#6b7280] border border-[#e5e8ef]",
};

const severityDot: Record<RegulatoryAlertSeverity, string> = {
  critical: "bg-[#ef2f32]",
  high: "bg-[#f3a000]",
  medium: "bg-[#e0af3a]",
  low: "bg-[#9ca3af]",
};

const statusStyle: Record<RegulatoryAlertStatus, string> = {
  open: "border border-[#e1e5ee] text-[#2f3541] bg-white",
  in_review: "border border-[#dce7ff] bg-[#eef4ff] text-[#2661d8]",
  resolved: "border border-[#caebd1] bg-[#ecfaf0] text-[#1ea43b]",
};

type Reviewer = { id: string; name: string; title: string };

function mapTeamMembersToReviewers(members: ComplianceTeamMember[]): Reviewer[] {
  return members
    .filter((m) => m.status?.toLowerCase() !== "removed" && Boolean(m.user))
    .map((m) => ({
      id: m.user as string,
      name: m.full_name,
      title: m.role_detail?.name || m.department || "Team member",
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

  return { reviewers: mapTeamMembersToReviewers(members) };
}

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
  onAssign,
}: {
  alert: RegulatoryAlertRecord;
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
                onAssign();
              }}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] font-medium text-[#2f3541] hover:bg-[#f7f9fc]"
            >
              {alert.assigned_to ? "Re-assign to" : "Assign to"}
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
        {isError ? "Alert unavailable" : "No alerts yet"}
      </div>
      <p className="max-w-[320px] text-[13px] text-[#8a92a1]">
        {isError
          ? "We couldn't load regulatory alerts. Check your connection and try again."
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
  onSetStatus,
  isUpdatingStatus,
}: {
  alert: RegulatoryAlertRecord;
  onClose: () => void;
  onAssign: () => void;
  onSetStatus: (status: RegulatoryAlertStatus) => void;
  isUpdatingStatus: boolean;
}) {
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
            {alert.miner_code ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f4f6f9] px-2.5 py-1 text-[11px] font-medium text-[#6b7280]">
                {alert.miner_code}
              </span>
            ) : null}
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
            <h3 className="text-[20px] font-semibold text-[#1c2230]">{ALERT_TYPE_LABEL[alert.alert_type]}</h3>
            <span className={classNames("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", severityBadgeStyle[alert.severity])}>
              <span className={classNames("h-1.5 w-1.5 rounded-full", severityDot[alert.severity])} />
              {SEVERITY_LABEL[alert.severity]}
            </span>
          </div>

          <section>
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">Overview</div>
            <div className="grid grid-cols-2 gap-y-4 rounded-[14px] border border-[#e8ecf4] bg-[#fbfcfe] p-4 text-[13px]">
              <div>
                <div className="text-[#8a92a1]">Miner</div>
                <div className="mt-1 font-semibold text-[#2a2f39]">{alert.miner_name || "—"}</div>
              </div>
              <div>
                <div className="text-[#8a92a1]">Status</div>
                <div className="mt-1">
                  <span className={classNames("inline-flex items-center rounded-[8px] px-2.5 py-1 text-[11px] font-semibold", statusStyle[alert.status])}>
                    {STATUS_LABEL[alert.status]}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-[#8a92a1]">Reviewer</div>
                <div className="mt-1 font-semibold text-[#2a2f39]">{alert.assigned_to_name || "Unassigned"}</div>
              </div>
              <div>
                <div className="text-[#8a92a1]">Mineral</div>
                <div className="mt-1 font-semibold text-[#2a2f39]">{alert.mineral || "—"}</div>
              </div>
              <div>
                <div className="text-[#8a92a1]">Created on</div>
                <div className="mt-1 font-semibold text-[#2a2f39]">{formatDateTime(alert.created_at)}</div>
              </div>
              <div>
                <div className="text-[#8a92a1]">Location</div>
                <div className="mt-1 font-semibold text-[#2a2f39]">{alert.location || "—"}</div>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">Why this alert was triggered</div>
            <div className="rounded-[14px] border border-[#e8ecf4] bg-[#fbfcfe] p-4">
              <div className="text-[13px] font-semibold text-[#2a2f39]">{alert.rule_name || ALERT_TYPE_LABEL[alert.alert_type]}</div>
              <p className="mt-1.5 text-[13px] leading-5 text-[#5d6675]">
                {alert.rule_description || "No linked compliance rule description is available for this alert."}
              </p>
            </div>
          </section>

          {alert.miner_name ? (
            <section>
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">Related entity</div>
              <div className="flex items-center justify-between rounded-[14px] border border-[#e8ecf4] bg-[#fbfcfe] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef4ff] text-[12px] font-semibold text-[#2661d8]">
                    {alert.miner_name.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <div className="text-[13px] font-semibold text-[#2a2f39]">{alert.miner_name}</div>
                    <div className="text-[12px] text-[#8a92a1]">Mining company</div>
                  </div>
                </div>
                <RightOutlined className="text-[10px] text-[#8a92a1]" />
              </div>
            </section>
          ) : null}

          <section>
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a92a1]">Timeline</div>
            <div className="space-y-2 rounded-[14px] border border-[#e8ecf4] bg-[#fbfcfe] p-4 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-[#8a92a1]">Created</span>
                <span className="font-medium text-[#2a2f39]">{formatDateTime(alert.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8a92a1]">Last updated</span>
                <span className="font-medium text-[#2a2f39]">{formatDateTime(alert.updated_at)}</span>
              </div>
              {alert.resolved_at ? (
                <div className="flex items-center justify-between">
                  <span className="text-[#8a92a1]">Resolved</span>
                  <span className="font-medium text-[#2a2f39]">{formatDateTime(alert.resolved_at)}</span>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-[#edf1f7] px-6 py-4">
          <button
            type="button"
            onClick={onAssign}
            className="inline-flex h-10 items-center rounded-[10px] border border-[#dce7ff] bg-[#eef4ff] px-4 text-[13px] font-semibold text-[#2661d8] hover:bg-[#e2ecff]"
          >
            {alert.assigned_to ? "Re-assign" : "Assign"}
          </button>
          {alert.status !== "in_review" ? (
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => onSetStatus("in_review")}
              className="inline-flex h-10 items-center rounded-[10px] border border-[#f6e3bf] bg-white px-4 text-[13px] font-semibold text-[#df8b19] hover:bg-[#fffaf0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Start Review
            </button>
          ) : null}
          {alert.status !== "resolved" ? (
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => onSetStatus("resolved")}
              className="ml-auto inline-flex h-10 items-center rounded-[10px] bg-[#14244a] px-5 text-[13px] font-semibold !text-white hover:bg-[#182c57] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Mark Resolved
            </button>
          ) : (
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => onSetStatus("open")}
              className="ml-auto inline-flex h-10 items-center rounded-[10px] border border-[#e1e5ee] bg-white px-4 text-[13px] font-semibold text-[#2f3541] hover:bg-[#f7f9fc] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reopen
            </button>
          )}
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
  alert: RegulatoryAlertRecord;
  reviewers: Reviewer[];
  onClose: () => void;
  onAssigned: (reviewerId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>(reviewers[0]?.id ?? "");
  const isReassign = Boolean(alert.assigned_to);

  const filtered = useMemo(
    () =>
      reviewers.filter((r) =>
        search.trim() ? r.name.toLowerCase().includes(search.toLowerCase()) || r.title.toLowerCase().includes(search.toLowerCase()) : true,
      ),
    [search, reviewers],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(22,28,36,0.6)] px-4 py-8">
      <div className="relative w-full max-w-[480px] rounded-[20px] bg-white shadow-[0_40px_120px_-56px_rgba(15,23,42,0.75)]">
        <div className="flex items-start justify-between border-b border-[#edf1f6] px-6 py-5">
          <div>
            <h2 className="text-[17px] font-semibold text-[#252b37]">{isReassign ? "Re-assign Reviewer" : "Assign Reviewer"}</h2>
            <p className="mt-1 text-[13px] text-[#8a92a1]">
              Select a team member{alert.miner_code ? ` to handle case ${alert.miner_code}` : ""}
            </p>
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
              placeholder="Search by name or role..."
              className="h-11 w-full rounded-[12px] border border-[#dfe4ec] bg-white pl-9 pr-3 text-[13px] text-[#2d3441] outline-none placeholder:text-[#a0a6b3] focus:border-[#101e3d]"
            />
          </div>

          {reviewers.length === 0 ? (
            <p className="mt-4 text-[13px] text-[#8a92a1]">
              No active team members found. Invite reviewers from Settings → Teams & Roles — they can be assigned once they accept their invite.
            </p>
          ) : (
            <div className="mt-4 max-h-[280px] space-y-2 overflow-y-auto">
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
                  <input type="radio" name="reviewer" checked={selectedId === r.id} onChange={() => setSelectedId(r.id)} className="h-4 w-4" />
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1f6] px-6 py-4">
          <span className="flex items-center gap-1.5 text-[12px] text-[#8a92a1]">
            <ExclamationCircleOutlined /> Assignment updates the alert immediately.
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
              onClick={() => selectedId && onAssigned(selectedId)}
              disabled={!selectedId}
              className="inline-flex h-10 items-center rounded-[10px] bg-[#14244a] px-4 text-[13px] font-semibold !text-white hover:bg-[#182c57] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Confirm assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RegulatoryAlertsView() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);
  const [assignTargetId, setAssignTargetId] = useState<string | null>(null);
  const { reviewers } = useReviewerDirectory();

  const alertsQ = useQuery({
    queryKey: ["regulatoryAlerts"],
    queryFn: () => getRegulatoryAlerts(),
    retry: false,
  });

  const policyAlertsQ = useQuery({
    queryKey: ["policyAlerts"],
    queryFn: getPolicyAlerts,
    retry: false,
  });

  const rawAlerts = alertsQ.data?.data;
  const alerts: RegulatoryAlertRecord[] = Array.isArray(rawAlerts) ? rawAlerts : rawAlerts?.results ?? [];

  const rawPolicyAlerts = policyAlertsQ.data?.data;
  const policyAlerts = Array.isArray(rawPolicyAlerts) ? rawPolicyAlerts : rawPolicyAlerts?.results ?? [];

  const statusMutation = useMutation({
    mutationFn: ({ alertId, status }: { alertId: string; status: RegulatoryAlertStatus }) =>
      updateRegulatoryAlertStatus(alertId, status),
    onSuccess: () => {
      showToast("Alert status updated", "success");
      queryClient.invalidateQueries({ queryKey: ["regulatoryAlerts"] });
    },
    onError: (error: unknown) => {
      showToast(getApiErrorMessage(error, "Unable to update this alert right now."), "error");
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ alertId, reviewerId }: { alertId: string; reviewerId: string }) =>
      assignRegulatoryAlert(alertId, reviewerId),
    onSuccess: () => {
      showToast("Reviewer assigned successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["regulatoryAlerts"] });
      setAssignTargetId(null);
    },
    onError: (error: unknown) => {
      showToast(getApiErrorMessage(error, "Unable to assign this alert right now."), "error");
    },
  });

  const filteredAlerts = alerts.filter((a) =>
    search.trim()
      ? (a.miner_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.miner_code || "").toLowerCase().includes(search.toLowerCase()) ||
        ALERT_TYPE_LABEL[a.alert_type].toLowerCase().includes(search.toLowerCase())
      : true,
  );

  const activeAlert = alerts.find((a) => a.id === activeAlertId) ?? null;
  const assignTarget = alerts.find((a) => a.id === assignTargetId) ?? null;

  const criticalCount = alerts.filter((a) => a.severity === "critical" && a.status !== "resolved").length;
  const highCount = alerts.filter((a) => a.severity === "high" && a.status !== "resolved").length;
  const inReviewCount = alerts.filter((a) => a.status === "in_review").length;
  const resolvedTodayCount = alerts.filter((a) => {
    if (!a.resolved_at) return false;
    const resolvedDate = new Date(a.resolved_at);
    const today = new Date();
    return (
      resolvedDate.getFullYear() === today.getFullYear() &&
      resolvedDate.getMonth() === today.getMonth() &&
      resolvedDate.getDate() === today.getDate()
    );
  }).length;

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
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["regulatoryAlerts"] });
              queryClient.invalidateQueries({ queryKey: ["policyAlerts"] });
              showToast("Alerts refreshed", "success");
            }}
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
          value={String(criticalCount)}
          label="Critical Alerts"
          sub="Require immediate action"
        />
        <MetricCard
          icon={<WarningOutlined />}
          iconBg="bg-[#fff4df]"
          iconColor="text-[#df8b19]"
          value={String(highCount)}
          label="High Severity"
          sub="Action within 24-72 hrs"
        />
        <MetricCard
          icon={<ExclamationCircleOutlined />}
          iconBg="bg-[#eef4ff]"
          iconColor="text-[#2661d8]"
          value={String(inReviewCount)}
          label="In Review"
          sub="Under active investigation"
        />
        <MetricCard
          icon={<CheckCircleOutlined />}
          iconBg="bg-[#ecfaf0]"
          iconColor="text-[#1ea43b]"
          value={String(resolvedTodayCount)}
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
          { dot: "bg-[#9ca3af]", label: "Low", desc: "Monitor" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-[#4b5260]">
            <span className={classNames("h-2 w-2 rounded-full", item.dot)} />
            <span className="font-medium">{item.label}</span>
            <span className="text-[#8a92a1]">{item.desc}</span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-[420px]">
        <SearchOutlined className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a6b3] text-[13px]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search miner, miner ID, alert type..."
          className="h-10 w-full rounded-[10px] border border-[#dfe4ec] bg-white pl-9 pr-3 text-[13px] text-[#2d3441] outline-none placeholder:text-[#a0a6b3] focus:border-[#101e3d]"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[14px] border border-[#e5e9f1] bg-white">
        {alertsQ.isLoading ? (
          <div className="px-6 py-20 text-center text-[13px] text-[#8a92a1]">Loading alerts…</div>
        ) : alertsQ.isError ? (
          <AlertsEmptyState variant="error" onRefresh={() => alertsQ.refetch()} />
        ) : filteredAlerts.length === 0 ? (
          <AlertsEmptyState variant="empty" onRefresh={() => alertsQ.refetch()} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-separate border-spacing-0 text-left text-[13px]">
                <thead>
                  <tr className="bg-[#fafbfe] text-[#6b7280]">
                    <th className="border-b border-[#e5e9f1] px-4 py-3 font-medium">Severity</th>
                    <th className="border-b border-[#e5e9f1] px-3 py-3 font-medium">Alert type</th>
                    <th className="border-b border-[#e5e9f1] px-3 py-3 font-medium">Miner</th>
                    <th className="border-b border-[#e5e9f1] px-3 py-3 font-medium">Miner ID</th>
                    <th className="border-b border-[#e5e9f1] px-3 py-3 font-medium">Assigned</th>
                    <th className="border-b border-[#e5e9f1] px-3 py-3 font-medium">Status</th>
                    <th className="border-b border-[#e5e9f1] px-3 py-3 font-medium">More</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.map((alert, index) => (
                    <tr
                      key={alert.id}
                      onClick={() => setActiveAlertId(alert.id)}
                      className={classNames("cursor-pointer transition-colors", index % 2 === 0 ? "bg-white" : "bg-[#fafbfe]", "hover:bg-[#f4f7fc]")}
                    >
                      <td className="border-b border-[#f0f3f8] px-4 py-3">
                        <span className={classNames("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", severityBadgeStyle[alert.severity])}>
                          <span className={classNames("h-1.5 w-1.5 rounded-full", severityDot[alert.severity])} />
                          {SEVERITY_LABEL[alert.severity]}
                        </span>
                      </td>
                      <td className="border-b border-[#f0f3f8] px-3 py-3 font-medium text-[#2a2f39] whitespace-nowrap">{ALERT_TYPE_LABEL[alert.alert_type]}</td>
                      <td className="border-b border-[#f0f3f8] px-3 py-3 text-[#4b5260]">{alert.miner_name || "—"}</td>
                      <td className="border-b border-[#f0f3f8] px-3 py-3 font-mono text-[#5d6675]">{alert.miner_code || "—"}</td>
                      <td className="border-b border-[#f0f3f8] px-3 py-3 text-[#4b5260]">{alert.assigned_to_name || "Unassigned"}</td>
                      <td className="border-b border-[#f0f3f8] px-3 py-3">
                        <span className={classNames("inline-flex items-center rounded-[8px] px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap", statusStyle[alert.status])}>
                          {STATUS_LABEL[alert.status]}
                        </span>
                      </td>
                      <td className="border-b border-[#f0f3f8] px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <MoreMenu alert={alert} onAssign={() => setAssignTargetId(alert.id)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-[#f0f3f8] px-4 py-3 text-[13px] text-[#8a92a1]">
              <span>
                Showing {filteredAlerts.length} of {alerts.length} alerts
              </span>
            </div>
          </>
        )}
      </div>

      {/* Regulatory Policy Alerts */}
      <div className="rounded-[14px] border border-[#e8ecf4] bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f3f8]">
          <div className="flex items-center gap-2">
            <BellOutlined className="text-[#2661d8]" />
            <span className="text-[15px] font-semibold text-[#2a2f39]">Regulatory Policy Alerts</span>
            {policyAlerts.length > 0 ? (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2661d8] text-[11px] font-semibold text-white">
                {policyAlerts.length}
              </span>
            ) : null}
          </div>
          <span className="text-[12px] text-[#8a92a1]">Institution-level regulatory updates</span>
        </div>

        {policyAlerts.length === 0 ? (
          <div className="px-5 py-8 text-center text-[13px] text-[#8a92a1]">No policy updates published yet.</div>
        ) : (
          <div className="divide-y divide-[#f0f3f8]">
            {policyAlerts.map((p) => (
              <div key={p.id} className="flex items-start gap-4 px-5 py-4">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-[#2661d8]">
                  <BellOutlined className="text-[14px]" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-semibold text-[#2a2f39]">{p.title}</span>
                    <span className={classNames("inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold", severityBadgeStyle[p.severity])}>
                      {SEVERITY_LABEL[p.severity]}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[12px] text-[#8a92a1]">
                    {p.category} · {formatDateTime(p.published_at)}
                  </div>
                  <div className="mt-1 text-[13px] text-[#5d6675] leading-5">{p.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeAlert ? (
        <AlertDetailDrawer
          alert={activeAlert}
          onClose={() => setActiveAlertId(null)}
          onAssign={() => setAssignTargetId(activeAlert.id)}
          onSetStatus={(status) => statusMutation.mutate({ alertId: activeAlert.id, status })}
          isUpdatingStatus={statusMutation.isPending}
        />
      ) : null}

      {assignTarget ? (
        <AssignReviewerModal
          alert={assignTarget}
          reviewers={reviewers}
          onClose={() => setAssignTargetId(null)}
          onAssigned={(reviewerId) => assignMutation.mutate({ alertId: assignTarget.id, reviewerId })}
        />
      ) : null}
    </div>
  );
}
