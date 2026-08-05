"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  EnvironmentOutlined,
  TruckOutlined,
  ThunderboltOutlined,
  InboxOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  HistoryOutlined,
  FileTextOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { classNames, statusStyles } from "@/src/features/compliance/dashboard/lib/style";
import { showToast } from "@/src/store/toast.store";
import { getApiErrorMessage, updateShipmentStatus } from "./api";
import { useLogisticsRfqs, useRfqAssignments } from "./useLogisticsData";
import type { Rfq, RfqAssignment, ShipmentStatus } from "./types";
import SlideOver from "./SlideOver";

// Real ShipmentStatus enum only has 4 states (assigned/in_transit/delivered/
// cancelled). The stepper below reflects exactly those stages - no
// fabricated "Vehicle Assigned"/"Loading"/"Payment" stages.
const STEPS: { key: ShipmentStatus; label: string }[] = [
  { key: "assigned", label: "Assigned" },
  { key: "in_transit", label: "In Transit" },
  { key: "delivered", label: "Delivered" },
];

function stepIndex(status: ShipmentStatus | undefined) {
  if (!status || status === "cancelled") return -1;
  return STEPS.findIndex((s) => s.key === status);
}

function Stepper({ status }: { status: ShipmentStatus | undefined }) {
  const active = stepIndex(status);
  return (
    <div className="flex items-center gap-2 mt-4">
      {STEPS.map((step, i) => {
        const done = i <= active;
        return (
          <div key={step.key} className="flex items-center gap-2 flex-1">
            <div
              className={classNames(
                "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap",
                done ? "bg-[#101e3d] text-white" : "bg-[#f4f6f9] text-[#8b93a1]",
              )}
            >
              {done && <CheckOutlined className="text-[10px]" />}
              {step.label}
            </div>
            {i < STEPS.length - 1 && (
              <div className={classNames("h-[2px] flex-1", i < active ? "bg-[#101e3d]" : "bg-[#e5e8ef]")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function shipmentPill(status: ShipmentStatus | undefined) {
  switch (status) {
    case "in_transit":
      return statusStyles.cyan;
    case "delivered":
      return statusStyles.green;
    case "cancelled":
      return statusStyles.red;
    case "assigned":
    default:
      return statusStyles.amber;
  }
}

function shipmentLabel(status: ShipmentStatus | undefined) {
  switch (status) {
    case "in_transit":
      return "In Transit";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    case "assigned":
    default:
      return "Assigned";
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Not set";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function hoursRemaining(deadline: string | null | undefined) {
  if (!deadline) return null;
  return (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60);
}

function deadlineLabel(deadline: string | null | undefined) {
  const hours = hoursRemaining(deadline);
  if (hours === null) return "No deadline set";
  if (hours <= 0) return "Deadline passed";
  if (hours < 48) return `${Math.round(hours)} Hour${Math.round(hours) === 1 ? "" : "s"} Remaining`;
  return `${Math.round(hours / 24)} Days Remaining`;
}

function InfoTile({
  icon,
  label,
  value,
  muted,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-white text-[13px] text-[#5e6777] border border-[#e8ecf4]">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-[#8b93a1]">{label}</div>
        <div className={classNames("mt-0.5 text-[13px] font-medium", muted ? "text-[#b7bec9]" : "text-[#293041]")}>
          {value}
        </div>
      </div>
    </div>
  );
}

function RouteBox({ rfq }: { rfq: Rfq | undefined }) {
  return (
    <div className="rounded-[12px] border border-[#e8ecf4] bg-[#fafbfd] px-4 py-3 min-w-[220px]">
      <div className="flex items-start gap-2">
        <EnvironmentOutlined className="mt-1 text-[11px] text-[#101e3d]" />
        <div>
          <div className="text-[13px] font-semibold text-[#293041]">
            {rfq?.pickup_location || "Origin not specified"}
          </div>
          <div className="text-[11px] text-[#8b93a1]">Origin</div>
        </div>
      </div>
      <div className="my-2 ml-[5px] h-3 w-px bg-[#dbe0ea]" />
      <div className="flex items-start gap-2">
        <span className="mt-1 h-2 w-2 rounded-full bg-[#1ea43b]" />
        <div>
          <div className="text-[13px] font-semibold text-[#293041]">{rfq?.destination || "Destination not specified"}</div>
          <div className="text-[11px] text-[#8b93a1]">Destination</div>
        </div>
      </div>
    </div>
  );
}

function JobDetailsPanel({
  open,
  onClose,
  assignment,
  rfq,
}: {
  open: boolean;
  onClose: () => void;
  assignment: RfqAssignment | null;
  rfq: Rfq | undefined;
}) {
  if (!assignment) return null;
  const transaction = rfq?.transaction ?? null;
  return (
    <SlideOver open={open} onClose={onClose}>
      <div className="flex items-center justify-between border-b border-[#edf1f7] p-5">
        <h2 className="text-[16px] font-semibold text-[#172554]">Job Details</h2>
        <button type="button" onClick={onClose} className="text-[#8b93a1] hover:text-[#293041]">
          <CloseOutlined />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-[#8b93a1]">RFQ</div>
          <div className="mt-1 text-[15px] font-semibold text-[#172554]">{rfq?.rfq_code ?? assignment.rfq}</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#8b93a1]">Mineral</div>
            <div className="mt-0.5 text-[#293041]">{rfq?.mineral_type ?? "Not set"}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#8b93a1]">Total Weight</div>
            <div className="mt-0.5 text-[#293041]">{rfq?.total_weight ? `${rfq.total_weight} MT` : "Not set"}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#8b93a1]">Grade Spec</div>
            <div className="mt-0.5 text-[#293041]">{rfq?.grade_spec || "Not set"}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#8b93a1]">Incoterm</div>
            <div className="mt-0.5 text-[#293041]">{rfq?.incoterm || "Not set"}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#8b93a1]">Pricing Structure</div>
            <div className="mt-0.5 text-[#293041]">{rfq?.pricing_structure || "Not set"}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#8b93a1]">Job Value</div>
            <div className="mt-0.5 text-[#293041]">
              {transaction?.total_value ? `₦${Number(transaction.total_value).toLocaleString("en-NG")}` : "Not set"}
            </div>
          </div>
        </div>
        {rfq?.fleet_requirements && (
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#8b93a1]">Fleet Requirements</div>
            <div className="mt-0.5 text-[#293041]">{rfq.fleet_requirements}</div>
          </div>
        )}
        {rfq?.insurance_requirements && (
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#8b93a1]">Insurance Requirements</div>
            <div className="mt-0.5 text-[#293041]">{rfq.insurance_requirements}</div>
          </div>
        )}
        <div>
          <div className="text-[11px] uppercase tracking-wide text-[#8b93a1] mb-2">Driver &amp; Vehicle</div>
          <div className="rounded-[10px] border border-dashed border-[#e4e9f2] px-3 py-2.5 text-[#b7bec9]">
            Not available — no driver or vehicle records exist on the backend yet.
          </div>
        </div>
      </div>
    </SlideOver>
  );
}

function TimelinePanel({ assignment, rfq }: { assignment: RfqAssignment; rfq: Rfq | undefined }) {
  const transaction = rfq?.transaction;
  const entries = [
    { label: "RFQ Routed", value: rfq?.routed_at },
    { label: "Job Assigned", value: assignment.created_at },
    { label: "Job Accepted", value: assignment.accepted_at },
    { label: "Shipment Record Opened", value: transaction?.created_at },
    { label: "Last Status Update", value: transaction?.updated_at },
    { label: "Job Completed", value: assignment.completed_at },
  ].filter((e) => e.value);

  return (
    <div className="mt-4 rounded-[12px] border border-[#e8ecf4] bg-[#fafbfd] p-4">
      {entries.length === 0 ? (
        <p className="text-xs text-[#8b93a1]">No timestamps recorded for this job yet.</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.label} className="flex items-center justify-between text-xs">
              <span className="text-[#5d6675]">{entry.label}</span>
              <span className="font-medium text-[#293041]">{formatDateTime(entry.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function JobCard({ assignment, rfq }: { assignment: RfqAssignment; rfq: Rfq | undefined }) {
  const queryClient = useQueryClient();
  const transaction = rfq?.transaction ?? null;
  const pill = shipmentPill(transaction?.shipment_status);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const advance = useMutation({
    mutationFn: (shipment_status: ShipmentStatus) => {
      if (!transaction) throw new Error("No transaction record found for this job yet.");
      return updateShipmentStatus({ transactionId: transaction.id, shipment_status });
    },
    onSuccess: () => {
      showToast("Shipment status updated.", "success");
      queryClient.invalidateQueries({ queryKey: ["logistics"] });
    },
    onError: (error) => {
      showToast(getApiErrorMessage(error, "Could not update shipment status."), "error");
    },
  });

  const nextAction =
    !transaction || transaction.shipment_status === "assigned"
      ? { label: "Mark In Transit", icon: <TruckOutlined />, next: "in_transit" as ShipmentStatus }
      : transaction.shipment_status === "in_transit"
        ? { label: "Mark Delivered", icon: <CheckOutlined />, next: "delivered" as ShipmentStatus }
        : null;

  return (
    <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#172554]">{rfq?.mineral_type ? `${rfq.mineral_type} Transport` : "Mineral Transport"}</h3>
            <span className={classNames("text-[11px] font-medium px-2 py-0.5 rounded-full", pill.container)}>
              {shipmentLabel(transaction?.shipment_status)}
            </span>
          </div>
          <p className="text-xs text-[#8b93a1] mt-0.5">{rfq?.rfq_code ?? assignment.rfq}</p>
        </div>
        <span
          className={classNames(
            "inline-flex items-center gap-1 rounded-full text-xs font-medium px-2.5 py-1 whitespace-nowrap shrink-0",
            statusStyles.amber.container,
          )}
        >
          <ClockCircleOutlined className="text-[12px]" />
          {deadlineLabel(rfq?.delivery_deadline)}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-start gap-4">
        <RouteBox rfq={rfq} />
      </div>

      {transaction && <Stepper status={transaction.shipment_status} />}
      {!transaction && (
        <p className="text-xs text-[#8b93a1] mt-4">Escrow/transaction record not created for this RFQ yet.</p>
      )}

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 rounded-[12px] bg-[#f9fafc] border border-[#edf1f7] p-4">
        <InfoTile icon={<UserOutlined />} label="Driver" value="Not assigned yet" muted />
        <InfoTile icon={<CarOutlined />} label="Assigned Vehicle" value="Not assigned yet" muted />
        <InfoTile
          icon={<InboxOutlined />}
          label="Cargo"
          value={rfq?.mineral_type ? `${rfq.mineral_type}${rfq.total_weight ? ` · ${rfq.total_weight} MT` : ""}` : "Not set"}
        />
        <InfoTile icon={<CalendarOutlined />} label="Delivery Window" value={formatDate(rfq?.delivery_deadline)} />
      </div>

      {timelineOpen && <TimelinePanel assignment={assignment} rfq={rfq} />}

      <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-[#edf1f7]">
        <div className="flex items-center gap-2 text-xs text-[#8b93a1]">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f4f6f9] text-[#8b93a1]">
            <UserOutlined />
          </span>
          Miner details unavailable
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTimelineOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#dbe0ea] text-[#293041] hover:bg-[#f9fafc]"
          >
            <HistoryOutlined /> {timelineOpen ? "Hide Timeline" : "Open Timeline"}
          </button>
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#dbe0ea] text-[#293041] hover:bg-[#f9fafc]"
          >
            <FileTextOutlined /> View Job Details
          </button>
          {nextAction ? (
            <button
              type="button"
              disabled={advance.isPending}
              onClick={() => advance.mutate(nextAction.next)}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#101e3d] text-white hover:bg-[#182a52] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {nextAction.icon} {nextAction.label}
            </button>
          ) : (
            <span className="text-xs px-3 py-1.5 rounded-lg bg-[#f4f6f9] text-[#8b93a1]">
              {transaction?.shipment_status === "delivered" ? "Delivered" : "No action available"}
            </span>
          )}
        </div>
      </div>

      <JobDetailsPanel
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        assignment={assignment}
        rfq={rfq}
      />
    </div>
  );
}

const STATUS_FILTERS: { value: ShipmentStatus | ""; label: string }[] = [
  { value: "", label: "Job status: All" },
  { value: "assigned", label: "Awaiting Pickup" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AssignedJobsView() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "">("");
  const [completedRange, setCompletedRange] = useState<"month" | "all">("month");
  const { data: rfqs, isLoading: rfqsLoading, isError: rfqsError } = useLogisticsRfqs();
  const {
    data: assignments,
    isLoading: assignmentsLoading,
    isError: assignmentsError,
  } = useRfqAssignments();

  const activeAssignments = useMemo(
    () => (assignments ?? []).filter((a) => a.status === "accepted" || a.status === "in_progress" || a.status === "completed"),
    [assignments],
  );

  const rfqById = useMemo(() => {
    const map = new Map<string, Rfq>();
    (rfqs ?? []).forEach((r) => map.set(r.id, r));
    return map;
  }, [rfqs]);

  const filtered = useMemo(() => {
    let list = activeAssignments;
    if (statusFilter) {
      list = list.filter((a) => rfqById.get(a.rfq)?.transaction?.shipment_status === statusFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((a) => {
        const rfq = rfqById.get(a.rfq);
        return (
          rfq?.rfq_code?.toLowerCase().includes(q) ||
          rfq?.mineral_type?.toLowerCase().includes(q) ||
          rfq?.destination?.toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [activeAssignments, rfqById, query, statusFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const shipments = activeAssignments.map((a) => ({
      status: rfqById.get(a.rfq)?.transaction?.shipment_status,
      updatedAt: rfqById.get(a.rfq)?.transaction?.updated_at,
    }));
    const completed = shipments.filter((s) => {
      if (s.status !== "delivered") return false;
      if (completedRange === "all") return true;
      if (!s.updatedAt) return false;
      const d = new Date(s.updatedAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    return [
      { icon: ThunderboltOutlined, label: "Active Jobs", value: activeAssignments.length, caption: "Currently being executed" },
      {
        icon: InboxOutlined,
        label: "Awaiting Pickup",
        value: shipments.filter((s) => s.status === "assigned").length,
        caption: "Ready for vehicle dispatch",
      },
      {
        icon: CarOutlined,
        label: "In Transit",
        value: shipments.filter((s) => s.status === "in_transit").length,
        caption: "Cargo currently moving",
      },
      { icon: CheckCircleOutlined, label: "Completed", value: completed.length, caption: "Successfully delivered" },
    ];
  }, [activeAssignments, rfqById, completedRange]);

  const isLoading = rfqsLoading || assignmentsLoading;
  const isError = rfqsError || assignmentsError;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[#172554]">Assigned Jobs</h1>
        <p className="text-sm text-[#8b93a1] mt-1">
          Manage transport assignments, monitor delivery progress, coordinate fleet activity, and complete
          deliveries.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]"
          >
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-[#e9f0ff] flex items-center justify-center text-[#101e3d]">
                <s.icon className="text-[15px]" />
              </span>
              {s.label === "Completed" && (
                <select
                  value={completedRange}
                  onChange={(e) => setCompletedRange(e.target.value as "month" | "all")}
                  className="text-[11px] text-[#8b93a1] bg-transparent outline-none"
                >
                  <option value="month">This month</option>
                  <option value="all">All time</option>
                </select>
              )}
            </div>
            <div className="text-sm text-[#6f7786] mt-3">{s.label}</div>
            <div className="text-2xl font-semibold text-[#172554] mt-1">{s.value}</div>
            <div className="text-xs text-[#8b93a1] mt-1">{s.caption}</div>
          </div>
        ))}
      </div>

      <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-4 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Job ID, mineral, location..."
          className="flex-1 min-w-[220px] bg-[#f9fafc] border border-[#e4e9f2] rounded-lg px-3 py-2 text-sm text-[#293041] placeholder:text-[#8b93a1] outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ShipmentStatus | "")}
          className="bg-[#f9fafc] border border-[#e4e9f2] rounded-lg px-3 py-2 text-sm text-[#293041] outline-none"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <span
          title="No driver records exist on the backend yet"
          className="text-xs px-3 py-2 rounded-lg border border-dashed border-[#e4e9f2] text-[#b7bec9] cursor-not-allowed select-none"
        >
          Driver (not available)
        </span>
        <span
          title="No vehicle records exist on the backend yet"
          className="text-xs px-3 py-2 rounded-lg border border-dashed border-[#e4e9f2] text-[#b7bec9] cursor-not-allowed select-none"
        >
          Vehicle (not available)
        </span>
        {(query || statusFilter) && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatusFilter("");
            }}
            className="text-xs text-[#101e3d] underline underline-offset-2"
          >
            Clear Filters
          </button>
        )}
        <button
          type="button"
          className="ml-auto inline-flex items-center rounded-lg bg-[#101e3d] px-4 py-2 text-xs font-semibold text-white hover:bg-[#182a52]"
        >
          Apply Filters
        </button>
      </div>

      {isLoading && (
        <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-10 text-center text-[#8b93a1]">
          Loading assigned jobs...
        </div>
      )}

      {isError && !isLoading && (
        <div className="rounded-[16px] border border-[#f7d6d7] bg-[#ffeff0] p-6 text-center text-[#ef2f32] text-sm">
          Could not load assigned jobs. Log in as a logistics partner and try again.
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-10 text-center text-[#8b93a1]">
          No assigned jobs yet. Accepted opportunities will appear here.
        </div>
      )}

      <div className="space-y-5">
        {filtered.map((assignment) => (
          <JobCard key={assignment.id} assignment={assignment} rfq={rfqById.get(assignment.rfq)} />
        ))}
      </div>
    </div>
  );
}
