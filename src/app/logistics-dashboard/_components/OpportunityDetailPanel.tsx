"use client";

import { ClockCircleOutlined, CheckOutlined, WarningOutlined } from "@ant-design/icons";
import { classNames, statusStyles } from "@/src/features/compliance/dashboard/lib/style";
import { Opportunity } from "./data";
import SlideOver from "./SlideOver";

function severityStyle(severity: Opportunity["severity"]) {
  if (severity === "High") return statusStyles.red;
  if (severity === "Medium") return statusStyles.amber;
  return statusStyles.slate;
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
              <span
                className={classNames(
                  "text-[11px] font-medium px-2 py-0.5 rounded-full",
                  severityStyle(opportunity.severity).container,
                )}
              >
                {opportunity.severity}
              </span>
              <span className="text-xs text-[#8b93a1]">{opportunity.id}</span>
            </div>

            <h2 className="text-lg font-semibold text-[#172554]">
              {opportunity.cargo}, {opportunity.weight}
            </h2>
            <p className="text-sm text-[#8b93a1] mt-1">
              {opportunity.route.replace(" → ", " to ")} · {opportunity.distanceKm}
            </p>

            <div className="flex items-center gap-2 mt-4 bg-[#fff4df] border border-[#f6e3bf] text-[#e09408] text-sm rounded-lg px-3 py-2.5">
              <ClockCircleOutlined className="shrink-0" />
              <span className="font-medium">Response deadline: {opportunity.deadlineRemaining}</span>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-4 mt-5 text-sm">
              <div>
                <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Shipper</div>
                <div className="text-[#293041] mt-0.5">{opportunity.shipper}</div>
              </div>
              <div>
                <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Cargo Type</div>
                <div className="text-[#293041] mt-0.5">{opportunity.cargoType}</div>
              </div>
              <div>
                <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Total Weight</div>
                <div className="text-[#293041] mt-0.5">{opportunity.totalWeight}</div>
              </div>
              <div>
                <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Vehicles Required</div>
                <div className="text-[#293041] mt-0.5">{opportunity.vehiclesRequired}</div>
              </div>
              <div>
                <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Pickup Window</div>
                <div className="text-[#293041] mt-0.5">{opportunity.pickupWindow}</div>
              </div>
              <div>
                <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Delivery Deadline</div>
                <div className="text-[#293041] mt-0.5">{opportunity.deliveryDeadline}</div>
              </div>
              <div>
                <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Escort Required</div>
                <div className="text-[#293041] mt-0.5">{opportunity.escortRequired}</div>
              </div>
              <div>
                <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide">Estimated Value</div>
                <div className="text-[#293041] mt-0.5">{opportunity.estimatedValue}</div>
              </div>
            </div>

            <hr className="my-5 border-[#edf1f7]" />

            <div>
              <h3 className="text-sm font-medium text-[#172554] mb-3">Requirements</h3>
              <div className="space-y-2.5">
                {opportunity.requirements.map((r) => (
                  <div key={r.label} className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={classNames(
                          "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                          r.met ? "text-[#1ea43b]" : "text-[#e09408]",
                        )}
                      >
                        {r.met ? <CheckOutlined className="text-[12px]" /> : <WarningOutlined className="text-[12px]" />}
                      </span>
                      <span className="text-[#3b4253]">{r.label}</span>
                    </div>
                    <span
                      className={classNames(
                        "text-xs font-medium shrink-0",
                        r.met ? "text-[#1ea43b]" : "text-[#e09408]",
                      )}
                    >
                      {r.met ? "Met" : "Action needed"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 bg-[#f9fafc] rounded-lg p-4">
              <div className="text-[11px] text-[#8b93a1] uppercase tracking-wide mb-1.5">Payment Terms</div>
              <p className="text-sm text-[#6f7786] leading-relaxed">{opportunity.paymentTerms}</p>
            </div>
          </div>

          <div className="border-t border-[#edf1f7] p-4 flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#dbe0ea] text-sm text-[#293041] hover:bg-[#f9fafc]"
            >
              Close
            </button>
            <button className="px-4 py-2 rounded-lg border border-[#dbe0ea] text-sm text-[#293041] hover:bg-[#f9fafc]">
              Ask Question
            </button>
            <button
              onClick={() => onSubmitInterest(opportunity)}
              className="ml-auto px-4 py-2 rounded-lg bg-[#101e3d] text-white text-sm font-medium hover:bg-[#182a52]"
            >
              Submit Interest
            </button>
          </div>
        </>
      )}
    </SlideOver>
  );
}
