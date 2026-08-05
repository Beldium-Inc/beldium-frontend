"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  CheckOutlined,
  CloseOutlined,
  InboxOutlined,
  FieldTimeOutlined,
  AimOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import { classNames, statusStyles } from "@/src/features/compliance/dashboard/lib/style";
import { showToast } from "@/src/store/toast.store";
import { getApiErrorMessage, updateRfqAssignmentStatus } from "./api";
import { useLogisticsRfqs, useRfqAssignments } from "./useLogisticsData";
import type { Rfq, RfqAssignment } from "./types";

function formatDate(value: string | null) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// Hours remaining until an RFQ's delivery_deadline. Returns null when the
// deadline is missing (nothing to compute) rather than fabricating a number.
function hoursRemaining(deadline: string | null | undefined) {
  if (!deadline) return null;
  const diffMs = new Date(deadline).getTime() - Date.now();
  return diffMs / (1000 * 60 * 60);
}

function deadlineLabel(deadline: string | null | undefined) {
  const hours = hoursRemaining(deadline);
  if (hours === null) return "No deadline set";
  if (hours <= 0) return "Deadline passed";
  if (hours < 48) return `${Math.round(hours)} Hour${Math.round(hours) === 1 ? "" : "s"} Remaining`;
  return `${Math.round(hours / 24)} Days Remaining`;
}

// Priority pill derived from real urgency (time to deadline), not a
// fabricated backend field.
function priorityFromDeadline(deadline: string | null | undefined) {
  const hours = hoursRemaining(deadline);
  if (hours === null) return null;
  if (hours <= 12) return { label: "High Priority", tone: statusStyles.red };
  if (hours <= 48) return { label: "Medium Priority", tone: statusStyles.amber };
  return null;
}

function OpportunityCard({
  assignment,
  rfq,
}: {
  assignment: RfqAssignment;
  rfq: Rfq | undefined;
}) {
  const queryClient = useQueryClient();

  const respond = useMutation({
    mutationFn: (status: "accepted" | "rejected") =>
      updateRfqAssignmentStatus({ assignmentId: assignment.id, status }),
    onSuccess: (_data, status) => {
      showToast(
        status === "accepted" ? "Job accepted. It now appears under Assigned Jobs." : "Job declined.",
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["logistics"] });
    },
    onError: (error) => {
      showToast(getApiErrorMessage(error, "Could not update this opportunity."), "error");
    },
  });

  const priority = priorityFromDeadline(rfq?.delivery_deadline);

  return (
    <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[#172554]">
              {rfq?.mineral_type ? `${rfq.mineral_type} Transport` : "Mineral Transport"}
            </h3>
            {priority && (
              <span
                className={classNames(
                  "text-[11px] font-medium px-2 py-0.5 rounded-full",
                  priority.tone.container,
                )}
              >
                {priority.label}
              </span>
            )}
          </div>
          <p className="text-xs text-[#8b93a1] mt-0.5">{rfq?.rfq_code ?? assignment.rfq}</p>
          <p className="text-xs text-[#8b93a1] mt-0.5">
            {rfq?.pickup_location ?? "Origin not specified"} <EnvironmentOutlined className="mx-1" />
            {rfq?.destination ?? "Destination not specified"}
          </p>
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
        <div>
          <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Total Weight</div>
          <div className="text-[#293041] mt-0.5">{rfq?.total_weight ? `${rfq.total_weight} MT` : "Not set"}</div>
        </div>
        <div>
          <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Incoterm</div>
          <div className="text-[#293041] mt-0.5">{rfq?.incoterm ?? "Not set"}</div>
        </div>
        <div>
          <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Delivery Deadline</div>
          <div className="text-[#293041] mt-0.5">{formatDate(rfq?.delivery_deadline ?? null)}</div>
        </div>
        <div>
          <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Pricing</div>
          <div className="text-[#293041] mt-0.5">{rfq?.pricing_structure ?? "Not set"}</div>
        </div>
      </div>

      {rfq?.fleet_requirements && (
        <p className="text-xs text-[#6f7786] mt-3">Fleet requirements: {rfq.fleet_requirements}</p>
      )}

      <div className="flex items-center justify-end gap-2 mt-4">
        <button
          type="button"
          disabled={respond.isPending}
          onClick={() => respond.mutate("rejected")}
          className="inline-flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-lg border border-[#f7d6d7] text-[#ef2f32] hover:bg-[#fff5f5] disabled:opacity-60"
        >
          <CloseOutlined /> Decline
        </button>
        <button
          type="button"
          disabled={respond.isPending}
          onClick={() => respond.mutate("accepted")}
          className="inline-flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-lg bg-[#101e3d] text-white hover:bg-[#182a52] disabled:opacity-60"
        >
          <CheckOutlined /> Accept Job
        </button>
      </div>
    </div>
  );
}

