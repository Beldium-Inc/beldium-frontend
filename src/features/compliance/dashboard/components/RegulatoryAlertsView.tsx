"use client";

import { useState } from "react";
import {
  AlertOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  DownloadOutlined,
  ExportOutlined,
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
  RiseOutlined,
  SearchOutlined,
  UserAddOutlined,
  WarningOutlined,
  WarningFilled,
  BellOutlined,
  FireOutlined,
  EnvironmentOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ─── Types ──────────────────────────────────────────────────────────────────

type AlertSeverity = "Critical" | "High" | "Medium" | "Low";
type AlertStatus = "Open" | "Investigating" | "Awaiting Response" | "Resolved";

type RegAlert = {
  id: string;
  severity: AlertSeverity;
  alertType: string;
  alertTypeIcon: "license" | "eia" | "threshold" | "clock" | "verification" | "inactive" | "esg" | "duplicate" | "community" | "tamper" | "export";
  miner: string;
  caseId: string;
  triggeredRule: string;
  assigned: string;
  created: string;
  status: AlertStatus;
};

type PolicyAlert = {
  id: string;
  title: string;
  severity: "High" | "Critical" | "Medium";
  category: string;
  date: string;
  description: string;
};

// ─── Mock data ───────────────────────────────────────────────────────────────

const ALERTS: RegAlert[] = [
  { id: "1", severity: "Critical", alertType: "Expired Mining License", alertTypeIcon: "license", miner: "GreenRock Resources", caseId: "BLD-00231", triggeredRule: "RULE-017: Valid mining licens...", assigned: "A. Bello", created: "Today", status: "Open" },
  { id: "2", severity: "Critical", alertType: "Missing EIA", alertTypeIcon: "eia", miner: "NorthEdge Copper", caseId: "BLD-00215", triggeredRule: "RULE-041: EIA required befor...", assigned: "A. Bello", created: "Today", status: "Investigating" },
  { id: "3", severity: "High", alertType: "Exceeded Production Threshold", alertTypeIcon: "threshold", miner: "TriVault Minerals", caseId: "BLD-00219", triggeredRule: "RULE-089: Production cap 15...", assigned: "F. Osei", created: "Yesterday", status: "Investigating" },
  { id: "4", severity: "High", alertType: "Expiring License", alertTypeIcon: "clock", miner: "Meridian Bauxite Ltd", caseId: "BLD-00209", triggeredRule: "RULE-022: License expiry 30-...", assigned: "I. Musa", created: "Jan 19", status: "Awaiting Response" },
  { id: "5", severity: "High", alertType: "Failed Verification Rule", alertTypeIcon: "verification", miner: "Atlas Mining Co.", caseId: "BLD-00228", triggeredRule: "RULE-033: Carbon report mar...", assigned: "I. Musa", created: "Jan 18", status: "Open" },
  { id: "6", severity: "Medium", alertType: "Inactive Submission", alertTypeIcon: "inactive", miner: "SahelOre Partners", caseId: "BLD-00201", triggeredRule: "RULE-055: 30-day inactivity t...", assigned: "F. Osei", created: "Jan 17", status: "Open" },
  { id: "7", severity: "Medium", alertType: "High ESG Risk", alertTypeIcon: "esg", miner: "Ironclad Mining Ltd", caseId: "BLD-00196", triggeredRule: "RULE-071: ESG risk score thre...", assigned: "A. Bello", created: "Jan 16", status: "Investigating" },
  { id: "8", severity: "Medium", alertType: "Duplicate Documents", alertTypeIcon: "duplicate", miner: "BornoMines Corp", caseId: "BLD-00188", triggeredRule: "RULE-014: Duplicate docume...", assigned: "I. Musa", created: "Jan 15", status: "Awaiting Response" },
  { id: "9", severity: "Low", alertType: "Community Complaint", alertTypeIcon: "community", miner: "PlainsGold Ltd", caseId: "BLD-00177", triggeredRule: "RULE-062: Community compl...", assigned: "F. Osei", created: "Jan 14", status: "Resolved" },
  { id: "10", severity: "Critical", alertType: "Document Tampering", alertTypeIcon: "tamper", miner: "DeltaOre Co.", caseId: "BLD-00165", triggeredRule: "RULE-099: Document integrit...", assigned: "A. Bello", created: "Jan 13", status: "Investigating" },
  { id: "11", severity: "Low", alertType: "Export Permit Expiring", alertTypeIcon: "export", miner: "KogiteMin Ltd", caseId: "BLD-00158", triggeredRule: "RULE-022: Export permit expi...", assigned: "I. Musa", created: "Jan 12", status: "Awaiting Response" },
];

const POLICY_ALERTS: PolicyAlert[] = [
  {
    id: "p1",
    title: "NESREA Environmental Guidelines Revised",
    severity: "High",
    category: "Environmental Policy",
    date: "Jan 20, 2026",
    description: "Updated emission standards for lithium and cobalt extraction operations effective March 1, 2026.",
  },
  {
    id: "p2",
    title: "New Export Regulation: Critical Minerals",
    severity: "Critical",
    category: "Export Regulation",
    date: "Jan 18, 2026",
    description: "NXA Regulation 2026-04 imposes new documentation requirements for critical mineral exports. Compliance deadline: Feb 15, 2026.",
  },
  {
    id: "p3",
    title: "Mining Act Amendment: Section 44",
    severity: "Medium",
    category: "Legislative Update",
    date: "Jan 15, 2026",
    description: "Amendments to the Nigerian Mining Act expand EIA requirements to operations above 8,000 MT/year (previously 10,000 MT).",
  },
];

// ─── Severity styles ─────────────────────────────────────────────────────────

const severityBadgeStyle: Record<AlertSeverity, string> = {
  Critical: "bg-[#fff0f1] text-[#ef2f32] border border-[#f7d6d7]",
  High: "bg-[#fff4df] text-[#df8b19] border border-[#f6e3bf]",
  Medium: "bg-[#eef4ff] text-[#2661d8] border border-[#dce7ff]",
  Low: "bg-[#f4f6f9] text-[#6b7280] border border-[#e5e8ef]",
};

const severityDot: Record<AlertSeverity, string> = {
  Critical: "bg-[#ef2f32]",
  High: "bg-[#f3a000]",
  Medium: "bg-[#2661d8]",
  Low: "bg-[#9ca3af]",
};

const statusStyle: Record<AlertStatus, string> = {
  Open: "bg-[#fff0f1] text-[#ef2f32] border border-[#f7d6d7]",
  Investigating: "bg-[#fff4df] text-[#df8b19] border border-[#f6e3bf]",
  "Awaiting Response": "bg-[#eef4ff] text-[#2661d8] border border-[#dce7ff]",
  Resolved: "bg-[#ecfaf0] text-[#1ea43b] border border-[#caebd1]",
};

const policyBadgeStyle: Record<string, string> = {
  High: "bg-[#fff4df] text-[#df8b19] border border-[#f6e3bf]",
  Critical: "bg-[#fff0f1] text-[#ef2f32] border border-[#f7d6d7]",
  Medium: "bg-[#eef4ff] text-[#2661d8] border border-[#dce7ff]",
};

// ─── Alert type icon ─────────────────────────────────────────────────────────

function AlertTypeIcon({ type }: { type: RegAlert["alertTypeIcon"] }) {
  const base = "flex h-7 w-7 items-center justify-center rounded-full text-[13px]";
  switch (type) {
    case "license": return <span className={classNames(base, "bg-[#fff0f1] text-[#ef2f32]")}><WarningFilled /></span>;
    case "eia": return <span className={classNames(base, "bg-[#fff0f1] text-[#ef2f32]")}><AlertOutlined /></span>;
    case "threshold": return <span className={classNames(base, "bg-[#fff4df] text-[#df8b19]")}><RiseOutlined /></span>;
    case "clock": return <span className={classNames(base, "bg-[#fff4df] text-[#df8b19]")}><ClockCircleOutlined /></span>;
    case "verification": return <span className={classNames(base, "bg-[#fff4df] text-[#df8b19]")}><CloseOutlined /></span>;
    case "inactive": return <span className={classNames(base, "bg-[#eef4ff] text-[#2661d8]")}><LineChartOutlined /></span>;
    case "esg": return <span className={classNames(base, "bg-[#eef4ff] text-[#2661d8]")}><FireOutlined /></span>;
    case "duplicate": return <span className={classNames(base, "bg-[#eef4ff] text-[#2661d8]")}><FilterOutlined /></span>;
    case "community": return <span className={classNames(base, "bg-[#f4f6f9] text-[#6b7280]")}><BellOutlined /></span>;
    case "tamper": return <span className={classNames(base, "bg-[#fff0f1] text-[#ef2f32]")}><WarningOutlined /></span>;
    case "export": return <span className={classNames(base, "bg-[#f4f6f9] text-[#6b7280]")}><ExportOutlined /></span>;
  }
}

// ─── Metric card ─────────────────────────────────────────────────────────────

function MetricCard({
  icon,
  iconBg,
  iconColor,
  value,
  label,
  sub,
  borderColor,
  valueColor,
  badge,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  sub: string;
  borderColor: string;
  valueColor: string;
  badge?: string;
}) {
  return (
    <div className={classNames("relative rounded-[18px] border bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]", borderColor)}>
      {badge ? (
        <div className="absolute right-4 top-4 text-[12px] font-semibold text-[#ef2f32]">{badge}</div>
      ) : null}
      <span className={classNames("inline-flex h-10 w-10 items-center justify-center rounded-[12px] text-[20px]", iconBg, iconColor)}>
        {icon}
      </span>
      <div className={classNames("mt-3 text-[32px] font-bold leading-none tracking-[-0.04em]", valueColor)}>{value}</div>
      <div className="mt-1.5 text-[14px] font-semibold text-[#2a2f39]">{label}</div>
      <div className="mt-0.5 text-[12px] text-[#8a92a1]">{sub}</div>
    </div>
  );
}

// ─── Risk insights sidebar ────────────────────────────────────────────────────

function RiskInsightsSidebar({ onClose }: { onClose: () => void }) {
  return (
    <aside className="w-[280px] shrink-0 rounded-[18px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[15px] font-semibold text-[#2a2f39]">
          <span className="text-[#f3a000]"><ThunderboltOutlined /></span>
          Risk Insights
        </div>
        <button type="button" onClick={onClose} className="text-[#8a92a1] hover:text-[#2a2f39]">
          <CloseOutlined className="text-[14px]" />
        </button>
      </div>

      <div className="space-y-4 text-[13px]">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8a92a1] mb-2">Most Common Alert</div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-[#ef2f32]"><WarningFilled className="text-[13px]" /></span>
            <div>
              <div className="font-semibold text-[#2a2f39]">Expired License</div>
              <div className="text-[#8a92a1]">4 instances this week</div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8a92a1] mb-2">Fastest Growing Risk</div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-[#df8b19]"><RiseOutlined className="text-[13px]" /></span>
            <div>
              <div className="font-semibold text-[#2a2f39]">High ESG Score</div>
              <div className="text-[#8a92a1]">+38% in 30 days</div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8a92a1] mb-2">Highest Incident Region</div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-[#ef2f32]"><EnvironmentOutlined className="text-[13px]" /></span>
            <div>
              <div className="font-semibold text-[#2a2f39]">Plateau State</div>
              <div className="text-[#8a92a1]">3 critical alerts</div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8a92a1] mb-2">Most Violations</div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-[#ef2f32]"><WarningFilled className="text-[13px]" /></span>
            <div>
              <div className="font-semibold text-[#2a2f39]">NorthEdge Copper</div>
              <div className="text-[#8a92a1]">5 open alerts</div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[#f0f3f8]">
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8a92a1] mb-3">Upcoming Expiries</div>
          <div className="space-y-2">
            {[
              { label: "EIA Certificate, GreenRock", days: "14d", color: "text-[#ef2f32]" },
              { label: "Export License, Meridian", days: "21d", color: "text-[#df8b19]" },
              { label: "Mining License, KogiteMin", days: "28d", color: "text-[#df8b19]" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-[#4b5260] truncate max-w-[180px]">{item.label}</span>
                <span className={classNames("font-semibold shrink-0 ml-2", item.color)}>{item.days}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-[#f0f3f8]">
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8a92a1] mb-3">Pending Escalations</div>
          <div className="space-y-2">
            {[
              { label: "Document Tampering, DeltaOre", color: "bg-[#ef2f32]" },
              { label: "Production Cap, TriVault", color: "bg-[#f3a000]" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={classNames("h-2 w-2 rounded-full shrink-0", item.color)} />
                <span className="text-[#4b5260] text-[12px]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-[#f0f3f8]">
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8a92a1] mb-3">Alert Volume (7d)</div>
          <div className="flex items-end gap-1 h-12">
            {[3, 5, 2, 7, 4, 6, 3].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-[#e8ecf4] rounded-sm"
                style={{ height: `${(h / 7) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-[#8a92a1]">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RegulatoryAlertsView() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showInsights, setShowInsights] = useState(true);
  const [search, setSearch] = useState("");

  const allChecked = selectedIds.size === ALERTS.length;

  const toggleAll = () => {
    if (allChecked) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(ALERTS.map((a) => a.id)));
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

  const filteredAlerts = ALERTS.filter((a) =>
    search.trim()
      ? a.miner.toLowerCase().includes(search.toLowerCase()) ||
        a.caseId.toLowerCase().includes(search.toLowerCase()) ||
        a.alertType.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[#2a2f39]">Regulatory Alerts</h1>
          <p className="mt-1 max-w-[540px] text-[14px] text-[#7a8291]">
            Monitor regulatory risks, compliance breaches, expiring obligations, and escalated cases across all registered mining operations.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#e1e5ee] bg-white px-4 text-[13px] font-medium text-[#2f3541] hover:bg-[#f7f9fc] transition-colors">
            <DownloadOutlined />
            Export Alerts
          </button>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#e1e5ee] bg-white px-4 text-[13px] font-medium text-[#2f3541] hover:bg-[#f7f9fc] transition-colors">
            <PlusOutlined />
            Create Rule
          </button>
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#e1e5ee] bg-white text-[#2f3541] hover:bg-[#f7f9fc] transition-colors">
            <ReloadOutlined />
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          icon={<WarningFilled />}
          iconBg="bg-[#fff0f1]"
          iconColor="text-[#ef2f32]"
          value="3"
          label="Critical Alerts"
          sub="Require immediate action"
          borderColor="border-[#f7d6d7]"
          valueColor="text-[#ef2f32]"
        />
        <MetricCard
          icon={<WarningOutlined />}
          iconBg="bg-[#fff4df]"
          iconColor="text-[#df8b19]"
          value="3"
          label="Warnings"
          sub="Action within 24-72 hrs"
          borderColor="border-[#f6e3bf]"
          valueColor="text-[#df8b19]"
        />
        <MetricCard
          icon={<ArrowUpOutlined />}
          iconBg="bg-[#eef4ff]"
          iconColor="text-[#2661d8]"
          value="4"
          label="Escalated Cases"
          sub="Under active investigation"
          borderColor="border-[#dce7ff]"
          valueColor="text-[#2661d8]"
        />
        <MetricCard
          icon={<CheckCircleOutlined />}
          iconBg="bg-[#ecfaf0]"
          iconColor="text-[#1ea43b]"
          value="1"
          label="Resolved Today"
          sub="Successfully closed"
          borderColor="border-[#caebd1]"
          valueColor="text-[#1ea43b]"
          badge="▲ 1"
        />
      </div>

      {/* Priority matrix */}
      <div className="flex flex-wrap items-center gap-4 rounded-[12px] border border-[#e8ecf4] bg-white px-5 py-3 text-[13px]">
        <span className="font-semibold text-[#2a2f39] uppercase tracking-[0.06em] text-[11px]">Priority Matrix</span>
        {[
          { dot: "bg-[#ef2f32]", label: "Critical", desc: "Immediate action" },
          { dot: "bg-[#f3a000]", label: "High", desc: "Within 24 hours" },
          { dot: "bg-[#2661d8]", label: "Medium", desc: "Within 7 days" },
          { dot: "bg-[#9ca3af]", label: "Low", desc: "Monitor" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-[#4b5260]">
            <span className={classNames("h-2 w-2 rounded-full", item.dot)} />
            <span className="font-medium">{item.label}</span>
            <span className="text-[#8a92a1]">{item.desc}</span>
          </div>
        ))}
      </div>

      {/* Table + sidebar */}
      <div className="flex gap-4 items-start">
        <div className="min-w-0 flex-1 space-y-3">
          {/* Search + filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px] max-w-[320px]">
              <SearchOutlined className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a6b3] text-[13px]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search miner, case ID, alert type..."
                className="h-9 w-full rounded-[10px] border border-[#dfe4ec] bg-white pl-9 pr-3 text-[13px] text-[#2d3441] outline-none placeholder:text-[#a0a6b3] focus:border-[#101e3d]"
              />
            </div>
            <select className="h-9 rounded-[10px] border border-[#dfe4ec] bg-white px-3 text-[13px] text-[#4b5260] outline-none appearance-none min-w-[100px]">
              <option>All Severity</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <select className="h-9 rounded-[10px] border border-[#dfe4ec] bg-white px-3 text-[13px] text-[#4b5260] outline-none appearance-none min-w-[100px]">
              <option>All Status</option>
              <option>Open</option>
              <option>Investigating</option>
              <option>Awaiting Response</option>
              <option>Resolved</option>
            </select>
            <select className="h-9 rounded-[10px] border border-[#dfe4ec] bg-white px-3 text-[13px] text-[#4b5260] outline-none appearance-none min-w-[100px]">
              <option>All Assignees</option>
              <option>A. Bello</option>
              <option>F. Osei</option>
              <option>I. Musa</option>
            </select>
            {!showInsights && (
              <button
                type="button"
                onClick={() => setShowInsights(true)}
                className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#dce7ff] bg-[#eef4ff] px-4 text-[13px] font-medium text-[#2661d8]"
              >
                <ThunderboltOutlined /> Insights
              </button>
            )}
            {showInsights && (
              <button
                type="button"
                onClick={() => setShowInsights(true)}
                className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#dce7ff] bg-[#eef4ff] px-4 text-[13px] font-medium text-[#2661d8]"
              >
                <ThunderboltOutlined /> Insights
              </button>
            )}
          </div>

          {/* Bulk action bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 rounded-[10px] border border-[#dce7ff] bg-[#f0f5ff] px-4 py-2.5">
              <span className="rounded-full bg-[#2661d8] px-3 py-1 text-[12px] font-semibold text-white">
                {selectedIds.size} alert{selectedIds.size > 1 ? "s" : ""} selected
              </span>
              {[
                { icon: <UserAddOutlined />, label: "Assign Reviewer" },
                { icon: <ArrowUpOutlined />, label: "Escalate" },
                { icon: <DownloadOutlined />, label: "Export" },
                { icon: <CheckCircleOutlined />, label: "Mark Resolved" },
                { icon: <CloseOutlined />, label: "Dismiss" },
              ].map((action) => (
                <button
                  key={action.label}
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#dce3ef] bg-white px-3 py-1.5 text-[12px] font-medium text-[#2f3541] hover:bg-[#f8fafc] transition-colors"
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="ml-auto text-[#8a92a1] hover:text-[#2a2f39]"
              >
                <CloseOutlined className="text-[13px]" />
              </button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-hidden rounded-[14px] border border-[#e5e9f1] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left text-[13px]">
                <thead>
                  <tr className="bg-[#fafbfe] text-[#6b7280]">
                    <th className="border-b border-[#e5e9f1] px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={toggleAll}
                        className="rounded border-[#d1d5db]"
                      />
                    </th>
                    <th className="border-b border-[#e5e9f1] px-3 py-3 font-medium">Severity</th>
                    <th className="border-b border-[#e5e9f1] px-3 py-3 font-medium">Alert Type</th>
                    <th className="border-b border-[#e5e9f1] px-3 py-3 font-medium">Miner</th>
                    <th className="border-b border-[#e5e9f1] px-3 py-3 font-medium">Case ID</th>
                    <th className="border-b border-[#e5e9f1] px-3 py-3 font-medium">Triggered Rule</th>
                    <th className="border-b border-[#e5e9f1] px-3 py-3 font-medium">Assigned</th>
                    <th className="border-b border-[#e5e9f1] px-3 py-3 font-medium">Created</th>
                    <th className="border-b border-[#e5e9f1] px-3 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.map((alert, index) => {
                    const isSelected = selectedIds.has(alert.id);
                    return (
                      <tr
                        key={alert.id}
                        className={classNames(
                          "transition-colors",
                          isSelected ? "bg-[#f0f5ff]" : index % 2 === 0 ? "bg-white" : "bg-[#fafbfe]",
                          "hover:bg-[#f4f7fc]",
                        )}
                      >
                        <td className="border-b border-[#f0f3f8] px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleOne(alert.id)}
                            className="rounded border-[#d1d5db]"
                          />
                        </td>
                        <td className="border-b border-[#f0f3f8] px-3 py-3">
                          <span className={classNames("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", severityBadgeStyle[alert.severity])}>
                            <span className={classNames("h-1.5 w-1.5 rounded-full", severityDot[alert.severity])} />
                            {alert.severity}
                          </span>
                        </td>
                        <td className="border-b border-[#f0f3f8] px-3 py-3">
                          <div className="flex items-center gap-2">
                            <AlertTypeIcon type={alert.alertTypeIcon} />
                            <span className="font-medium text-[#2a2f39] whitespace-nowrap">{alert.alertType}</span>
                          </div>
                        </td>
                        <td className="border-b border-[#f0f3f8] px-3 py-3 text-[#4b5260]">{alert.miner}</td>
                        <td className="border-b border-[#f0f3f8] px-3 py-3 font-mono text-[#5d6675]">{alert.caseId}</td>
                        <td className="border-b border-[#f0f3f8] px-3 py-3 text-[#8a92a1] max-w-[180px] truncate">{alert.triggeredRule}</td>
                        <td className="border-b border-[#f0f3f8] px-3 py-3 text-[#4b5260]">{alert.assigned}</td>
                        <td className="border-b border-[#f0f3f8] px-3 py-3 text-[#8a92a1] whitespace-nowrap">{alert.created}</td>
                        <td className="border-b border-[#f0f3f8] px-3 py-3">
                          <span className={classNames("inline-flex items-center rounded-[8px] px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap", statusStyle[alert.status])}>
                            {alert.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-[#f0f3f8] px-4 py-3 text-[13px] text-[#8a92a1]">
              <span>Showing {filteredAlerts.length} of {ALERTS.length} alerts</span>
              <div className="flex items-center gap-1">
                <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#14244a] text-white text-[12px] font-semibold">1</button>
                <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-[#4b5260] hover:bg-[#f4f6fa] text-[12px]">2</button>
              </div>
            </div>
          </div>

          {/* Regulatory Policy Alerts */}
          <div className="rounded-[14px] border border-[#e8ecf4] bg-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f3f8]">
              <div className="flex items-center gap-2">
                <BellOutlined className="text-[#2661d8]" />
                <span className="text-[15px] font-semibold text-[#2a2f39]">Regulatory Policy Alerts</span>
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2661d8] text-[11px] font-semibold text-white">3</span>
              </div>
              <span className="text-[12px] text-[#8a92a1]">Institution-level regulatory updates</span>
            </div>

            <div className="divide-y divide-[#f0f3f8]">
              {POLICY_ALERTS.map((p) => (
                <div key={p.id} className="flex items-start gap-4 px-5 py-4">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-[#2661d8]">
                    <BellOutlined className="text-[14px]" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-semibold text-[#2a2f39]">{p.title}</span>
                      <span className={classNames("inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold", policyBadgeStyle[p.severity])}>
                        {p.severity}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[12px] text-[#8a92a1]">{p.category} · {p.date}</div>
                    <div className="mt-1 text-[13px] text-[#5d6675] leading-5">{p.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk insights */}
        {showInsights && (
          <RiskInsightsSidebar onClose={() => setShowInsights(false)} />
        )}
      </div>
    </div>
  );
}