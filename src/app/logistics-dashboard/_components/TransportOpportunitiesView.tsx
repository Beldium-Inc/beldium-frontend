"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClockCircleOutlined, EnvironmentOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { classNames, statusStyles } from "@/src/features/compliance/dashboard/lib/style";
import { showToast } from "@/src/store/toast.store";
import { getApiErrorMessage, updateRfqAssignmentStatus } from "./api";
import { useLogisticsRfqs, useRfqAssignments } from "./useLogisticsData";
import type { Rfq, RfqAssignment } from "./types";

function formatDate(value: string | null) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
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

  return (
    <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#172554]">{rfq?.mineral_type ?? "Mineral transport"}</h3>
            <span
              className={classNames(
                "text-[11px] font-medium px-2 py-0.5 rounded-full",
                statusStyles.slate.container,
              )}
            >
              {rfq?.rfq_code ?? assignment.rfq}
            </span>
          </div>
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
          Awaiting your response
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

  const filtered = useMemo(() => {
    if (!query.trim()) return pendingAssignments;
    const q = query.toLowerCase();
    return pendingAssignments.filter((a) => {
      const rfq = rfqById.get(a.rfq);
      return (
        rfq?.rfq_code?.toLowerCase().includes(q) ||
        rfq?.mineral_type?.toLowerCase().includes(q) ||
        rfq?.destination?.toLowerCase().includes(q) ||
        rfq?.pickup_location?.toLowerCase().includes(q)
      );
    });
  }, [pendingAssignments, rfqById, query]);

  const isLoading = rfqsLoading || assignmentsLoading;
  const isError = rfqsError || assignmentsError;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[#172554]">Transport Opportunities</h1>
        <p className="text-sm text-[#8b93a1] mt-1">
          RFQs routed to you for logistics that are awaiting your accept or decline response.
        </p>
      </div>

      <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-4 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search RFQ code, mineral, origin, destination..."
          className="flex-1 min-w-[220px] bg-[#f9fafc] border border-[#e4e9f2] rounded-lg px-3 py-2 text-sm text-[#293041] placeholder:text-[#8b93a1] outline-none"
        />
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
