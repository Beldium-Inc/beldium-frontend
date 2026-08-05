"use client";

import { useMemo, useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { classNames, statusStyles } from "@/src/features/compliance/dashboard/lib/style";
import { showToast } from "@/src/store/toast.store";
import { AllocationVehicle, Opportunity, allocationVehicles } from "./data";

function statusStyle(status: AllocationVehicle["status"]) {
  switch (status) {
    case "Available":
      return statusStyles.green;
    case "On job":
      return statusStyles.slate;
    case "High":
      return statusStyles.amber;
    case "Unavailable":
      return statusStyles.slate;
  }
}

export default function SubmitInterestModal({
  opportunity,
  onClose,
}: {
  opportunity: Opportunity | null;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [rate, setRate] = useState("");
  const [validity, setValidity] = useState("");
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const requiredCount = useMemo(() => {
    if (!opportunity) return 0;
    const match = opportunity.vehicles.match(/\d+/);
    return match ? Number(match[0]) : 0;
  }, [opportunity]);

  if (!opportunity) return null;

  const toggle = (id: string, disabled: boolean) => {
    if (disabled) return;
    setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const canSubmit = confirmed && selected.length > 0 && rate.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#101e3d]/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl px-5 py-6 max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between p-5 border-b border-[#edf1f7]">
          <div>
            <h2 className="font-semibold text-[#172554]">Submit Interest</h2>
            <p className="text-xs text-[#8b93a1] mt-0.5">
              {opportunity.cargo} · {opportunity.route} · {opportunity.weight}
            </p>
            <p className="text-xs text-[#8b93a1] mt-1">
              Preview only: the backend routes logistics jobs automatically, there is no submit-interest endpoint yet.
            </p>
          </div>
          <button onClick={onClose} className="text-[#8b93a1] hover:text-[#4b5563]">
            <CloseOutlined className="text-[16px]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#293041]">
                Allocate vehicles <span className="text-[#ef2f32]">*</span>
              </label>
              <span className="text-xs text-[#8b93a1]">
                {requiredCount} {opportunity.vehicles.replace(/^\d+\s*/, "")} required · {selected.length} selected
              </span>
            </div>

            <div className="border border-[#e4e9f2] rounded-lg overflow-hidden">
              {allocationVehicles.map((v) => {
                const disabled = v.status === "On job" || v.status === "Unavailable";
                const pill = statusStyle(v.status);
                return (
                  <label
                    key={v.id}
                    className={classNames(
                      "flex items-center gap-3 px-3 py-2.5 border-b border-[#edf1f7] last:border-b-0 text-sm",
                      disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-[#f9fafc]",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(v.id)}
                      disabled={disabled}
                      onChange={() => toggle(v.id, disabled)}
                      className="w-4 h-4 rounded border-[#dbe0ea] accent-[#101E3D]"
                    />
                    <span className="font-medium text-[#293041] w-14">{v.id}</span>
                    <span className="text-[#6f7786] flex-1">{v.type}</span>
                    <span className="text-[#6f7786] w-14">{v.capacity}</span>
                    <span className={classNames("text-[11px] font-medium px-2 py-0.5 rounded-full", pill.container)}>
                      {v.status}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#293041]">
                Proposed rate (₦) <span className="text-[#ef2f32]">*</span>
              </label>
              <input
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="e.g. 9,200,000"
                className="mt-1.5 w-full border border-[#dbe0ea] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#101e3d]"
              />
              <p className="text-xs text-[#8b93a1] mt-1">Listed estimate: {opportunity.estValue}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#293041]">Validity Period</label>
              <input
                value={validity}
                onChange={(e) => setValidity(e.target.value)}
                placeholder="e.g. 12 Aug 2026"
                className="mt-1.5 w-full border border-[#dbe0ea] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#101e3d]"
              />
              <p className="text-xs text-[#8b93a1] mt-1">Window: {opportunity.pickupWindow}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#293041]">Note to shipper, optional</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Available details, route experience, special handling capability..."
              rows={3}
              className="mt-1.5 w-full border border-[#dbe0ea] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#101e3d] resize-none"
            />
          </div>

          <label className="flex items-start gap-2.5 text-sm text-[#6f7786] cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-[#dbe0ea] accent-[#101E3D] shrink-0"
            />
            I confirm the allocated vehicles hold valid insurance and roadworthiness certificates, and I accept the
            platform&apos;s transport terms for this job.
          </label>
        </div>

        <div className="flex items-center justify-between gap-3 p-5 border-t border-[#edf1f7]">
          <p className="text-xs text-[#8b93a1]">Interest is binding once accepted by the shipper.</p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#dbe0ea] text-sm text-[#293041] hover:bg-[#f9fafc]"
            >
              Cancel
            </button>
            <button
              disabled={!canSubmit}
              onClick={() => {
                showToast("Submit interest is not connected to the backend yet.", "info");
                onClose();
              }}
              className={classNames(
                "px-4 py-2 rounded-lg text-sm font-medium",
                canSubmit
                  ? "bg-[#101e3d] !text-white hover:bg-[#182a52]"
                  : "bg-[#e5e8ef] text-[#9ca3af] cursor-not-allowed",
              )}
            >
              Submit Interest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
