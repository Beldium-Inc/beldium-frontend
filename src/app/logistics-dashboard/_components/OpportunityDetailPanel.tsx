"use client";

import { Opportunity } from "./data";
import SlideOver from "./SlideOver";
import { IconClock, IconCheck, IconWarning } from "./icons";

function severityBadge(severity: Opportunity["severity"]) {
  if (severity === "High") return "bg-red-50 text-red-600";
  if (severity === "Medium") return "bg-amber-50 text-amber-600";
  return "bg-gray-100 text-gray-600";
}

export default function OpportunityDetailPanel({
  opportunity,
  onClose,
  onSubmitInterest,
}: {
  opportunity: Opportunity | null;
  onClose: () => void;
  onSubmitInterest: (opp: Opportunity) => void;
}) {
  return (
    <SlideOver open={!!opportunity} onClose={onClose}>
      {opportunity && (
        <>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${severityBadge(opportunity.severity)}`}>
                {opportunity.severity}
              </span>
              <span className="text-xs text-gray-400">{opportunity.id}</span>
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              {opportunity.cargo} — {opportunity.weight}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {opportunity.route.replace(" → ", "→")} · {opportunity.distanceKm}
            </p>

            <div className="flex items-center gap-2 mt-4 bg-amber-50 border border-amber-100 text-amber-700 text-sm rounded-lg px-3 py-2.5">
              <IconClock className="w-4 h-4 shrink-0" />
              <span className="font-medium">
                Response deadline — {opportunity.deadlineRemaining}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-4 mt-5 text-sm">
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">Shipper</div>
                <div className="text-gray-800 mt-0.5">{opportunity.shipper}</div>
              </div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">Cargo Type</div>
                <div className="text-gray-800 mt-0.5">{opportunity.cargoType}</div>
              </div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">Total Weight</div>
                <div className="text-gray-800 mt-0.5">{opportunity.totalWeight}</div>
              </div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">Vehicles Required</div>
                <div className="text-gray-800 mt-0.5">{opportunity.vehiclesRequired}</div>
              </div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">Pickup Window</div>
                <div className="text-gray-800 mt-0.5">{opportunity.pickupWindow}</div>
              </div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">Delivery Deadline</div>
                <div className="text-gray-800 mt-0.5">{opportunity.deliveryDeadline}</div>
              </div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">Escort Required</div>
                <div className="text-gray-800 mt-0.5">{opportunity.escortRequired}</div>
              </div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">Estimated Value</div>
                <div className="text-gray-800 mt-0.5">{opportunity.estimatedValue}</div>
              </div>
            </div>

            <hr className="my-5 border-gray-100" />

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Requirements</h3>
              <div className="space-y-2.5">
                {opportunity.requirements.map((r) => (
                  <div key={r.label} className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                          r.met ? "text-green-600" : "text-orange-500"
                        }`}
                      >
                        {r.met ? <IconCheck className="w-3.5 h-3.5" /> : <IconWarning className="w-3.5 h-3.5" />}
                      </span>
                      <span className="text-gray-700">{r.label}</span>
                    </div>
                    <span
                      className={`text-xs font-medium shrink-0 ${r.met ? "text-green-600" : "text-orange-500"}`}
                    >
                      {r.met ? "Met" : "Action needed"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 bg-gray-50 rounded-lg p-4">
              <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-1.5">Payment Terms</div>
              <p className="text-sm text-gray-600 leading-relaxed">{opportunity.paymentTerms}</p>
            </div>
          </div>

          <div className="border-t border-gray-100 p-4 flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">
              Ask Question
            </button>
            <button
              onClick={() => onSubmitInterest(opportunity)}
              className="ml-auto px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
            >
              Submit Interest
            </button>
          </div>
        </>
      )}
    </SlideOver>
  );
}