export default function TransportOpportunitiesView() {
  const [query, setQuery] = useState("");
  const [originState, setOriginState] = useState("");
  const { data: rfqs, isLoading: rfqsLoading, isError: rfqsError } = useLogisticsRfqs();
  const {
    data: assignments,
    isLoading: assignmentsLoading,
    isError: assignmentsError,
  } = useRfqAssignments();

  const pendingAssignments = useMemo(
    () => (assignments ?? []).filter((a) => a.status === "pending"),
    [assignments],
  );

  const rfqById = useMemo(() => {
    const map = new Map<string, Rfq>();
    (rfqs ?? []).forEach((r) => map.set(r.id, r));
    return map;
  }, [rfqs]);

  // Origins are free-text pickup_location strings on the RFQ, so this is a
  // real, backend-derived list rather than a fixed dropdown of states.
  const originOptions = useMemo(() => {
    const set = new Set<string>();
    pendingAssignments.forEach((a) => {
      const loc = rfqById.get(a.rfq)?.pickup_location;
      if (loc) set.add(loc);
    });
    return Array.from(set).sort();
  }, [pendingAssignments, rfqById]);

  const filtered = useMemo(() => {
    let list = pendingAssignments;
    if (originState) {
      list = list.filter((a) => rfqById.get(a.rfq)?.pickup_location === originState);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((a) => {
        const rfq = rfqById.get(a.rfq);
        return (
          rfq?.rfq_code?.toLowerCase().includes(q) ||
          rfq?.mineral_type?.toLowerCase().includes(q) ||
          rfq?.destination?.toLowerCase().includes(q) ||
          rfq?.pickup_location?.toLowerCase().includes(q)
        );
      });
    }
    // Sort by closing soonest first (real delivery_deadline field).
    return [...list].sort((a, b) => {
      const da = rfqById.get(a.rfq)?.delivery_deadline;
      const db = rfqById.get(b.rfq)?.delivery_deadline;
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return new Date(da).getTime() - new Date(db).getTime();
    });
  }, [pendingAssignments, rfqById, query, originState]);

  const closingSoonCount = useMemo(
    () =>
      pendingAssignments.filter((a) => {
        const hours = hoursRemaining(rfqById.get(a.rfq)?.delivery_deadline);
        return hours !== null && hours > 0 && hours <= 12;
      }).length,
    [pendingAssignments, rfqById],
  );

  // "Best Fleet Matches" and "Submitted Interests" have no backend concept
  // (no fleet-compatibility scoring, no submit-interest endpoint). Rather
  // than invent numbers, these cards are relabeled to real, honest metrics.
  const stats = [
    {
      icon: InboxOutlined,
      label: "Open Opportunities",
      value: String(pendingAssignments.length),
      caption: "Available transport jobs",
    },
    {
      icon: FieldTimeOutlined,
      label: "Closing Soon",
      value: String(closingSoonCount),
      caption: "Response deadline within 12 hours",
    },
    {
      icon: AimOutlined,
      label: "Fleet Matches",
      value: "—",
      caption: "Fleet matching not available yet",
    },
    {
      icon: FileSearchOutlined,
      label: "Submitted Interests",
      value: "—",
      caption: "Submit Interest isn't connected to the backend yet",
    },
  ];

  const isLoading = rfqsLoading || assignmentsLoading;
  const isError = rfqsError || assignmentsError;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[#172554]">Transport Opportunities</h1>
        <p className="text-sm text-[#8b93a1] mt-1">
          Browse transport opportunities that match your fleet, operating regions, and delivery capabilities.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]"
          >
            <span className="w-8 h-8 rounded-lg bg-[#e9f0ff] flex items-center justify-center text-[#101e3d] mb-3">
              <s.icon className="text-[15px]" />
            </span>
            <div className="text-sm text-[#6f7786]">{s.label}</div>
            <div className="text-2xl font-semibold text-[#172554] mt-1">{s.value}</div>
            <div className="text-xs text-[#8b93a1] mt-1">{s.caption}</div>
          </div>
        ))}
      </div>

      <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-4 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Job ID, mineral, buyer, location..."
          className="flex-1 min-w-[220px] bg-[#f9fafc] border border-[#e4e9f2] rounded-lg px-3 py-2 text-sm text-[#293041] placeholder:text-[#8b93a1] outline-none"
        />
        <select
          value={originState}
          onChange={(e) => setOriginState(e.target.value)}
          className="bg-[#f9fafc] border border-[#e4e9f2] rounded-lg px-3 py-2 text-sm text-[#293041] outline-none"
        >
          <option value="">Origin: All</option>
          {originOptions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <span
          title="RFQ has no structured vehicle-type field (fleet_requirements is free text)"
          className="text-xs px-3 py-2 rounded-lg border border-dashed border-[#e4e9f2] text-[#b7bec9] cursor-not-allowed select-none"
        >
          Vehicle Type (not available)
        </span>
        {originState && (
          <button
            type="button"
            onClick={() => setOriginState("")}
            className="text-xs text-[#101e3d] underline underline-offset-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      {isLoading && (
        <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-10 text-center text-[#8b93a1]">
          Loading opportunities...
        </div>
      )}

      {isError && !isLoading && (
        <div className="rounded-[16px] border border-[#f7d6d7] bg-[#ffeff0] p-6 text-center text-[#ef2f32] text-sm">
          Could not load transport opportunities. Log in as a logistics partner and try again.
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-10 text-center text-[#8b93a1]">
          No pending opportunities right now. New RFQs routed to you will appear here.
        </div>
      )}

      <div className="space-y-5">
        {filtered.map((assignment) => (
          <OpportunityCard key={assignment.id} assignment={assignment} rfq={rfqById.get(assignment.rfq)} />
        ))}
      </div>
    </div>
  );
}
