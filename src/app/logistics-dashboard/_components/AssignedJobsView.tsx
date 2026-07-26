"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EnvironmentOutlined, TruckOutlined } from "@ant-design/icons";
import { classNames, statusStyles } from "@/src/features/compliance/dashboard/lib/style";
import { showToast } from "@/src/store/toast.store";
import { getApiErrorMessage, updateShipmentStatus } from "./api";
import { useLogisticsRfqs, useRfqAssignments } from "./useLogisticsData";
import type { Rfq, RfqAssignment, ShipmentStatus } from "./types";

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

function JobCard({ assignment, rfq }: { assignment: RfqAssignment; rfq: Rfq | undefined }) {
  const queryClient = useQueryClient();
  const transaction = rfq?.transaction ?? null;
  const pill = shipmentPill(transaction?.shipment_status);

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

  return (
    <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(16,30,61,0.12)]">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#172554]">{rfq?.mineral_type ?? "Mineral transport"}</h3>
            <span className={classNames("text-[11px] font-medium px-2 py-0.5 rounded-full", pill.container)}>
              {shipmentLabel(transaction?.shipment_status)}
            </span>
          </div>
          <p className="text-xs text-[#8b93a1] mt-0.5">
            {rfq?.rfq_code ?? assignment.rfq} · {rfq?.pickup_location ?? "Origin not specified"}{" "}
            <EnvironmentOutlined className="mx-1" />
            {rfq?.destination ?? "Destination not specified"}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[11px] text-[#8b93a1]">Assignment Status</div>
          <div className="text-sm font-medium text-[#293041] capitalize">{assignment.status.replace("_", " ")}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
        <div>
          <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Total Weight</div>
          <div className="text-[#293041] mt-0.5">{rfq?.total_weight ? `${rfq.total_weight} MT` : "Not set"}</div>
        </div>
        <div>
          <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Job Value</div>
          <div className="text-[#293041] mt-0.5">
            {transaction?.total_value ? `₦${Number(transaction.total_value).toLocaleString("en-NG")}` : "Not set"}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Escrow Status</div>
          <div className="text-[#293041] mt-0.5">{transaction?.escrow_status ?? "Not set"}</div>
        </div>
        <div>
          <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Final Status</div>
          <div className="text-[#293041] mt-0.5 capitalize">
            {transaction?.final_status?.replace("_", " ") ?? "Not set"}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-[#edf1f7]">
        {!transaction && (
          <span className="text-xs text-[#8b93a1] mr-auto">
            Escrow/transaction record not created for this RFQ yet.
          </span>
        )}
        <button
          type="button"
          disabled={!transaction || transaction.shipment_status !== "assigned" || advance.isPending}
          onClick={() => advance.mutate("in_transit")}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#dbe0ea] text-[#293041] hover:bg-[#f9fafc] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <TruckOutlined /> Mark In Transit
        </button>
        <button
          type="button"
          disabled={!transaction || transaction.shipment_status !== "in_transit" || advance.isPending}
          onClick={() => advance.mutate("delivered")}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#101e3d] text-white hover:bg-[#182a52] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Mark Delivered
        </button>
      </div>
    </div>
  );
}

export default function AssignedJobsView() {
  const [query, setQuery] = useState("");
  const { data: rfqs, isLoading: rfqsLoading, isError: rfqsError } = useLogisticsRfqs();
  const {
    data: assignments,
    isLoading: assignmentsLoading,
    isError: assignmentsError,
  } = useRfqAssignments();

  const activeAssignments = useMemo(
    () => (assignments ?? []).filter((a) => a.status === "accepted" || a.status === "in_progress"),
    [assignments],
  );

  const rfqById = useMemo(() => {
    const map = new Map<string, Rfq>();
    (rfqs ?? []).forEach((r) => map.set(r.id, r));
    return map;
  }, [rfqs]);

  const filtered = useMemo(() => {
    if (!query.trim()) return activeAssignments;
    const q = query.toLowerCase();
    return activeAssignments.filter((a) => {
      const rfq = rfqById.get(a.rfq);
      return (
        rfq?.rfq_code?.toLowerCase().includes(q) ||
        rfq?.mineral_type?.toLowerCase().includes(q) ||
        rfq?.destination?.toLowerCase().includes(q)
      );
    });
  }, [activeAssignments, rfqById, query]);

  const isLoading = rfqsLoading || assignmentsLoading;
  const isError = rfqsError || assignmentsError;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[#172554]">Assigned Jobs</h1>
        <p className="text-sm text-[#8b93a1] mt-1">
          Jobs you have accepted, and their live shipment status from escrow.
        </p>
      </div>

      <div className="rounded-[16px] border border-[#e8ecf4] bg-white p-4 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search RFQ code, mineral, destination..."
          className="flex-1 min-w-[220px] bg-[#f9fafc] border border-[#e4e9f2] rounded-lg px-3 py-2 text-sm text-[#293041] placeholder:text-[#8b93a1] outline-none"
        />
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
