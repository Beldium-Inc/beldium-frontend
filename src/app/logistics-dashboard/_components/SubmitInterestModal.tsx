"use client";

import { useMemo, useState } from "react";
import { AllocationVehicle, Opportunity, allocationVehicles } from "./data";
import { IconClose } from "./icons";

function statusBadge(status: AllocationVehicle["status"]) {
  switch (status) {
    case "Available":
      return "bg-green-50 text-green-600";
    case "On job":
      return "bg-gray-100 text-gray-500";
    case "High":
      return "bg-amber-50 text-amber-600";
    case "Unavailable":
      return "bg-gray-100 text-gray-400";
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
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Submit Interest</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {opportunity.cargo} · {opportunity.route} · {opportunity.weight}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-800">
                Allocate vehicles <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-400">
                {requiredCount} {opportunity.vehicles.replace(/^\d+\s*/, "")} required · {selected.length} selected
              </span>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {allocationVehicles.map((v) => {
                const disabled = v.status === "On job" || v.status === "Unavailable";
                return (
                  <label
                    key={v.id}
                    className={`flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 last:border-b-0 text-sm ${
                      disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(v.id)}
                      disabled={disabled}
                      onChange={() => toggle(v.id, disabled)}
                      className="w-4 h-4 rounded border-gray-300 accent-[#101E3D]"
                    />
                    <span className="font-medium text-gray-800 w-14">{v.id}</span>
                    <span className="text-gray-500 flex-1">{v.type}</span>
                    <span className="text-gray-500 w-14">{v.capacity}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusBadge(v.status)}`}>
                      {v.status}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-800">
                Proposed rate (₦) <span className="text-red-500">*</span>
              </label>
              <input
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="e.g. 9,200,000"
                className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <p className="text-xs text-gray-400 mt-1">Listed estimate: {opportunity.estValue}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Validity Period (years)</label>
              <input
                value={validity}
                onChange={(e) => setValidity(e.target.value)}
                placeholder="e.g. 12 Aug 2026"
                className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <p className="text-xs text-gray-400 mt-1">Window: {opportunity.pickupWindow}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-800">Note to shipper · optional</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Available details, route experience, special handling capability..."
              rows={3}
              className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none"
            />
          </div>

          <label className="flex items-start gap-2.5 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-gray-300 accent-[#101E3D] shrink-0"
            />
            I confirm the allocated vehicles hold valid insurance and roadworthiness certificates, and I accept the
            platform&apos;s transport terms for this job.
          </label>
        </div>

        <div className="flex items-center justify-between gap-3 p-5 border-t border-gray-100">
          <p className="text-xs text-gray-400">Interest is binding once accepted by the shipper.</p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              disabled={!canSubmit}
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                canSubmit
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Submit Interest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
